import logging
from typing import Any, Dict

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _is_placeholder(value: str) -> bool:
    return not value or value.startswith("YOUR_")


def _fallback_result(pickup_pincode: str, destination_pincode: str) -> Dict[str, Any]:
    score = (int(pickup_pincode[-1]) + int(destination_pincode[-1])) % 3
    is_serviceable = score != 1
    return {
        "couriers": [
            {
                "name": "RapidShyp New Partner",
                "serviceable": is_serviceable,
                "eta": "1-3 days",
                "type": "air",
            }
        ]
    }


def check_serviceability(pickup_pincode: str, destination_pincode: str, **kwargs: Any) -> Dict[str, Any]:
    """
    RapidShyp New Pincode Serviceability Checker (template with safe fallback).
    Replace URL & payload with RapidShyp New's actual docs.
    """
    url = kwargs.get("url", "https://api.rapidshypnew.com/v1/serviceability")
    api_key = kwargs.get("api_key", "YOUR_RAPIDSHYP_NEW_API_KEY")

    if _is_placeholder(api_key) or "rapidshypnew.com" in url:
        logger.info("RapidShyp New credentials/URL not configured, returning fallback result.")
        return _fallback_result(str(pickup_pincode), str(destination_pincode))

    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "pickup": str(pickup_pincode),
        "destination": str(destination_pincode),
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        logger.info("RapidShyp New response: %s", data)

        is_serviceable = bool(data.get("serviceable", False))
        courier_name = data.get("courier_name", "RapidShyp New Partner")

        return {
            "couriers": [
                {
                    "name": courier_name,
                    "serviceable": is_serviceable,
                    "eta": "1-3 days",
                    "type": "air",
                }
            ]
        }
    except Exception as exc:
        logger.error("RapidShyp New API failed: %s", str(exc))
        return {"couriers": []}
