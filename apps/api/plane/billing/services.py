import os
from decimal import Decimal
from uuid import UUID
from django.conf import settings
from django.db import transaction
from django.db.models import Max
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import ValidationError
from .domain import PLANS, add_months, valid_payment
from .models import Customer, Order, Payment
from .provider import call, safe_checkout, ProviderUnavailable


def access_until(customer):
    return Payment.objects.filter(order__customer=customer, status="approved", refunded_amount=0).aggregate(
        end=Max("access_until")
    )["end"]


def provision_workspace(customer):
    from plane.db.models import Profile, Workspace, WorkspaceMember

    workspace, _ = Workspace.objects.get_or_create(
        slug=f"pessoal-{str(customer.user_id).replace('-', '')[:32]}",
        defaults={"name": "Meu espaço", "owner_id": customer.user_id, "timezone": "America/Bahia"},
    )
    if workspace.owner_id != customer.user_id:
        raise ValidationError("Não foi possível configurar seu espaço privado.")
    WorkspaceMember.objects.get_or_create(workspace=workspace, member_id=customer.user_id, defaults={"role": 20})
    Profile.objects.filter(user_id=customer.user_id).update(
        is_onboarded=True,
        onboarding_step={
            "profile_complete": True,
            "workspace_create": True,
            "workspace_invite": True,
            "workspace_join": True,
        },
    )
    customer.workspace_id = workspace.id
    customer.save(update_fields=["workspace_id"])
    return workspace.slug


def start_checkout(customer, plan, method):
    # Serialize purchases per customer to prevent duplicate recurring subscriptions.
    with transaction.atomic():
        customer = Customer.objects.select_for_update().get(pk=customer.pk)
        if Order.objects.filter(
            customer=customer, method="card", status__in=["pending", "authorized", "paused"]
        ).exists():
            raise ValidationError(
                "Já existe uma contratação por cartão. Consulte ou cancele a renovação antes de contratar outro plano."
            )
        order = Order.objects.create(customer=customer, plan=plan, method=method, amount=PLANS[plan]["amount"])
        base = settings.WEB_URL.rstrip("/")
        if method == "card":
            result = call(
                "POST",
                "/preapproval",
                {
                    "reason": "Sertec Flow — " + PLANS[plan]["name"],
                    "external_reference": str(order.id),
                    "payer_email": customer.user.email,
                    "back_url": base + "/assinatura/",
                    "status": "pending",
                    "auto_recurring": {
                        "frequency": PLANS[plan]["months"],
                        "frequency_type": "months",
                        "transaction_amount": float(order.amount),
                        "currency_id": "BRL",
                    },
                },
                key=order.id,
            )
        else:
            result = call(
                "POST",
                "/checkout/preferences",
                {
                    "external_reference": str(order.id),
                    "payer": {"email": customer.user.email},
                    "items": [
                        {
                            "id": plan,
                            "title": "Sertec Flow — " + PLANS[plan]["name"],
                            "quantity": 1,
                            "currency_id": "BRL",
                            "unit_price": float(order.amount),
                        }
                    ],
                    "back_urls": {name: base + "/assinatura/" for name in ("success", "failure", "pending")},
                    "auto_return": "approved",
                    "notification_url": base + "/api/billing/webhook/",
                    "payment_methods": {
                        "excluded_payment_types": [
                            {"id": value}
                            for value in ("credit_card", "debit_card", "ticket", "atm", "prepaid_card", "account_money")
                        ],
                        "installments": 1,
                    },
                },
                key=order.id,
            )
        url = result.get("init_point", "")
        if method == "pix" and os.environ.get("MERCADOPAGO_LIVE_MODE", "0") != "1":
            url = result.get("sandbox_init_point") or url
        if not safe_checkout(url):
            raise ProviderUnavailable()
        order.provider_id, order.checkout_url = str(result["id"]), url
        order.save(update_fields=["provider_id", "checkout_url"])
        return url


def find_order(reference):
    try:
        return Order.objects.filter(pk=UUID(str(reference))).first()
    except (ValueError, TypeError, AttributeError):
        return None


def sync_payment(data, order=None):
    order = order or find_order(data.get("external_reference"))
    if order is None:
        return
    if not valid_payment(
        data, order, os.environ.get("MERCADOPAGO_COLLECTOR_ID"), os.environ.get("MERCADOPAGO_LIVE_MODE", "0") == "1"
    ):
        raise ValidationError("Pagamento não corresponde à contratação.")
    paid_at = parse_datetime(data.get("date_approved") or "")
    provider_updated_at = parse_datetime(data.get("date_last_updated") or "")
    if not provider_updated_at or timezone.is_naive(provider_updated_at):
        raise ValidationError("Pagamento sem data válida de atualização.")
    if data.get("status") == "approved" and (not paid_at or timezone.is_naive(paid_at)):
        raise ValidationError("Pagamento sem data válida de aprovação.")
    with transaction.atomic():
        customer = Customer.objects.select_for_update().get(pk=order.customer_id)
        existing = Payment.objects.filter(pk=str(data["id"])).first()
        if existing and existing.provider_updated_at and provider_updated_at < existing.provider_updated_at:
            return
        if existing and existing.order_id != order.id:
            raise ValidationError("Pagamento já associado a outra contratação.")
        if (
            not existing
            and data.get("status") == "approved"
            and order.method == "pix"
            and order.payments.filter(status="approved").exists()
        ):
            raise ValidationError("Contratação já paga. Contate o suporte para revisar o pagamento duplicado.")
        Payment.objects.update_or_create(
            pk=str(data["id"]),
            defaults={
                "order": order,
                "amount": order.amount,
                "status": data["status"],
                "refunded_amount": Decimal(str(data.get("transaction_amount_refunded") or 0)),
                "paid_at": paid_at,
                "provider_updated_at": provider_updated_at,
            },
        )
        # Recompute the ledger after refunds and out-of-order notifications. Replaying
        # an approved payment never adds another period; refunds remove its grant.
        end = None
        for payment in (
            Payment.objects.filter(order__customer=customer).select_related("order").order_by("paid_at", "provider_id")
        ):
            until = None
            if payment.status == "approved" and payment.refunded_amount == 0 and payment.paid_at:
                start = max(payment.paid_at, end) if end else payment.paid_at
                until = add_months(start, PLANS[payment.order.plan]["months"])
                end = until
            if payment.access_until != until:
                Payment.objects.filter(pk=payment.pk).update(access_until=until)
        if end and end > timezone.now():
            provision_workspace(customer)
        if order.method == "pix":
            Order.objects.filter(pk=order.pk).update(status=data["status"])


def sync_notification(topic, resource_id):
    if topic == "payment":
        sync_payment(call("GET", f"/v1/payments/{resource_id}"))
    elif topic == "subscription_preapproval":
        data = call("GET", f"/preapproval/{resource_id}")
        order = find_order(data.get("external_reference"))
        if order and order.method == "card" and str(data["id"]) == order.provider_id:
            # Authorizing a card never grants access; only an approved payment does.
            Order.objects.filter(pk=order.pk).update(status=data["status"])
    elif topic == "subscription_authorized_payment":
        invoice = call("GET", f"/authorized_payments/{resource_id}")
        order = Order.objects.filter(method="card", provider_id=str(invoice.get("preapproval_id"))).first()
        payment_id = (invoice.get("payment") or {}).get("id")
        if order and payment_id:
            sync_payment(call("GET", f"/v1/payments/{payment_id}"), order)
