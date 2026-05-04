"""
Test script for Pincode Serviceability Feature
Run this to verify all API endpoints are working correctly.
"""

import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(endpoint, method="GET", data=None):
    """Make HTTP request and return response."""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}

    if data:
        data = json.dumps(data).encode('utf-8')

    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return {
                "status": response.status,
                "data": json.loads(response.read().decode('utf-8')),
                "headers": dict(response.headers)
            }
    except urllib.error.HTTPError as e:
        return {
            "status": e.code,
            "data": json.loads(e.read().decode('utf-8')) if e.fp else {},
            "error": str(e)
        }
    except Exception as e:
        return {"status": 0, "error": str(e)}

def test_dashboard_data():
    """Test dashboard data endpoint."""
    print("\n📊 TEST 1: Dashboard Data Endpoint")
    print("-" * 50)

    result = make_request("/api/dashboard-data?user_id=demo_user")

    if result["status"] == 200:
        data = result["data"]
        checks = [
            ("active_couriers" in data, "Has active_couriers field"),
            ("pincodes_covered" in data, "Has pincodes_covered field"),
            ("cod_available" in data, "Has cod_available field"),
            ("ndd_zones" in data, "Has ndd_zones field"),
            (isinstance(data.get("active_couriers"), int), "active_couriers is integer"),
            (data["active_couriers"] > 0, "Has at least 1 active courier"),
        ]

        passed = sum(1 for check, _ in checks if check)
        total = len(checks)

        for check, desc in checks:
            status = "✅" if check else "❌"
            print(f"  {status} {desc}")

        print(f"\n  Result: {passed}/{total} checks passed")
        print(f"  Data: {json.dumps(data, indent=4)}")
        return passed == total
    else:
        print(f"  ❌ Request failed with status {result['status']}")
        print(f"  Error: {result.get('error', 'Unknown')}")
        return False

def test_warehouses():
    """Test warehouses endpoint."""
    print("\n🏭 TEST 2: Warehouses Endpoint")
    print("-" * 50)

    result = make_request("/api/warehouses?user_id=demo_user")

    if result["status"] == 200:
        data = result["data"]
        warehouses = data.get("warehouses", [])

        checks = [
            ("warehouses" in data, "Has warehouses field"),
            (isinstance(warehouses, list), "warehouses is a list"),
            (len(warehouses) > 0, "Has at least 1 warehouse"),
        ]

        if warehouses:
            wh = warehouses[0]
            checks.extend([
                ("warehouse_id" in wh, "Warehouse has warehouse_id"),
                ("name" in wh, "Warehouse has name"),
                ("pincode" in wh, "Warehouse has pincode"),
                ("city" in wh, "Warehouse has city"),
            ])

        passed = sum(1 for check, _ in checks if check)
        total = len(checks)

        for check, desc in checks:
            status = "✅" if check else "❌"
            print(f"  {status} {desc}")

        print(f"\n  Result: {passed}/{total} checks passed")
        print(f"  Warehouses found: {len(warehouses)}")
        for wh in warehouses:
            print(f"    - {wh['name']} ({wh['pincode']})")
        return passed == total
    else:
        print(f"  ❌ Request failed with status {result['status']}")
        return False

