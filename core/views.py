import asyncio
import logging
import re
from typing import Dict, List, Optional, Tuple

from asgiref.sync import sync_to_async
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET

from .models import Courier, Warehouse

logger = logging.getLogger(__name__)

PINCODE_RE = re.compile(r"^\d{6}$")

AGGREGATOR_ALIASES = {
    "fship": "Fship",
    "rapidshyp": "RapidShyp",
    "rapidshyp new": "RapidShyp New",
    "rapidshyp_new": "RapidShyp New",
}


def index(request):
    return render(request, "index.html")


@require_GET
def health(request):
    return JsonResponse({"status": "ok"})


@require_GET
def get_warehouses(request):
    user_id = _get_user_id(request)
    warehouses = list(
        Warehouse.objects.filter(user_id=user_id)
        .values("warehouse_id", "name", "pincode", "city")
        .order_by("name")
    )
    return JsonResponse({"warehouses": warehouses})


@require_GET
async def check_serviceability(request):
    user_id = _get_user_id(request)
    pickup = request.GET.get("pickup_pincode", "").strip()
    destination = request.GET.get("destination_pincode", "").strip()
    warehouse_id = request.GET.get("warehouse_id", "").strip()

    if warehouse_id:
        pickup = await _resolve_warehouse_pincode(warehouse_id, user_id)
        if not pickup:
            return JsonResponse(
                {"serviceable_couriers": [], "error": "Invalid warehouse_id"},
                status=422,
            )

    if not pickup:
        return JsonResponse(
            {"detail": "Either pickup_pincode or warehouse_id must be provided"},
            status=422,
        )

    if not _is_valid_pincode(pickup) or not _is_valid_pincode(destination):
        return JsonResponse(
            {"detail": "Pincodes must be 6 digits"},
            status=422,
        )

    ratecards = await sync_to_async(list)(
        Courier.objects.filter(user_id=user_id)
    )
    if not ratecards:
        return JsonResponse(
            {
                "serviceable_couriers": [],
                "pickup_pincode": pickup,
                "destination_pincode": destination,
                "error": "No rate cards configured for this user",
            }
        )

    aggregator_couriers, ratecard_map = _build_ratecard_map(ratecards)
    results = await _fetch_from_aggregators(pickup, destination, aggregator_couriers)

    serviceable = []
    for result in results:
        if not isinstance(result, dict) or result.get("error"):
            continue
        agg_label = _normalize_aggregator(result.get("aggregator", ""))
        if not agg_label:
            continue
        for courier in result.get("couriers", []):
            if not courier.get("serviceable"):
                continue
            name = (courier.get("name") or "").strip()
            if not name:
                continue
            ratecard = ratecard_map.get((agg_label, name.lower()))
            if not ratecard:
                continue
            serviceable.append(
                {
                    "name": ratecard.name,
                    "aggregator": ratecard.aggregator,
                    "eta": courier.get("eta") or ratecard.eta,
                    "type": courier.get("type") or ratecard.type,
                    "courier_code": ratecard.courier_code,
                    "pickup": ratecard.pickup_available,
                    "reverse": ratecard.reverse_available,
                    "prepaid": ratecard.prepaid_available,
                    "cod": ratecard.cod_available,
                    "ndd": ratecard.ndd_available,
                    "zone": ratecard.zone or "",
                    "cutoff_time": ratecard.cutoff_time.isoformat(timespec="minutes")
                    if ratecard.cutoff_time
                    else None,
                    "total_freight": float(ratecard.total_freight)
                    if ratecard.total_freight is not None
                    else None,
                }
            )

    return JsonResponse(
        {
            "serviceable_couriers": serviceable,
            "pickup_pincode": pickup,
            "destination_pincode": destination,
        }
    )


@require_GET
def dashboard_data(request):
    user_id = _get_user_id(request)
    active_couriers = (
        Courier.objects.filter(user_id=user_id)
        .values("courier_code")
        .distinct()
        .count()
    )
    pincodes_covered = (
        Warehouse.objects.filter(user_id=user_id)
        .values("pincode")
        .distinct()
        .count()
    )
    cod_available = (
        Courier.objects.filter(user_id=user_id, cod_available=True)
        .values("courier_code")
        .distinct()
        .count()
    )
    ndd_zones = (
        Courier.objects.filter(user_id=user_id, ndd_available=True)
        .exclude(zone="")
        .values("zone")
        .distinct()
        .count()
    )

    return JsonResponse(
        {
            "active_couriers": active_couriers,
            "pincodes_covered": pincodes_covered,
            "cod_available": cod_available,
            "ndd_zones": ndd_zones,
        }
    )


