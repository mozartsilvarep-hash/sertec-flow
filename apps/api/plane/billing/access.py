import os
from django.utils import timezone
from rest_framework.exceptions import APIException, PermissionDenied
from .models import Customer
from .services import access_until


class SubscriptionRequired(APIException):
    status_code = 402
    default_detail = "Escolha um plano ou renove sua assinatura para acessar seu espaço."
    default_code = "subscription_required"


def enforce_subscription(request, kwargs):
    if os.environ.get("SERTEC_REQUIRE_SUBSCRIPTION", "0") != "1" or not request.user.is_authenticated:
        return
    from .permissions import BillingAdminPermission

    if BillingAdminPermission().has_permission(request, None):
        return
    if request.path.startswith(("/api/users/", "/api/instances/", "/api/billing/")):
        return
    customer = Customer.objects.filter(user=request.user).first()
    until = access_until(customer) if customer else None
    if not until or until <= timezone.now():
        raise SubscriptionRequired()
    slug = kwargs.get("slug") or kwargs.get("workspace_slug")
    if slug:
        from plane.db.models import Workspace

        if not Workspace.objects.filter(pk=customer.workspace_id, slug=slug, owner=request.user).exists():
            raise PermissionDenied("Este espaço não pertence à sua assinatura individual.")
    # An individual entitlement never grants seats to another person, or public sharing.
    path = request.path.lower()
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        if any(token in path for token in ("invit", "members", "public", "deploy", "publish", "export")):
            raise PermissionDenied("O Plano Individual não permite convites ou publicação pública.")
        if path.rstrip("/") in ("/api/workspaces", "/api/v1/workspaces"):
            raise PermissionDenied("Seu espaço individual é criado automaticamente após o pagamento.")