def test_serviceability_basic():
    """Test basic serviceability check."""
    print("\n🔍 TEST 3: Basic Serviceability Check")
    print("-" * 50)

    result = make_request("/api/check-serviceability?pickup_pincode=110001&destination_pincode=400001&user_id=demo_user")

    if result["status"] == 200:
        data = result["data"]
        couriers = data.get("serviceable_couriers", [])

        checks = [
            ("serviceable_couriers" in data, "Has serviceable_couriers field"),
            ("pickup_pincode" in data, "Has pickup_pincode field"),
            ("destination_pincode" in data, "Has destination_pincode field"),
            (isinstance(couriers, list), "serviceable_couriers is a list"),
            (len(couriers) > 0, "Has at least 1 serviceable courier"),
        ]

        if couriers:
            courier = couriers[0]
            checks.extend([
                ("name" in courier, "Courier has name"),
                ("aggregator" in courier, "Courier has aggregator"),
                ("eta" in courier, "Courier has eta"),
                ("type" in courier, "Courier has type"),
                ("pickup" in courier, "Courier has pickup flag"),
                ("cod" in courier, "Courier has cod flag"),
                ("ndd" in courier, "Courier has ndd flag"),
                ("zone" in courier, "Courier has zone"),
            ])

        passed = sum(1 for check, _ in checks if check)
        total = len(checks)

        for check, desc in checks:
            status = "✅" if check else "❌"
            print(f"  {status} {desc}")

        print(f"\n  Result: {passed}/{total} checks passed")
        print(f"  Couriers found: {len(couriers)}")
        for c in couriers:
            print(f"    - {c['name']} via {c['aggregator']} (ETA: {c['eta']}, Zone: {c['zone']})")
        return passed == total
    else:
        print(f"  ❌ Request failed with status {result['status']}")
        return False

def test_serviceability_with_warehouse():
    """Test serviceability check with warehouse ID."""
    print("\n🏭 TEST 4: Serviceability with Warehouse ID")
    print("-" * 50)

    result = make_request("/api/check-serviceability?warehouse_id=wh-01&destination_pincode=560001&user_id=demo_user")

    if result["status"] == 200:
        data = result["data"]
        couriers = data.get("serviceable_couriers", [])

        checks = [
            ("serviceable_couriers" in data, "Has serviceable_couriers field"),
            (data.get("pickup_pincode") == "110001", "Warehouse resolved to correct pincode (110001)"),
            (len(couriers) > 0, "Has serviceable couriers"),
        ]

        passed = sum(1 for check, _ in checks if check)
        total = len(checks)

        for check, desc in checks:
            status = "✅" if check else "❌"
            print(f"  {status} {desc}")

        print(f"\n  Result: {passed}/{total} checks passed")
        return passed == total
    else:
        print(f"  ❌ Request failed with status {result['status']}")
        return False

def test_invalid_pincode():
    """Test error handling for invalid pincode."""
    print("\n⚠️  TEST 5: Invalid Pincode Handling")
    print("-" * 50)

    result = make_request("/api/check-serviceability?pickup_pincode=invalid&destination_pincode=400001&user_id=demo_user")

    checks = [
        (result["status"] == 422, "Returns 422 status code"),
        ("detail" in result.get("data", {}), "Returns error detail"),
    ]

    passed = sum(1 for check, _ in checks if check)
    total = len(checks)

    for check, desc in checks:
        status = "✅" if check else "❌"
        print(f"  {status} {desc}")

    print(f"\n  Result: {passed}/{total} checks passed")
    print(f"  Error message: {result.get('data', {}).get('detail', 'N/A')}")
    return passed == total

def test_missing_pickup():
    """Test error handling for missing pickup."""
    print("\n⚠️  TEST 6: Missing Pickup Pincode Handling")
    print("-" * 50)

    result = make_request("/api/check-serviceability?destination_pincode=400001&user_id=demo_user")

    checks = [
        (result["status"] == 422, "Returns 422 status code"),
        ("detail" in result.get("data", {}), "Returns error detail"),
    ]

    passed = sum(1 for check, _ in checks if check)
    total = len(checks)

    for check, desc in checks:
        status = "✅" if check else "❌"
        print(f"  {status} {desc}")

    print(f"\n  Result: {passed}/{total} checks passed")
    return passed == total

def test_invalid_warehouse():
    """Test error handling for invalid warehouse ID."""
    print("\n⚠️  TEST 7: Invalid Warehouse ID Handling")
    print("-" * 50)

    result = make_request("/api/check-serviceability?warehouse_id=invalid-wh&destination_pincode=400001&user_id=demo_user")

    checks = [
        (result["status"] == 422, "Returns 422 status code"),
        ("error" in result.get("data", {}), "Returns error field"),
        (result["data"].get("serviceable_couriers") == [], "Returns empty couriers list"),
    ]

    passed = sum(1 for check, _ in checks if check)
    total = len(checks)

    for check, desc in checks:
        status = "✅" if check else "❌"
        print(f"  {status} {desc}")

    print(f"\n  Result: {passed}/{total} checks passed")
    return passed == total

