from rest_framework.permissions import BasePermission


def is_billing_admin(request):
    from plane.license.api.permissions.instance import InstanceAdminPermission

    return InstanceAdminPermission().has_permission(request, None)


class BillingAdminPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_billing_admin(request)
