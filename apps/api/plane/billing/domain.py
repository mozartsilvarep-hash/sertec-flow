import calendar
import hashlib
import hmac
from decimal import Decimal, InvalidOperation

PLANS = {
    "monthly": {"name": "Individual mensal", "amount": "39.90", "months": 1},
    "annual": {"name": "Individual anual", "amount": "399.90", "months": 12},
}


def add_months(value, months):
    index = value.year * 12 + value.month - 1 + months
    year, month = divmod(index, 12)
    month += 1
    return value.replace(year=year, month=month, day=min(value.day, calendar.monthrange(year, month)[1]))


def valid_signature(secret, signature, request_id, data_id):
    if not all((secret, signature, request_id, data_id)):
        return False
    parts = dict(item.strip().split("=", 1) for item in signature.split(",") if "=" in item)
    timestamp, digest = parts.get("ts", ""), parts.get("v1", "")
    if not timestamp.isdigit() or len(digest) != 64:
        return False
    manifest = f"id:{str(data_id).lower()};request-id:{request_id};ts:{timestamp};"
    expected = hmac.new(secret.encode(), manifest.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, digest)


def valid_payment(payment, order, collector, live_mode):
    try:
        return (
            bool(collector)
            and str(payment.get("collector_id")) == str(collector)
            and payment.get("currency_id") == "BRL"
            and Decimal(str(payment.get("transaction_amount"))) == order.amount
            and payment.get("live_mode") is live_mode
        )
    except (InvalidOperation, ValueError, TypeError):
        return False
