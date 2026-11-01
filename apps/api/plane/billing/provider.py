import os
import re
import requests
from urllib.parse import urlsplit
from django.conf import settings
from rest_framework.exceptions import APIException


class ProviderUnavailable(APIException):
    status_code = 503
    default_detail = "Pagamento indisponível. Tente novamente em alguns instantes."


def configured():
    return all(
        os.environ.get(key)
        for key in ("MERCADOPAGO_ACCESS_TOKEN", "MERCADOPAGO_WEBHOOK_SECRET", "MERCADOPAGO_COLLECTOR_ID")
    ) and settings.WEB_URL.startswith("https://")


def call(method, path, payload=None, key=None):
    if not configured():
        raise ProviderUnavailable("O checkout ainda não foi configurado pelo administrador.")
    if not re.fullmatch(r"/[A-Za-z0-9_/-]+", path):
        raise ValueError("Invalid provider resource")
    headers = {"Authorization": f"Bearer {os.environ['MERCADOPAGO_ACCESS_TOKEN']}"}
    if key:
        headers["X-Idempotency-Key"] = str(key)
    try:
        response = requests.request(
            method,
            "https://api.mercadopago.com" + path,
            json=payload,
            headers=headers,
            timeout=6,
            allow_redirects=False,
        )
        response.raise_for_status()
        data = response.json()
        if not isinstance(data, dict):
            raise ValueError("Invalid provider response")
        return data
    except (requests.RequestException, ValueError) as exc:
        raise ProviderUnavailable() from exc


def safe_checkout(url):
    parsed = urlsplit(url)
    return (
        parsed.scheme == "https"
        and parsed.hostname in {"www.mercadopago.com.br", "sandbox.mercadopago.com.br"}
        and parsed.username is None
        and parsed.port in (None, 443)
    )
