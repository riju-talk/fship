# services/serviceability_service.py
# This is the brain. It:
#   1. Validates pincodes
#   2. Resolves warehouse → pincode
#   3. Fetches user's rate cards from DB
#   4. Calls all relevant aggregators CONCURRENTLY (asyncio.gather)
#   5. Maps API responses back to user's rate cards
#   6. Returns unified list

import asyncio
import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models import UserRateCard, Warehouse
from aggregators.fship.common import check_serviceability as fship_check
from aggregators.rapidshyp.common import check_serviceability as rapid_check
from aggregators.rapidshyp_new.common import check_serviceability as rapid_new_check

logger = logging.getLogger(__name__)

# Maps aggregator name → its check_serviceability function
AGGREGATOR_FUNCTIONS = {
    "Fship": fship_check,
    "RapidShyp": rapid_check,
    "RapidShyp New": rapid_new_check
}


async def get_serviceable_couriers(
    user_id: str,
    pickup_pincode: str,
    destination_pincode: str,
    db: AsyncSession,
    cod: Optional[bool] = None,
    order_value: Optional[float] = None,
    weight: Optional[float] = None,
    warehouse_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main orchestrator. Returns { serviceable_couriers: [...] }.
    """
    # Step 1: Resolve pickup pincode from warehouse if warehouse_id provided
    if warehouse_id:
        resolved = await _get_warehouse_pincode(warehouse_id, user_id, db)
        if not resolved:
            logger.error(f"Warehouse {warehouse_id} not found for user {user_id}")
            return {"serviceable_couriers": [], "error": "Invalid warehouse ID"}
        pickup_pincode = resolved

    # Step 2: Validate pincode format
    if not _is_valid_pincode(pickup_pincode) or not _is_valid_pincode(destination_pincode):
        return {"serviceable_couriers": [], "error": "Pincodes must be 6 numeric digits"}

    # Step 3: Fetch user's active rate cards
    rate_cards = await _fetch_user_rate_cards(user_id, db)
    if not rate_cards:
        logger.warning(f"No active rate cards found for user {user_id}")
        return {"serviceable_couriers": []}

    # Step 4: Group rate cards by aggregator (only supported ones)
    aggregator_groups: Dict[str, List[dict]] = {}
    for card in rate_cards:
        agg = card["aggregator"]
        if agg not in AGGREGATOR_FUNCTIONS:
            logger.debug(f"Skipping unsupported aggregator: {agg}")
            continue
        aggregator_groups.setdefault(agg, []).append(card)

    if not aggregator_groups:
        logger.warning(f"No supported aggregators in rate cards for user {user_id}")
        return {"serviceable_couriers": []}

    # Step 5: Call all aggregators CONCURRENTLY (parallel, not sequential)
    shared_kwargs = {
        "timeout": 2.0,
        "cod": cod,
        "order_value": order_value,
        "weight": weight
    }

    tasks = {
        agg_name: AGGREGATOR_FUNCTIONS[agg_name](
            pickup_pincode=pickup_pincode,
            destination_pincode=destination_pincode,
            **shared_kwargs
        )
        for agg_name in aggregator_groups
    }

    # asyncio.gather runs all API calls in parallel → faster than sequential
    results_list = await asyncio.gather(*tasks.values(), return_exceptions=True)
    agg_results: Dict[str, dict] = dict(zip(tasks.keys(), results_list))

    # Step 6: Process each aggregator's response
    serviceable_list: List[Dict[str, Any]] = []

    for agg_name, result in agg_results.items():
        # Handle asyncio exceptions (network crash, etc.)
        if isinstance(result, Exception):
            logger.error(f"{agg_name}: Raised exception — {result}")
            continue

        if result.get("error"):
            logger.warning(f"{agg_name}: Returned error — {result['error']}")
            continue

        if not result.get("is_route_serviceable"):
            logger.info(f"{agg_name}: Route not serviceable for {pickup_pincode}→{destination_pincode}")
            continue

        user_cards_for_agg = aggregator_groups[agg_name]

        # FSHIP: Route-level only — include all user's Fship couriers
        if agg_name == "Fship" and not result.get("couriers"):
            for card in user_cards_for_agg:
                serviceable_list.append({
                    "name": card["courier_name"],
                    "aggregator": agg_name,
                    "eta": result.get("eta") or card.get("default_eta") or "N/A",
                    "type": card.get("service_type", "surface"),
                    "courier_code": card.get("courier_code")
                })

        # RAPIDSHYP / RAPIDSHYP NEW: Match API courier list against user's rate cards
        else:
            # Build lookup by normalized courier name
            api_couriers_by_name = {
                c["name"].strip().lower(): c
                for c in result.get("couriers", [])
            }

            for card in user_cards_for_agg:
                card_name_lower = card["courier_name"].strip().lower()
                api_data = api_couriers_by_name.get(card_name_lower)

                if api_data:
                    serviceable_list.append({
                        "name": card["courier_name"],
                        "aggregator": agg_name,
                        "eta": api_data.get("eta") or card.get("default_eta") or "N/A",
                        "type": api_data.get("type") or card.get("service_type", "surface"),
                        "courier_code": api_data.get("courier_code") or card.get("courier_code"),
                        "cutoff_time": api_data.get("cutoff_time"),
                        "total_freight": api_data.get("total_freight")
                    })

    logger.info(
        f"Serviceability result: {pickup_pincode}→{destination_pincode} | "
        f"User={user_id} | Found {len(serviceable_list)} serviceable couriers"
    )

    return {
        "serviceable_couriers": serviceable_list,
        "pickup_pincode": pickup_pincode,
        "destination_pincode": destination_pincode
    }


# ── Helper functions ──────────────────────────────────────────────────────────

async def _fetch_user_rate_cards(user_id: str, db: AsyncSession) -> List[dict]:
    """Fetch active rate cards for a user from DB."""
    stmt = select(UserRateCard).where(
        UserRateCard.user_id == user_id,
        UserRateCard.is_active == True
    )
    result = await db.execute(stmt)
    cards = result.scalars().all()

    return [
        {
            "courier_name": c.courier_name,
            "aggregator": c.aggregator,
            "courier_code": c.courier_code,
            "service_type": c.service_type,
            "default_eta": c.default_eta
        }
        for c in cards
    ]


async def _get_warehouse_pincode(
    warehouse_id: str, user_id: str, db: AsyncSession
) -> Optional[str]:
    """Resolve a warehouse_id to its pincode, scoped to the user."""
    stmt = select(Warehouse).where(
        Warehouse.warehouse_id == warehouse_id,
        Warehouse.user_id == user_id,
        Warehouse.is_active == True
    )
    result = await db.execute(stmt)
    warehouse = result.scalar_one_or_none()
    return warehouse.pincode if warehouse else None


async def _get_user_warehouses(user_id: str, db: AsyncSession) -> List[dict]:
    """Fetch all active warehouses for a user (used by dropdown in frontend)."""
    stmt = select(Warehouse).where(
        Warehouse.user_id == user_id,
        Warehouse.is_active == True
    )
    result = await db.execute(stmt)
    warehouses = result.scalars().all()
    return [
        {"warehouse_id": w.warehouse_id, "name": w.name, "pincode": w.pincode, "city": w.city}
        for w in warehouses
    ]


def _is_valid_pincode(pincode: str) -> bool:
    """Validate Indian 6-digit pincode."""
    cleaned = str(pincode).strip()
    return cleaned.isdigit() and len(cleaned) == 6
