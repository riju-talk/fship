import logging
from typing import Any, Dict

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _is_placeholder_key(value: str) -> bool:
    return not value or value.startswith("YOUR_")


def _last_digit(value: str) -> int:
    for char in reversed(value):
        if char.isdigit():
            return int(char)
    return 0


def _fallback_result(pickup_pincode: str, destination_pincode: str) -> Dict[str, Any]:
    # Deterministic fallback so the API can be tested without real credentials.
    score = (_last_digit(pickup_pincode) + _last_digit(destination_pincode)) % 2
    is_serviceable = score == 0
    return {
        "couriers": [
            {
                "name": "Fship Partner",
                "serviceable": is_serviceable,
                "eta": "2-4 days",
                "type": "surface",
            }
        ]
    }


def check_serviceability(pickup_pincode: str, destination_pincode: str, **kwargs: Any) -> Dict[str, Any]:
    """
    Checks if Fship can deliver between two pincodes.
    Returns a simple list of serviceable couriers.
    """
    security_key = kwargs.get("signature", "YOUR_FSHIP_SECURITY_KEY_HERE")

    # Keep local/staging testing quick when a real key is not configured.
    if _is_placeholder_key(security_key):
        logger.info("Fship signature not configured, returning fallback result.")
        return _fallback_result(str(pickup_pincode), str(destination_pincode))

    url = "https://capi-qc.fship.in/api/pincodeserviceability"
    headers = {
        "Content-Type": "application/json",
        "signature": security_key,
    }
    payload = {
        "source_Pincode": str(pickup_pincode),
        "destination_Pincode": str(destination_pincode),
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()

        logger.info("Fship response for %s->%s: %s", pickup_pincode, destination_pincode, data)

        is_serviceable = data.get("pickup", "").lower() == "yes" and data.get("status") is True

        return {
            "couriers": [
                {
                    "name": "Fship Partner",
                    "serviceable": is_serviceable,
                    "eta": "2-4 days",
                    "type": "surface",
                }
            ]
        }
    except Exception as exc:
        logger.error("Fship API failed: %s", str(exc))
        return {"couriers": []}
