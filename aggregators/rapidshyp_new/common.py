# Same as RapidShyp but with different base URL/key — isolated for future divergence
from aggregators.rapidshyp.common import check_serviceability as _rs_check
from database import settings

async def check_serviceability(pickup_pincode: str, destination_pincode: str, **kwargs):
    kwargs.setdefault("api_key", settings.RAPIDSHYP_NEW_API_KEY)
    kwargs.setdefault("base_url", settings.RAPIDSHYP_NEW_BASE_URL)
    result = await _rs_check(pickup_pincode, destination_pincode, **kwargs)
    result["aggregator"] = "RapidShyp New"  # Override for rate-card matching
    return result
