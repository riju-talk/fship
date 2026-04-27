# aggregators/rapidshyp_new/common.py
# Same logic as RapidShyp but isolated for independent future changes.
# When RapidShyp gives you v2 credentials, only THIS file needs updating.

import logging
from typing import Dict, Any
from database import settings
from aggregators.rapidshyp.common import check_serviceability as _rs_check

logger = logging.getLogger(__name__)

RAPIDSHYP_NEW_API_KEY = settings.RAPIDSHYP_NEW_API_KEY
RAPIDSHYP_NEW_BASE_URL = settings.RAPIDSHYP_NEW_BASE_URL


async def check_serviceability(
    pickup_pincode: str,
    destination_pincode: str,
    **kwargs
) -> Dict[str, Any]:
    """
    RapidShyp New — delegates to RapidShyp logic with different credentials.
    When v2 API diverges from v1, rewrite this function independently.
    """
    kwargs.setdefault("api_key", RAPIDSHYP_NEW_API_KEY)
    kwargs.setdefault("base_url", RAPIDSHYP_NEW_BASE_URL)

    result = await _rs_check(
        pickup_pincode=pickup_pincode,
        destination_pincode=destination_pincode,
        **kwargs
    )

    # Override aggregator label — the orchestrator uses this to match rate cards
    result["aggregator"] = "RapidShyp New"
    return result