def _get_user_id(request) -> str:
    user_id = request.GET.get("user_id", "").strip()
    return user_id or "demo_user"


def _is_valid_pincode(value: str) -> bool:
    return bool(PINCODE_RE.match(value or ""))


def _normalize_aggregator(value: str) -> Optional[str]:
    if not value:
        return None
    normalized = value.strip().lower().replace("_", " ").replace("-", " ")
    normalized = re.sub(r"\s+", " ", normalized)
    return AGGREGATOR_ALIASES.get(normalized)


async def _resolve_warehouse_pincode(warehouse_id: str, user_id: str) -> Optional[str]:
    if not warehouse_id:
        return None

    warehouse = await sync_to_async(
        lambda: Warehouse.objects.filter(user_id=user_id, warehouse_id=warehouse_id)
        .values("pincode")
        .first()
    )()

    if not warehouse:
        return None
    return warehouse.get("pincode")


def _build_ratecard_map(
    ratecards: List[Courier],
) -> Tuple[Dict[str, List[str]], Dict[Tuple[str, str], Courier]]:
    aggregator_couriers: Dict[str, set] = {}
    ratecard_map: Dict[Tuple[str, str], Courier] = {}

    for ratecard in ratecards:
        agg_label = _normalize_aggregator(ratecard.aggregator)
        if not agg_label:
            continue
        aggregator_couriers.setdefault(agg_label, set()).add(ratecard.name)
        ratecard_map[(agg_label, ratecard.name.lower())] = ratecard

    return (
        {key: sorted(values) for key, values in aggregator_couriers.items()},
        ratecard_map,
    )


def _safe_import_aggregators() -> Dict[str, object]:
    modules: Dict[str, object] = {}
    try:
        from aggregators.fship import common as fship_common

        modules["Fship"] = fship_common
    except Exception as exc:
        logger.warning("Fship aggregator import failed: %s", exc)

    try:
        from aggregators.rapidshyp import common as rapidshyp_common

        modules["RapidShyp"] = rapidshyp_common
    except Exception as exc:
        logger.warning("RapidShyp aggregator import failed: %s", exc)

    try:
        from aggregators.rapidshyp_new import common as rapidshyp_new_common

        modules["RapidShyp New"] = rapidshyp_new_common
    except Exception as exc:
        logger.warning("RapidShyp New aggregator import failed: %s", exc)

    return modules


async def _fetch_from_aggregators(
    pickup: str,
    destination: str,
    aggregator_couriers: Dict[str, List[str]],
) -> List[dict]:
    modules = _safe_import_aggregators()
    tasks = []
    for agg_label, couriers in aggregator_couriers.items():
        module = modules.get(agg_label)
        if not module:
            logger.warning("Aggregator module missing for %s", agg_label)
            continue
        tasks.append(
            _call_aggregator(
                module,
                agg_label,
                pickup,
                destination,
                couriers,
            )
        )

    if not tasks:
        return []

    results = await asyncio.gather(*tasks, return_exceptions=True)
    normalized_results = []
    for result in results:
        if isinstance(result, Exception):
            logger.warning("Aggregator request failed: %s", result)
            continue
        normalized_results.append(result)
    return normalized_results


async def _call_aggregator(
    module: object,
    agg_label: str,
    pickup: str,
    destination: str,
    couriers: List[str],
) -> dict:
    try:
        return await asyncio.wait_for(
            module.check_serviceability(
                pickup_pincode=pickup,
                destination_pincode=destination,
                couriers=couriers,
            ),
            timeout=2.0,
        )
    except asyncio.TimeoutError:
        logger.warning("Aggregator %s timed out", agg_label)
        return {"aggregator": agg_label, "couriers": [], "error": "timeout"}
    except Exception as exc:
        logger.warning("Aggregator %s failed: %s", agg_label, exc)
        return {"aggregator": agg_label, "couriers": [], "error": "failed"}