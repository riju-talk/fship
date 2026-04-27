# aggregators/fship/common.py
# API Docs Reference: POST https://capi-qc.fship.in/api/pincodeserviceability
# Response structure: { source, destination, pickup, reverse, prepaid, cod, status, response }
# NOTE: Fship returns ROUTE-LEVEL status only — no per-courier list.
#       The orchestrator maps ALL of the user's Fship rate cards when status=True.

import httpx
import logging
from typing import Dict, Any
from database import settings

logger = logging.getLogger(__name__)

FSHIP_SIGNATURE = settings.FSHIP_SIGNATURE
FSHIP_BASE_URL = settings.FSHIP_BASE_URL


async def check_serviceability(
    pickup_pincode: str,
    destination_pincode: str,
    **kwargs
) -> Dict[str, Any]:
    """
    Fship Pincode Serviceability Check — async version using httpx.
    
    Returns route-level serviceability. The orchestrator uses this boolean
    to decide whether to include all Fship couriers from the user's rate card.
    """
    base_url = kwargs.get("base_url", FSHIP_BASE_URL)
    signature = kwargs.get("signature", FSHIP_SIGNATURE)
    timeout = kwargs.get("timeout", 2.0)

    if not signature:
        logger.error("Fship: Missing signature key")
        return _error_response("Fship", "Authentication token missing")

    payload = {
        "source_Pincode": str(pickup_pincode).strip(),
        "destination_Pincode": str(destination_pincode).strip()
    }
    headers = {
        "Content-Type": "application/json",
        "signature": signature
    }

    try:
        logger.info(f"Fship: Checking serviceability {pickup_pincode} → {destination_pincode}")
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{base_url}/api/pincodeserviceability",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

        # Fship success response: { status: true/false, pickup: "true"/"false", cod: "true"/"false" }
        is_serviceable = bool(data.get("status", False))

        logger.info(f"Fship: Route {pickup_pincode}→{destination_pincode} serviceable={is_serviceable}")
        
        return {
            "aggregator": "Fship",
            "is_route_serviceable": is_serviceable,
            "couriers": [],  # Fship doesn't return per-courier list from this endpoint
            "raw_response": data,
            "eta": data.get("response"),          # Fship may return ETA in response field
            "pickup_supported": str(data.get("pickup", "false")).lower() == "true",
            "cod_supported": str(data.get("cod", "false")).lower() == "true",
            "error": None
        }

    except httpx.TimeoutException:
        logger.warning(f"Fship: Timeout ({timeout}s) for {pickup_pincode}→{destination_pincode}")
        return _error_response("Fship", "timeout")
    except httpx.HTTPStatusError as e:
        logger.error(f"Fship: HTTP {e.response.status_code} — {e.response.text}")
        return _error_response("Fship", f"http_{e.response.status_code}")
    except httpx.RequestError as e:
        logger.error(f"Fship: Request failed — {e}")
        return _error_response("Fship", str(e))
    except Exception as e:
        logger.exception(f"Fship: Unexpected error — {e}")
        return _error_response("Fship", "internal_error")


def _error_response(aggregator: str, error: str) -> dict:
    return {
        "aggregator": aggregator,
        "is_route_serviceable": False,
        "couriers": [],
        "raw_response": None,
        "error": error
    }
