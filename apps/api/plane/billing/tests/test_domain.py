import hashlib
import hmac
from datetime import datetime, timezone
from decimal import Decimal
from types import SimpleNamespace
from unittest import TestCase
from plane.billing.domain import PLANS, add_months, valid_payment, valid_signature


class DomainTests(TestCase):
    def test_prices_and_frequencies(self):
        self.assertEqual(PLANS["monthly"]["amount"], "39.90")
        self.assertEqual(PLANS["annual"]["amount"], "399.90")
        self.assertEqual(PLANS["annual"]["months"], 12)

    def test_month_end_and_leap_year(self):
        date = datetime(2028, 1, 31, tzinfo=timezone.utc)
        self.assertEqual(add_months(date, 1).day, 29)
        self.assertEqual(add_months(date.replace(month=2, day=29), 12).day, 28)

    def test_webhook_signature_matches_official_manifest(self):
        manifest = "id:abc123;request-id:request;ts:1704908010;"
        digest = hmac.new(b"secret", manifest.encode(), hashlib.sha256).hexdigest()
        signature = f"ts=1704908010,v1={digest}"
        self.assertTrue(valid_signature("secret", signature, "request", "ABC123"))
        self.assertFalse(valid_signature("other", signature, "request", "ABC123"))
        self.assertFalse(valid_signature("secret", signature, "changed", "ABC123"))
        self.assertFalse(valid_signature("secret", signature, "request", "another"))

    def test_missing_or_malformed_signatures_fail(self):
        for value in (None, "", "v1=bad", "ts=x,v1=abcd", "ts=12,v1=00"):
            self.assertFalse(valid_signature("secret", value, "request", "123"))
        self.assertFalse(valid_signature("", "ts=1,v1=" + "0" * 64, "request", "123"))

    def test_payment_must_match_amount_currency_seller_and_mode(self):
        order = SimpleNamespace(amount=Decimal("39.90"))
        data = {"collector_id": 12, "currency_id": "BRL", "transaction_amount": 39.9, "live_mode": False}
        self.assertTrue(valid_payment(data, order, "12", False))
        for field, wrong in (
            ("transaction_amount", 0.01),
            ("currency_id", "USD"),
            ("collector_id", 13),
            ("live_mode", True),
        ):
            self.assertFalse(valid_payment({**data, field: wrong}, order, "12", False))
        self.assertFalse(valid_payment(data, order, None, False))