def test_cors_headers():
    """Test CORS headers for OPTIONS requests."""
    print("\n🌐 TEST 8: CORS Headers (OPTIONS Request)")
    print("-" * 50)

    # Use curl directly since urllib doesn't handle OPTIONS well
    import subprocess
    try:
        result = subprocess.run(
            ["curl", "-X", "OPTIONS", "-s", "-D", "-", "-o", "/dev/null", f"{BASE_URL}/api/check-serviceability"],
            capture_output=True,
            text=True,
            timeout=5
        )
        headers_text = result.stdout

        checks = [
            ("HTTP/1.1 200 OK" in headers_text or "HTTP/1 200" in headers_text, "OPTIONS returns 200"),
            ("Access-Control-Allow-Origin: *" in headers_text, "Has Access-Control-Allow-Origin header"),
            ("GET" in headers_text and "OPTIONS" in headers_text, "Allows GET and OPTIONS methods"),
        ]

        passed = sum(1 for check, _ in checks if check)
        total = len(checks)

        for check, desc in checks:
            status = "✅" if check else "❌"
            print(f"  {status} {desc}")

        print(f"\n  Result: {passed}/{total} checks passed")
        return passed == total
    except Exception as e:
        print(f"  ❌ Test failed: {e}")
        return False

def test_health_endpoint():
    """Test health endpoint."""
    print("\n❤️  TEST 9: Health Endpoint")
    print("-" * 50)

    result = make_request("/health")

    checks = [
        (result["status"] == 200, "Returns 200 status"),
        (result.get("data", {}).get("status") == "ok", "Returns status: ok"),
    ]

    passed = sum(1 for check, _ in checks if check)
    total = len(checks)

    for check, desc in checks:
        status = "✅" if check else "❌"
        print(f"  {status} {desc}")

    print(f"\n  Result: {passed}/{total} checks passed")
    return passed == total

def test_frontend_page():
    """Test frontend page loads."""
    print("\n🖼️  TEST 10: Frontend Page Load")
    print("-" * 50)

    try:
        req = urllib.request.Request(f"{BASE_URL}/")
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8')

            checks = [
                (response.status == 200, "Returns 200 status"),
                ("Serviceability" in html, "Contains Serviceability text"),
                ("active-couriers" in html, "Has active-couriers element"),
                ("pincodes-covered" in html, "Has pincodes-covered element"),
                ("cod-available" in html, "Has cod-available element"),
                ("ndd-zones" in html, "Has ndd-zones element"),
                ("app.js" in html, "Includes app.js script"),
            ]

            passed = sum(1 for check, _ in checks if check)
            total = len(checks)

            for check, desc in checks:
                status = "✅" if check else "❌"
                print(f"  {status} {desc}")

            print(f"\n  Result: {passed}/{total} checks passed")
            return passed == total
    except Exception as e:
        print(f"  ❌ Request failed: {e}")
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("🧪 PINCODE SERVICEABILITY FEATURE - TEST SUITE")
    print("=" * 60)
    print(f"\nTesting against: {BASE_URL}")
    print("Make sure the Django server is running on port 8000")

    tests = [
        test_health_endpoint,
        test_dashboard_data,
        test_warehouses,
        test_serviceability_basic,
        test_serviceability_with_warehouse,
        test_invalid_pincode,
        test_missing_pickup,
        test_invalid_warehouse,
        test_cors_headers,
        test_frontend_page,
    ]

    results = []
    for test_func in tests:
        try:
            results.append(test_func())
        except Exception as e:
            print(f"\n  💥 Test crashed: {e}")
            results.append(False)

    print("\n" + "=" * 60)
    print("📊 FINAL RESULTS")
    print("=" * 60)

    passed = sum(results)
    total = len(results)

    print(f"\n  Tests Passed: {passed}/{total}")

    if passed == total:
        print("\n  🎉 ALL TESTS PASSED! The feature is working correctly.")
        return 0
    else:
        print(f"\n  ⚠️  {total - passed} test(s) failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())