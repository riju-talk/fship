import logging
import os
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query

from aggregators.fship import common as fship_common
from aggregators.rapidshyp import common as rapidshyp_common

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


def get_user_ratecards(user_id: str) -> List[Dict[str, Any]]:
    """
    Returns user courier configs.
    TODO: replace with real DB lookup by user_id.
    """
    _ = user_id
    return [
        {
            "courier_name": "Fship Default",
            "aggregator": "fship",
            "signature": os.getenv("FSHIP_SIGNATURE", "YOUR_FSHIP_KEY"),
        },
        {
            "courier_name": "RapidShyp Default",
            "aggregator": "rapidshyp",
            "api_key": os.getenv("RAPIDSHYP_API_KEY", "YOUR_RAPID_KEY"),
            "cod": True,
            "order_value": 1000,
            "weight": 1.0,
        },
    ]


def _zone_for_index(idx: int) -> str:
    zones = ["A", "B", "C", "D", "E"]
    return zones[idx % len(zones)]


@router.post("/api/check-serviceability")
def check_serviceability_api(
    pickup_pincode: str = Query(..., min_length=6, max_length=6),
    destination_pincode: str = Query(..., min_length=6, max_length=6),
    user_id: str = Query("demo_user"),
    cod: bool = Query(True),
    order_value: float = Query(1000),
    weight: float = Query(1.0),
) -> Dict[str, Any]:
    try:
        ratecards = get_user_ratecards(user_id)
        all_serviceable: List[Dict[str, Any]] = []
        table_rows: List[Dict[str, Any]] = []

        aggregators: Dict[str, List[Dict[str, Any]]] = {
            "fship": [],
            "rapidshyp": [],
        }

        for rc in ratecards:
            agg = rc.get("aggregator", "")
            if agg in aggregators:
                aggregators[agg].append(rc)

        for agg_name, creds in aggregators.items():
            if not creds:
                continue

            active_creds = creds[0]
            if agg_name == "fship":
                result = fship_common.check_serviceability(
                    pickup_pincode,
                    destination_pincode,
                    signature=active_creds.get("signature", ""),
                )
            elif agg_name == "rapidshyp":
                result = rapidshyp_common.check_serviceability(
                    pickup_pincode,
                    destination_pincode,
                    api_key=active_creds.get("api_key", ""),
                    cod=cod,
                    order_value=order_value,
                    weight=weight,
                )
            else:
                continue

            for courier in result.get("couriers", []):
                if not courier.get("serviceable"):
                    continue

                row_idx = len(table_rows)
                eta = courier.get("eta", "N/A")
                ctype = courier.get("type", "surface")

                all_serviceable.append(
                    {
                        "name": courier.get("name", "Unknown"),
                        "aggregator": agg_name,
                        "eta": eta,
                        "type": ctype,
                    }
                )

                table_rows.append(
                    {
                        "id": row_idx,
                        "courier": courier.get("name", "Unknown"),
                        "destination": f"{destination_pincode} - {agg_name.upper()}",
                        "pickup": True,
                        "reverse": False,
                        "prepaid": True,
                        "cod": ctype != "air",
                        "ndd": "1" in str(eta) or ctype == "air",
                        "zone": _zone_for_index(row_idx),
                    }
                )

        return {
            "serviceable_couriers": all_serviceable,
            "table_rows": table_rows,
        }

    except Exception as exc:
        logger.error("Serviceability check failed: %s", str(exc))
        raise HTTPException(
            status_code=500,
            detail="Internal server error while checking serviceability.",
        )
