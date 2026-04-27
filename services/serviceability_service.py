import asyncio
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import UserRateCard, Warehouse
from aggregators.fship.common import check_serviceability as fship_check
from aggregators.rapidshyp.common import check_serviceability as rapid_check
from aggregators.rapidshyp_new.common import check_serviceability as rapid_new_check

logger = logging.getLogger(__name__)
AGG_FUNCS = {"Fship": fship_check, "RapidShyp": rapid_check, "RapidShyp New": rapid_new_check}

async def get_serviceable_couriers(user_id: str, pickup_pincode: str, destination_pincode: str, db: AsyncSession, **opts):
    # 1. Resolve warehouse → pincode if needed
    if opts.get("warehouse_id"):
        stmt = select(Warehouse).where(Warehouse.warehouse_id==opts["warehouse_id"], Warehouse.user_id==user_id)
        wh = (await db.execute(stmt)).scalar_one_or_none()
        if not wh:
            return {"serviceable_couriers": [], "error": "Invalid warehouse"}
        pickup_pincode = wh.pincode
    
    # 2. Validate pincodes
    if not (pickup_pincode.isdigit() and destination_pincode.isdigit() and len(pickup_pincode)==6 and len(destination_pincode)==6):
        return {"serviceable_couriers": [], "error": "Invalid pincode"}
    
    # 3. Fetch user rate cards
    stmt = select(UserRateCard).where(UserRateCard.user_id==user_id, UserRateCard.is_active==True)
    cards = (await db.execute(stmt)).scalars().all()
    if not cards:
        return {"serviceable_couriers": []}
    
    # 4. Group by aggregator
    agg_groups = {}
    for c in cards:
        if c.aggregator in AGG_FUNCS:
            agg_groups.setdefault(c.aggregator, []).append(c)
    if not agg_groups:
        return {"serviceable_couriers": []}
    
    # 5. Call aggregators CONCURRENTLY (asyncio.gather = parallel)
    tasks = {agg: AGG_FUNCS[agg](pickup_pincode, destination_pincode, timeout=2.0, **opts) for agg in agg_groups}
    results = dict(zip(tasks.keys(), await asyncio.gather(*tasks.values(), return_exceptions=True)))
    
    # 6. Map results to user rate cards
    serviceable = []
    for agg, res in results.items():
        if isinstance(res, Exception) or not res.get("is_route_serviceable"):
            continue
        user_cards = agg_groups[agg]
        
        if agg == "Fship" and not res.get("couriers"):  # Fship = route-level
            for c in user_cards:
                serviceable.append({
                    "name": c.courier_name,
                    "aggregator": agg,
                    "eta": res.get("eta") or c.default_eta or "N/A",
                    "type": c.service_type
                })
        else:  # RapidShyp = courier-level matching
            api_map = {c["name"].lower(): c for c in res.get("couriers", [])}
            for c in user_cards:
                if c.courier_name.lower() in api_map:
                    api = api_map[c.courier_name.lower()]
                    serviceable.append({
                        "name": c.courier_name,
                        "aggregator": agg,
                        "eta": api.get("eta") or c.default_eta or "N/A",
                        "type": api.get("type") or c.service_type,
                        "courier_code": api.get("courier_code") or c.courier_code
                    })
    
    return {
        "serviceable_couriers": serviceable,
        "pickup_pincode": pickup_pincode,
        "destination_pincode": destination_pincode
    }
