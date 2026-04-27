import logging
from typing import Any, Dict

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _is_placeholder(value: str) -> bool:
    return not value or value.startswith("YOUR_")


def _last_digit(value: str) -> int:
    for char in reversed(value):
        if char.isdigit():
            return int(char)
    return 0


def _fallback_result(pickup_pincode: str, destination_pincode: str) -> Dict[str, Any]:
    score = (_last_digit(pickup_pincode) * _last_digit(destination_pincode)) % 3
    is_serviceable = score != 0
    return {
        "couriers": [
            {
                "name": "RapidShyp Partner",
                "serviceable": is_serviceable,
                "eta": "3-5 days",
                "type": "surface",
            }
        ]
    }


def check_serviceability(pickup_pincode: str, destination_pincode: str, **kwargs: Any) -> Dict[str, Any]:
    """
    RapidShyp B2C Pincode Serviceability Checker.
    Docs: https://docs.rapidshyp.com/docs/DocumentationSidebar/Pincode%20Serviceability%20API/%20B2C%20Pincode%20Serviceability
    """
    url = kwargs.get(
        "url",
        "https://api.rapidshyp.com/rapidshyp/apis/v1/serviceability_check",
    )
    api_key = kwargs.get("api_key", "YOUR_RAPIDSHYP_KEY_HERE")
    cod = bool(kwargs.get("cod", True))
    order_value = float(kwargs.get("order_value", 1000))
    weight = float(kwargs.get("weight", 1.0))

    if _is_placeholder(api_key):
        logger.info("RapidShyp credentials/URL not configured, returning fallback result.")
        return _fallback_result(str(pickup_pincode), str(destination_pincode))

    headers = {
        "Content-Type": "application/json",
        "rapidshyp-token": api_key,
    }
    payload = {
        "Pickup_pincode": str(pickup_pincode),
        "Delivery_pincode": str(destination_pincode),
        "cod": cod,
        "total_order_value": order_value,
        "weight": weight,
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        logger.info("RapidShyp response: %s", data)

        if data.get("status") is not True:
            logger.info("RapidShyp returned non-serviceable status: %s", data.get("remark"))
            return {"couriers": []}

        couriers = []
        for courier in data.get("serviceable_courier_list", []):
            courier_name = courier.get("courier_name") or courier.get("parent_courier_name") or "RapidShyp Partner"
            couriers.append(
                {
                    "name": courier_name,
                    "serviceable": True,
                    "eta": courier.get("edd") or courier.get("epd") or "N/A",
                    "type": str(courier.get("freight_mode", "surface")).lower(),
                }
            )

        return {"couriers": couriers}
    except Exception as exc:
        logger.error("RapidShyp API failed: %s", str(exc))
        return {"couriers": []}
