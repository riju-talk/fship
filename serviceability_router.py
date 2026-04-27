import logging
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query

from aggregators.fship import common as fship_common
from aggregators.rapidshyp import common as rapidshyp_common

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


def get_user_ratecards(user_id: str) -> List[Dict[str, str]]:
    """
    Mock database function.
    Replace this with your real DB query.
    """
    _ = user_id
    return [
        {
            "courier_name": "Fship Default",
            "aggregator": "fship",
            "signature": "YOUR_FSHIP_KEY",
        },
        {
            "courier_name": "RapidShyp Default",
            "aggregator": "rapidshyp",
            "api_key": "YOUR_RAPID_KEY",
            "url": "https://api.rapidshyp.com/rapidshyp/apis/v1/serviceability_check",
        },
    ]


def _zone_for_index(idx: int) -> str:
    zones = ["A", "B", "C", "D", "E"]
    return zones[idx % len(zones)]


@router.post("/api/check-serviceability")
def check_serviceability_api(
    pickup_pincode: str = Query(..., description="Pickup pincode or warehouse ID"),
    destination_pincode: str = Query(..., description="Destination pincode"),
    user_id: str = Query("demo_user", description="Logged in user ID"),
) -> Dict[str, Any]:
    try:
        ratecards = get_user_ratecards(user_id)
        all_serviceable: List[Dict[str, Any]] = []
        table_rows: List[Dict[str, Any]] = []

        aggregators: Dict[str, List[Dict[str, str]]] = {
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

            if agg_name == "fship":
                result = fship_common.check_serviceability(
                    pickup_pincode,
                    destination_pincode,
                    signature=creds[0].get("signature", ""),
                )
            elif agg_name == "rapidshyp":
                result = rapidshyp_common.check_serviceability(
                    pickup_pincode,
                    destination_pincode,
                    api_key=creds[0].get("api_key", ""),
                    url=creds[0].get("url", ""),
                )
            else:
                result = {"couriers": []}

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
                        "reverse": agg_name != "fship",
                        "prepaid": True,
                        "cod": ctype != "air",
                        "ndd": "1" in eta or ctype == "air",
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
