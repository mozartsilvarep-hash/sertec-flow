import os
from datetime import timedelta
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate
from plane.billing.models import Customer, Order, Payment
from plane.billing.services import access_until, sync_payment, sync_notification
from plane.billing.views import AccountView, CheckoutView, SalesView, CancelView, WebhookView
from plane.billing.access import enforce_subscription, SubscriptionRequired


class BillingTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="one", email="one@example.test")
        self.other = get_user_model().objects.create_user(username="two", email="two@example.test")
        self.customer = Customer.objects.create(user=self.user)
        self.order = Order.objects.create(customer=self.customer, plan="monthly", method="pix", amount="39.90")
        self.factory = APIRequestFactory()
        self.env = patch.dict(os.environ, {"MERCADOPAGO_COLLECTOR_ID": "123", "MERCADOPAGO_LIVE_MODE": "0"})
        self.env.start()
        self.addCleanup(self.env.stop)
        self.provision = patch("plane.billing.services.provision_workspace", return_value="private-one")
        self.provision.start()
        self.addCleanup(self.provision.stop)
        self.admin = patch("plane.billing.permissions.is_billing_admin", return_value=False)
        self.admin.start()
        self.addCleanup(self.admin.stop)

    def payment(self, **updates):
        return {
            "id": "payment1",
            "external_reference": str(self.order.id),
            "collector_id": 123,
            "currency_id": "BRL",
            "transaction_amount": 39.90,
            "live_mode": False,
            "status": "approved",
            "date_approved": timezone.now().isoformat(),
            "date_last_updated": timezone.now().isoformat(),
            **updates,
        }

    def test_approved_payment_grants_one_period_and_replay_is_idempotent(self):
        data = self.payment()
        sync_payment(data)
        until = access_until(self.customer)
        sync_payment(data)
        self.assertEqual(access_until(self.customer), until)
        self.assertEqual(Payment.objects.count(), 1)
        self.assertGreater(until, timezone.now() + timedelta(days=27))

    def test_pending_payment_never_grants_access(self):
        sync_payment(self.payment(status="pending", date_approved=None))
        self.assertIsNone(access_until(self.customer))

    def test_wrong_amount_or_seller_is_rejected(self):
        from rest_framework.exceptions import ValidationError

        for changes in ({"transaction_amount": 0.01}, {"collector_id": 999}, {"live_mode": True}):
            with self.assertRaises(ValidationError):
                sync_payment(self.payment(**changes))
        self.assertEqual(Payment.objects.count(), 0)

    def test_refund_revokes_access_and_replay_does_not_restore_it(self):
        data = self.payment()
        sync_payment(data)
        refund = {**data, "status": "refunded", "transaction_amount_refunded": 39.9}
        sync_payment(refund)
        sync_payment(refund)
        self.assertIsNone(access_until(self.customer))

    def test_authorizing_card_does_not_grant_access(self):
        self.order.method, self.order.provider_id = "card", "subscription1"
        self.order.save()
        with patch(
            "plane.billing.services.call",
            return_value={"id": "subscription1", "external_reference": str(self.order.id), "status": "authorized"},
        ):
            sync_notification("subscription_preapproval", "subscription1")
        self.assertIsNone(access_until(self.customer))
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "authorized")

    def test_customer_cannot_see_another_customers_payments(self):
        sync_payment(self.payment())
        request = self.factory.get("/api/billing/me/")
        force_authenticate(request, user=self.other)
        response = AccountView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["payments"], [])
        self.assertFalse(response.data["active"])

    def test_sales_rejects_regular_customer(self):
        request = self.factory.get("/api/billing/sales/")
        force_authenticate(request, user=self.user)
        self.assertEqual(SalesView.as_view()(request).status_code, 403)

    def test_unconfigured_checkout_does_not_create_order(self):
        request = self.factory.post("/api/billing/checkout/", {"plan": "monthly", "method": "pix"}, format="json")
        force_authenticate(request, user=self.user)
        with patch("plane.billing.views.configured", return_value=False):
            self.assertEqual(CheckoutView.as_view()(request).status_code, 503)
        self.assertEqual(Order.objects.count(), 1)

    def test_customer_cannot_cancel_another_customers_subscription(self):
        self.order.method, self.order.provider_id = "card", "subscription1"
        self.order.save()
        request = self.factory.post("/api/billing/cancel/", {}, format="json")
        force_authenticate(request, user=self.other)
        with patch("plane.billing.views.call") as provider:
            self.assertEqual(CancelView.as_view()(request).status_code, 400)
            provider.assert_not_called()

    def test_expired_or_absent_subscription_cannot_access_workspace(self):
        request = self.factory.get("/api/workspaces/private-one/")
        request.user = self.user
        with patch.dict(os.environ, {"SERTEC_REQUIRE_SUBSCRIPTION": "1"}):
            with self.assertRaises(SubscriptionRequired):
                enforce_subscription(request, {"slug": "private-one"})

    def test_webhook_rejects_unsigned_payment(self):
        request = self.factory.post(
            "/api/billing/webhook/?data.id=1", {"type": "payment", "data": {"id": "1"}}, format="json"
        )
        with patch("plane.billing.views.sync_notification") as sync:
            self.assertEqual(WebhookView.as_view()(request).status_code, 401)
            sync.assert_not_called()

    def test_unauthenticated_account_returns_401_for_login_redirect(self):
        response = AccountView.as_view()(self.factory.get("/api/billing/me/"))
        self.assertEqual(response.status_code, 401)

    def test_recurring_invoice_grants_access_only_after_approved_payment(self):
        self.order.method, self.order.provider_id = "card", "subscription1"
        self.order.save()
        data = self.payment(external_reference="provider-reference")
        with patch(
            "plane.billing.services.call",
            side_effect=[{"preapproval_id": "subscription1", "payment": {"id": "payment1"}}, data],
        ):
            sync_notification("subscription_authorized_payment", "invoice1")
        self.assertIsNotNone(access_until(self.customer))

    def test_refund_removes_its_grant_from_following_periods(self):
        first = self.payment(date_approved=(timezone.now() - timedelta(days=1)).isoformat())
        sync_payment(first)
        second_order = Order.objects.create(customer=self.customer, plan="monthly", method="pix", amount="39.90")
        second = self.payment(id="payment2", external_reference=str(second_order.id))
        sync_payment(second)
        before = access_until(self.customer)
        sync_payment({**first, "status": "refunded", "transaction_amount_refunded": 39.9})
        after = access_until(self.customer)
        self.assertLess(after, before)
        self.assertGreater(after, timezone.now() + timedelta(days=27))

    def test_checkout_uses_server_price_and_pix_excludes_cards(self):
        from plane.billing.services import start_checkout

        with patch(
            "plane.billing.services.call",
            return_value={"id": "preference1", "init_point": "https://www.mercadopago.com.br/checkout/test"},
        ) as provider:
            start_checkout(self.customer, "annual", "pix")
        payload = provider.call_args.args[2]
        self.assertEqual(payload["items"][0]["unit_price"], 399.9)
        self.assertIn({"id": "credit_card"}, payload["payment_methods"]["excluded_payment_types"])

    def test_card_checkout_sets_recurring_frequency(self):
        from plane.billing.services import start_checkout

        with patch(
            "plane.billing.services.call",
            return_value={
                "id": "subscription1",
                "init_point": "https://www.mercadopago.com.br/subscriptions/checkout/test",
            },
        ) as provider:
            start_checkout(self.customer, "annual", "card")
        self.assertEqual(provider.call_args.args[1], "/preapproval")
        self.assertEqual(provider.call_args.args[2]["auto_recurring"]["frequency"], 12)
        self.assertEqual(provider.call_args.args[2]["status"], "pending")

    def test_existing_card_checkout_blocks_duplicate_subscription(self):
        from plane.billing.services import start_checkout
        from rest_framework.exceptions import ValidationError

        self.order.method = "card"
        self.order.save()
        with patch("plane.billing.services.call") as provider:
            with self.assertRaises(ValidationError):
                start_checkout(self.customer, "annual", "card")
            provider.assert_not_called()

    def test_cancel_keeps_already_paid_period(self):
        sync_payment(self.payment())
        until = access_until(self.customer)
        self.order.method, self.order.provider_id, self.order.status = "card", "subscription1", "authorized"
        self.order.save()
        request = self.factory.post("/api/billing/cancel/", {}, format="json")
        force_authenticate(request, user=self.user)
        with patch("plane.billing.views.call", return_value={"status": "cancelled"}):
            self.assertEqual(CancelView.as_view()(request).status_code, 200)
        self.assertEqual(access_until(self.customer), until)

    def test_webhook_signed_query_must_match_payload(self):
        request = self.factory.post(
            "/api/billing/webhook/?data.id=1", {"type": "payment", "data": {"id": "2"}}, format="json"
        )
        with (
            patch("plane.billing.views.valid_signature", return_value=True),
            patch("plane.billing.views.sync_notification") as sync,
        ):
            self.assertEqual(WebhookView.as_view()(request).status_code, 400)
            sync.assert_not_called()

    def test_stale_approval_cannot_restore_refunded_access(self):
        approved = self.payment()
        sync_payment(approved)
        refund = {
            **approved,
            "status": "refunded",
            "transaction_amount_refunded": 39.9,
            "date_last_updated": (timezone.now() + timedelta(seconds=1)).isoformat(),
        }
        sync_payment(refund)
        sync_payment(approved)
        self.assertIsNone(access_until(self.customer))
