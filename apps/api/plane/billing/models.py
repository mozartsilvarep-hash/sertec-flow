import uuid
from django.conf import settings
from django.db import models


class Customer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    workspace_id = models.UUIDField(null=True, blank=True, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="orders")
    plan = models.CharField(max_length=12, choices=[("monthly", "Mensal"), ("annual", "Anual")])
    method = models.CharField(max_length=12, choices=[("pix", "Pix"), ("card", "Cartão")])
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    provider_id = models.CharField(max_length=128, blank=True, unique=True, null=True)
    checkout_url = models.URLField(blank=True, max_length=1000)
    status = models.CharField(max_length=32, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)


class Payment(models.Model):
    provider_id = models.CharField(max_length=128, primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    refunded_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=32)
    paid_at = models.DateTimeField(null=True)
    access_until = models.DateTimeField(null=True)
    provider_updated_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(auto_now=True)
