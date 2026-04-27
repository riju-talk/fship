# schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List

# ── Response schemas ──────────────────────────────────────────
class CourierResult(BaseModel):
    name: str
    aggregator: str
    eta: Optional[str] = "N/A"
    type: Optional[str] = "surface"      # "air" | "surface"
    courier_code: Optional[str] = None
    cutoff_time: Optional[str] = None
    total_freight: Optional[float] = None

class ServiceabilityResponse(BaseModel):
    serviceable_couriers: List[CourierResult]
    pickup_pincode: str
    destination_pincode: str
    error: Optional[str] = None

# ── Internal aggregator schemas (used between service layers) ──
class AggregatorResult(BaseModel):
    aggregator: str
    is_route_serviceable: bool
    couriers: List[dict] = []
    raw_response: Optional[dict] = None
    eta: Optional[str] = None
    error: Optional[str] = None
