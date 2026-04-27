from pydantic import BaseModel
from typing import Optional, List

class CourierResult(BaseModel):
    name: str
    aggregator: str
    eta: Optional[str] = "N/A"
    type: Optional[str] = "surface"
    courier_code: Optional[str] = None
    cutoff_time: Optional[str] = None
    total_freight: Optional[float] = None

class ServiceabilityResponse(BaseModel):
    serviceable_couriers: List[CourierResult]
    pickup_pincode: str
    destination_pincode: str
    error: Optional[str] = None
