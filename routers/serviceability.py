# routers/serviceability.py
import logging
from typing import Optional
from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from schemas import ServiceabilityResponse
from services.serviceability_service import get_serviceable_couriers, _get_user_warehouses

router = APIRouter(prefix="/api", tags=["serviceability"])
logger = logging.getLogger(__name__)


@router.get(
    "/check-serviceability",
    response_model=ServiceabilityResponse,
    summary="Check pincode serviceability for a user's courier partners"
)
async def check_serviceability(
    pickup_pincode: Optional[str] = Query(None, min_length=6, max_length=6, pattern=r"^\d{6}$"),
    destination_pincode: str = Query(..., min_length=6, max_length=6, pattern=r"^\d{6}$"),
    user_id: str = Query(..., description="Logged-in user identifier"),
    warehouse_id: Optional[str] = Query(None, description="Use warehouse pincode as pickup"),
    cod: Optional[bool] = Query(None),
    order_value: Optional[float] = Query(None, gt=0),
    weight: Optional[float] = Query(None, gt=0),
    db: AsyncSession = Depends(get_db)
):
    """
    GET /api/check-serviceability
    
    Either pickup_pincode OR warehouse_id must be provided.
    If both are given, warehouse_id takes precedence.
    """
    # At least one pickup source is required
    if not pickup_pincode and not warehouse_id:
        raise HTTPException(
            status_code=422,
            detail="Either pickup_pincode or warehouse_id must be provided"
        )

    try:
        result = await get_serviceable_couriers(
            user_id=user_id,
            pickup_pincode=pickup_pincode or "",
            destination_pincode=destination_pincode,
            db=db,
            cod=cod,
            order_value=order_value,
            weight=weight,
            warehouse_id=warehouse_id
        )
        return result

    except Exception as e:
        logger.exception(f"Unhandled error in check-serviceability: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/warehouses",
    summary="Get warehouses for dropdown in frontend"
)
async def get_warehouses(
    user_id: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    GET /api/warehouses?user_id=xxx
    Returns user's warehouses for the pickup dropdown.
    """
    warehouses = await _get_user_warehouses(user_id, db)
    return {"warehouses": warehouses}
