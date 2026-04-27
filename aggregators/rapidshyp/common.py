# aggregators/rapidshyp/common.py
# API Docs Reference: POST https://api.rapidshyp.com/rapidshyp/apis/v1/serviceability_check
# NOTE: The curl example in docs spells it "serviceabilty_check" (typo), 
#       but the correct URL is "serviceability_check" — confirm with RapidShyp if you get 404.
# Response: { status, remark, serviceable_courier_list: [ { courier_code, courier_name, 
#             cutoff_time, freight_mode, max_weight, min_weight, total_freight, edd } ] }

import httpx
import logging
from typing import Dict, Any
from database import settings

logger = logging.getLogger(__name__)

RAPIDSHYP_API_KEY = settings.RAPIDSHYP_API_KEY
RAPIDSHYP_BASE_URL = settings.RAPIDSHYP_BASE_URL


async def check_serviceability(
    pickup_pincode: str,
    destination_pincode: str,
    **kwargs
) -> Dict[str, Any]:
    """
    RapidShyp Pincode Serviceability Check — async.
    
    Returns a full list of serviceable couriers with ETA, freight mode, and pricing.
    The orchestrator matches this list against the user's rate cards by courier_name.
    """
    base_url = kwargs.get("base_url", RAPIDSHYP_BASE_URL)
    api_key = kwargs.get("api_key", RAPIDSHYP_API_KEY)
    timeout = kwargs.get("timeout", 2.0)

    # Optional params — use sensible defaults so the API doesn't reject the call
    cod = kwargs.get("cod", True)
    order_value = float(kwargs.get("order_value") or 1000)
    weight = float(kwargs.get("weight") or 1.0)

    if not api_key:
        logger.error("RapidShyp: Missing API key")
        return _error_response("RapidShyp", "Authentication token missing")

    payload = {
        "Pickup_pincode": str(pickup_pincode).strip(),
        "Delivery_pincode": str(destination_pincode).strip(),
        "cod": bool(cod),
        "total_order_value": order_value,
        "weight": weight
    }
    headers = {
        "Content-Type": "application/json",
        "rapidshyp-token": api_key
    }

    try:
        logger.info(f"RapidShyp: Checking serviceability {pickup_pincode} → {destination_pincode}")
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{base_url}/serviceability_check",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

        if not data.get("status"):
            remark = data.get("remark", "API returned failure")
            logger.warning(f"RapidShyp: status=false — {remark}")
            return {
                "aggregator": "RapidShyp",
                "is_route_serviceable": False,
                "couriers": [],
                "raw_response": data,
                "error": remark
            }

        # Parse the courier list from API response
        couriers = []
        for item in data.get("serviceable_courier_list", []):
            couriers.append({
                "name": item.get("courier_name", "Unknown"),
                "courier_code": item.get("courier_code"),
                "serviceable": True,
                "eta": item.get("edd"),                           # "17-09-2025" format
                "type": str(item.get("freight_mode", "surface")).lower(),
                "cutoff_time": item.get("cutoff_time"),           # "14:00"
                "max_weight": item.get("max_weight"),
                "min_weight": item.get("min_weight"),
                "total_freight": item.get("total_freight")
            })

        logger.info(f"RapidShyp: Found {len(couriers)} couriers for {pickup_pincode}→{destination_pincode}")

        return {
            "aggregator": "RapidShyp",
            "is_route_serviceable": len(couriers) > 0,
            "couriers": couriers,
            "raw_response": data,
            "error": None
        }

    except httpx.TimeoutException:
        logger.warning(f"RapidShyp: Timeout ({timeout}s) for {pickup_pincode}→{destination_pincode}")
        return _error_response("RapidShyp", "timeout")
    except httpx.HTTPStatusError as e:
        logger.error(f"RapidShyp: HTTP {e.response.status_code} — {e.response.text}")
        return _error_response("RapidShyp", f"http_{e.response.status_code}")
    except httpx.RequestError as e:
        logger.error(f"RapidShyp: Request failed — {e}")
        return _error_response("RapidShyp", str(e))
    except Exception as e:
        logger.exception(f"RapidShyp: Unexpected error — {e}")
        return _error_response("RapidShyp", "internal_error")


def _error_response(aggregator: str, error: str) -> dict:
    return {
        "aggregator": aggregator,
        "is_route_serviceable": False,
        "couriers": [],
        "raw_response": None,
        "error": error
    }
