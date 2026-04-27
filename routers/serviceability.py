import logging
from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import ServiceabilityResponse
from services.serviceability_service import get_serviceable_couriers

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["serviceability"])

@router.get("/check-serviceability", response_model=ServiceabilityResponse)
async def check_serviceability(
    pickup_pincode: str = Query(None, min_length=6, max_length=6, pattern=r"^\d{6}$"),
    destination_pincode: str = Query(..., min_length=6, max_length=6, pattern=r"^\d{6}$"),
    user_id: str = Query(...),
    warehouse_id: str = Query(None),
    cod: bool = Query(None),
    order_value: float = Query(None, gt=0),
    weight: float = Query(None, gt=0),
    db: AsyncSession = Depends(get_db)
):
    if not pickup_pincode and not warehouse_id:
        raise HTTPException(422, "Either pickup_pincode or warehouse_id required")
    try:
        return await get_serviceable_couriers(
            user_id,
            pickup_pincode or "",
            destination_pincode,
            db,
            cod=cod,
            order_value=order_value,
            weight=weight,
            warehouse_id=warehouse_id
        )
    except Exception as e:
        logger.exception("Unhandled error")
        raise HTTPException(500, "Internal error")
