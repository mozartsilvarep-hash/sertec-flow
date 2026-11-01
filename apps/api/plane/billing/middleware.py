import os
from django.http import JsonResponse


class PrivateSubscriptionsMiddleware:
    """Disable the public publishing API on individual-only installations."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if os.environ.get("SERTEC_REQUIRE_SUBSCRIPTION", "0") == "1" and request.path.startswith("/api/public/"):
            return JsonResponse({"detail": "Publicação pública indisponível no Plano Individual."}, status=403)
        return self.get_response(request)
