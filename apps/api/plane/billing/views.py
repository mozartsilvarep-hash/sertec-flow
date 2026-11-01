import os
import re
from decimal import Decimal
from zoneinfo import ZoneInfo
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView
from plane.authentication.session import BaseSessionAuthentication
from .permissions import BillingAdminPermission
from .domain import PLANS, valid_signature
from .models import Customer, Order, Payment
from .provider import call, configured
from .services import access_until, start_checkout, sync_notification


class CheckoutThrottle(UserRateThrottle):
    rate = "6/hour"


class BillingSessionAuthentication(BaseSessionAuthentication):
    def authenticate_header(self, request):
        return "Session"


class BillingView(APIView):
    authentication_classes = [BillingSessionAuthentication]
    permission_classes = [IsAuthenticated]


def payment_json(payment):
    return {
        "id": payment.provider_id,
        "plan": payment.order.plan,
        "method": payment.order.method,
        "amount": str(payment.amount),
        "refunded_amount": str(payment.refunded_amount),
        "status": payment.status,
        "paid_at": payment.paid_at,
        "access_until": payment.access_until,
    }


class CatalogView(BillingView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"plans": [{"id": key, **value} for key, value in PLANS.items()], "checkout_ready": configured()}
        )


class AccountView(BillingView):
    def get(self, request):
        customer = Customer.objects.filter(user=request.user).first()
        until = access_until(customer) if customer else None
        active = bool(until and until > timezone.now())
        orders = Order.objects.filter(customer=customer).order_by("-created_at") if customer else Order.objects.none()
        payments = Payment.objects.filter(order__customer=customer).select_related("order").order_by("-paid_at")[:50]
        recurring = orders.filter(method="card", status__in=["pending", "authorized", "paused"]).first()
        slug = None
        if customer and customer.workspace_id:
            from plane.db.models import Workspace

            slug = (
                Workspace.objects.filter(pk=customer.workspace_id, owner=request.user)
                .values_list("slug", flat=True)
                .first()
            )
        return Response(
            {
                "active": active,
                "access_until": until,
                "workspace_slug": slug,
                "require_subscription": os.environ.get("SERTEC_REQUIRE_SUBSCRIPTION", "0") == "1",
                "checkout_ready": configured(),
                "is_admin": BillingAdminPermission().has_permission(request, self),
                "payments": [payment_json(p) for p in payments],
                "recurring": {
                    "id": str(recurring.id),
                    "plan": recurring.plan,
                    "status": recurring.status,
                    "checkout_url": recurring.checkout_url,
                }
                if recurring
                else None,
            }
        )


class CheckoutView(BillingView):
    throttle_classes = [CheckoutThrottle]

    def post(self, request):
        if not isinstance(request.data, dict):
            return Response({"detail": "Informe plano e forma de pagamento."}, status=400)
        plan, method = request.data.get("plan"), request.data.get("method")
        if plan not in PLANS or method not in ("pix", "card"):
            return Response({"detail": "Selecione um plano e uma forma de pagamento válidos."}, status=400)
        if not configured():
            return Response({"detail": "O checkout ainda não foi configurado pelo administrador."}, status=503)
        customer, _ = Customer.objects.get_or_create(user=request.user)
        return Response({"url": start_checkout(customer, plan, method)}, status=201)


class CancelView(BillingView):
    def post(self, request):
        order = (
            Order.objects.filter(
                customer__user=request.user, method="card", status__in=["pending", "authorized", "paused"]
            )
            .order_by("-created_at")
            .first()
        )
        if not order or not order.provider_id:
            return Response({"detail": "Não há renovação automática para cancelar."}, status=400)
        call("PUT", f"/preapproval/{order.provider_id}", {"status": "cancelled"})
        Order.objects.filter(pk=order.pk).update(status="cancelled")
        return Response({"detail": "Renovação automática cancelada. O período já pago permanece disponível."})


class SalesView(BillingView):
    permission_classes = [IsAuthenticated, BillingAdminPermission]

    def get(self, request):
        now = timezone.localtime(timezone.now(), ZoneInfo("America/Bahia"))
        approved = Payment.objects.filter(status="approved", refunded_amount=0)
        month = approved.filter(paid_at__gte=now.replace(day=1, hour=0, minute=0, second=0, microsecond=0))
        customers = Customer.objects.select_related("user").order_by("-created_at")
        query = request.query_params.get("q", "")[:120].strip()
        if query:
            customers = customers.filter(Q(user__email__icontains=query) | Q(user__display_name__icontains=query))
        try:
            page = max(1, min(int(request.query_params.get("page", 1)), 100000))
        except (TypeError, ValueError):
            return Response({"detail": "Página inválida."}, status=400)
        rows = []
        for customer in customers[(page - 1) * 25 : page * 25]:
            until = access_until(customer)
            latest = customer.orders.order_by("-created_at").first()
            rows.append(
                {
                    "email": customer.user.email,
                    "name": customer.user.display_name or customer.user.first_name,
                    "active": bool(until and until > now),
                    "access_until": until,
                    "plan": latest.plan if latest else None,
                    "method": latest.method if latest else None,
                }
            )
        return Response(
            {
                "count": customers.count(),
                "page": page,
                "customers": rows,
                "active_customers": approved.filter(access_until__gt=now)
                .values("order__customer_id")
                .distinct()
                .count(),
                "revenue_month": str(month.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")),
                "payments_month": month.count(),
                "recent_payments": [
                    payment_json(p) for p in Payment.objects.select_related("order").order_by("-updated_at")[:20]
                ],
            }
        )


class WebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        data_id = request.query_params.get("data.id", "")
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", data_id):
            return Response(status=400)
        if not valid_signature(
            os.environ.get("MERCADOPAGO_WEBHOOK_SECRET", ""),
            request.headers.get("x-signature"),
            request.headers.get("x-request-id"),
            data_id,
        ):
            return Response(status=401)
        if not isinstance(request.data, dict):
            return Response(status=400)
        body_id = (request.data.get("data") or {}).get("id") if isinstance(request.data.get("data"), dict) else None
        if str(body_id) != data_id:
            return Response(status=400)
        sync_notification(request.data.get("type"), data_id)
        return Response({"received": True})
