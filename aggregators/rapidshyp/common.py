import httpx
import logging
from database import settings

logger = logging.getLogger(__name__)

async def check_serviceability(pickup_pincode: str, destination_pincode: str, **kwargs):
    """RapidShyp returns FULL courier list with rates & ETA."""
    base_url = kwargs.get("base_url", settings.RAPIDSHYP_BASE_URL)
    api_key = kwargs.get("api_key", settings.RAPIDSHYP_API_KEY)
    timeout = kwargs.get("timeout", 2.0)
    cod = kwargs.get("cod", True)
    order_value = float(kwargs.get("order_value") or 1000)
    weight = float(kwargs.get("weight") or 1.0)
    
    if not api_key:
        return _err("RapidShyp", "Auth missing")
    
    payload = {
        "Pickup_pincode": str(pickup_pincode),
        "Delivery_pincode": str(destination_pincode),
        "cod": bool(cod),
        "total_order_value": order_value,
        "weight": weight
    }
    headers = {"Content-Type": "application/json", "rapidshyp-token": api_key}
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(f"{base_url}/serviceability_check", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        
        if not data.get("status"):
            return _err("RapidShyp", data.get("remark", "API failed"))
        
        couriers = [{
            "name": c.get("courier_name"),
            "courier_code": c.get("courier_code"),
            "eta": c.get("edd"),
            "type": str(c.get("freight_mode", "surface")).lower(),
            "cutoff_time": c.get("cutoff_time"),
            "total_freight": c.get("total_freight")
        } for c in data.get("serviceable_courier_list", [])]
        
        return {
            "aggregator": "RapidShyp",
            "is_route_serviceable": len(couriers) > 0,
            "couriers": couriers,
            "error": None
        }
    except Exception as e:
        logger.error(f"RapidShyp error: {e}")
        return _err("RapidShyp", str(e))

def _err(agg: str, err: str):
    return {"aggregator": agg, "is_route_serviceable": False, "couriers": [], "error": err}
