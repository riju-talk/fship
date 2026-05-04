import hashlib


def _score(pickup_pincode: str, destination_pincode: str, courier_name: str, salt: str) -> int:
    payload = f"{pickup_pincode}:{destination_pincode}:{courier_name}:{salt}"
    digest = hashlib.sha256(payload.encode("utf-8")).digest()
    return sum(digest) % 100


def _build_eta(score: int) -> str:
    min_days = 1 + (score % 3)
    max_days = min_days + 1 + (score % 2)
    return f"{min_days}-{max_days} days"


def _build_type(score: int) -> str:
    return "air" if score % 2 == 0 else "surface"


async def check_serviceability(pickup_pincode: str, destination_pincode: str, couriers=None, **kwargs):
    couriers = couriers or []
    if not pickup_pincode or not destination_pincode:
        return {"aggregator": "Fship", "couriers": [], "error": "invalid_pincode"}

    results = []
    for courier_name in couriers:
        score = _score(pickup_pincode, destination_pincode, courier_name, "fship")
        serviceable = score % 4 != 0
        results.append(
            {
                "name": courier_name,
                "serviceable": serviceable,
                "eta": _build_eta(score),
                "type": _build_type(score),
            }
        )

    return {"aggregator": "Fship", "couriers": results}
