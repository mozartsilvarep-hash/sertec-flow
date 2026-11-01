from django.urls import include, path

urlpatterns = [path("api/billing/", include("plane.billing.urls"))]
