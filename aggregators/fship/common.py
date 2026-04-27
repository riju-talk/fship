import httpx
import logging
from database import settings

logger = logging.getLogger(__name__)

async def check_serviceability(pickup_pincode: str, destination_pincode: str, **kwargs):
    """Fship returns ROUTE-LEVEL status only — no per-courier list."""
    base_url = kwargs.get("base_url", settings.FSHIP_BASE_URL)
    signature = kwargs.get("signature", settings.FSHIP_SIGNATURE)
    timeout = kwargs.get("timeout", 2.0)
    
    if not signature:
        return _err("Fship", "Auth missing")
    
    payload = {"source_Pincode": str(pickup_pincode), "destination_Pincode": str(destination_pincode)}
    headers = {"Content-Type": "application/json", "signature": signature}
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(f"{base_url}/api/pincodeserviceability", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        
        return {
            "aggregator": "Fship",
            "is_route_serviceable": bool(data.get("status", False)),
            "couriers": [],
            "eta": data.get("response"),
            "error": None
        }
    except Exception as e:
        logger.error(f"Fship error: {e}")
        return _err("Fship", str(e))

def _err(agg: str, err: str):
    return {"aggregator": agg, "is_route_serviceable": False, "couriers": [], "error": err}
