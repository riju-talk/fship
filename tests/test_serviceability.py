# tests/test_serviceability.py
import pytest
import pytest_asyncio
from httpx import AsyncClient
from main import app

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_missing_both_pickup_sources(client):
    """Should reject if neither pickup_pincode nor warehouse_id is given."""
    resp = await client.get("/api/check-serviceability?destination_pincode=400001&user_id=demo")
    assert resp.status_code == 422

@pytest.mark.asyncio
async def test_invalid_pincode_length(client):
    """Should reject 5-digit pincode."""
    resp = await client.get(
        "/api/check-serviceability?pickup_pincode=11000&destination_pincode=400001&user_id=demo"
    )
    assert resp.status_code == 422

@pytest.mark.asyncio
async def test_valid_request_returns_structure(client):
    """Valid request should always return the serviceable_couriers key."""
    resp = await client.get(
        "/api/check-serviceability?pickup_pincode=110001&destination_pincode=400001&user_id=demo_user"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "serviceable_couriers" in data
    assert isinstance(data["serviceable_couriers"], list)

@pytest.mark.asyncio
async def test_fship_aggregator_directly():
    """Integration test: real Fship staging API call."""
    from aggregators.fship.common import check_serviceability
    result = await check_serviceability("110001", "400001", timeout=5.0)
    assert result["aggregator"] == "Fship"
    assert "is_route_serviceable" in result
    assert isinstance(result["couriers"], list)

@pytest.mark.asyncio
async def test_rapidshyp_aggregator_directly():
    """Integration test: real RapidShyp API call."""
    from aggregators.rapidshyp.common import check_serviceability
    result = await check_serviceability(
        "110001", "400001", cod=True, order_value=2000, weight=1.0, timeout=5.0
    )
    assert result["aggregator"] == "RapidShyp"
    assert isinstance(result["couriers"], list)
