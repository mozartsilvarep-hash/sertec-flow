from django.urls import path
from .views import CatalogView, AccountView, CheckoutView, CancelView, SalesView, WebhookView

urlpatterns = [
    path("plans/", CatalogView.as_view()),
    path("me/", AccountView.as_view()),
    path("checkout/", CheckoutView.as_view()),
    path("cancel/", CancelView.as_view()),
    path("sales/", SalesView.as_view()),
    path("webhook/", WebhookView.as_view()),
]
