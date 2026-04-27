// src/components/ServiceabilityChecker.jsx
// The main page component. Drop this into your App.jsx or route.
// Handles: pickup mode toggle, form state, API call, loading, results, errors.

import { useState } from "react";
import { checkServiceability } from "../api/serviceability";
import WarehouseSelector from "./WarehouseSelector";
import CourierResultCard from "./CourierResultCard";

const USER_ID = "demo_user"; // Replace with your auth context / JWT user_id

export default function ServiceabilityChecker() {
  // Form state
  const [pickupMode, setPickupMode] = useState("pincode"); // "pincode" | "warehouse"
  const [pickupPincode, setPickupPincode] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [destPincode, setDestPincode] = useState("");
  const [cod, setCod] = useState(false);
  const [orderValue, setOrderValue] = useState("");
  const [weight, setWeight] = useState("");

  // Result state
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Input validation
  const isValidPincode = (p) => /^\d{6}$/.test(p);

  const canSubmit =
    (pickupMode === "pincode" ? isValidPincode(pickupPincode) : Boolean(warehouseId)) &&
    isValidPincode(destPincode);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const params = {
        user_id: USER_ID,
        destination_pincode: destPincode,
        ...(pickupMode === "pincode"
          ? { pickup_pincode: pickupPincode }
          : { warehouse_id: warehouseId }),
        ...(cod !== undefined && { cod }),
        ...(orderValue && { order_value: parseFloat(orderValue) }),
        ...(weight && { weight: parseFloat(weight) })
      };

      const data = await checkServiceability(params);
      setResults(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "640px", margin: "40px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h2 style={{ marginBottom: "24px" }}>🚚 Check Courier Serviceability</h2>

      {/* ── PICKUP SOURCE ────────────────────────────── */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: 600 }}>Pickup From</label>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          {["pincode", "warehouse"].map((mode) => (
            <button
              key={mode}
              onClick={() => { setPickupMode(mode); setPickupPincode(""); setWarehouseId(""); }}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                border: pickupMode === mode ? "2px solid #1a73e8" : "1px solid #ccc",
                background: pickupMode === mode ? "#e8f4ff" : "#fff",
                color: pickupMode === mode ? "#1a73e8" : "#555",
                fontWeight: pickupMode === mode ? 600 : 400,
                cursor: "pointer"
              }}
            >
              {mode === "pincode" ? "Enter Pincode" : "Select Warehouse"}
            </button>
          ))}
        </div>

        <div style={{ marginTop: "12px" }}>
          {pickupMode === "pincode" ? (
            <input
              type="text"
              maxLength={6}
              placeholder="Pickup Pincode (e.g. 110001)"
              value={pickupPincode}
              onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, ""))}
              style={inputStyle(pickupPincode && !isValidPincode(pickupPincode))}
            />
          ) : (
            <WarehouseSelector
              userId={USER_ID}
              onSelect={setWarehouseId}
              disabled={loading}
            />
          )}
        </div>
      </div>

      {/* ── DESTINATION PINCODE ───────────────────────── */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: 600 }}>Destination Pincode</label>
        <input
          type="text"
          maxLength={6}
          placeholder="e.g. 400001"
          value={destPincode}
          onChange={(e) => setDestPincode(e.target.value.replace(/\D/g, ""))}
          style={{ ...inputStyle(destPincode && !isValidPincode(destPincode)), marginTop: "8px" }}
        />
        {destPincode && !isValidPincode(destPincode) && (
          <div style={{ color: "#c62828", fontSize: "12px", marginTop: "4px" }}>
            Must be exactly 6 digits
          </div>
        )}
      </div>

      {/* ── OPTIONAL FILTERS ─────────────────────────── */}
      <details style={{ marginBottom: "20px" }}>
        <summary style={{ cursor: "pointer", color: "#555", fontSize: "14px" }}>
          Optional: COD / Order Value / Weight
        </summary>
        <div style={{ marginTop: "12px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
            <input type="checkbox" checked={cod} onChange={(e) => setCod(e.target.checked)} />
            COD Order
          </label>
          <input
            type="number"
            placeholder="Order Value (₹)"
            value={orderValue}
            onChange={(e) => setOrderValue(e.target.value)}
            style={{ ...inputStyle(), width: "140px" }}
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ ...inputStyle(), width: "120px" }}
          />
        </div>
      </details>

      {/* ── SUBMIT BUTTON ────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "8px",
          border: "none",
          background: canSubmit && !loading ? "#1a73e8" : "#ccc",
          color: "#fff",
          fontWeight: 700,
          fontSize: "16px",
          cursor: canSubmit && !loading ? "pointer" : "not-allowed",
          marginBottom: "24px"
        }}
      >
        {loading ? "Checking…" : "Check Serviceability"}
      </button>

      {/* ── ERROR STATE ───────────────────────────────── */}
      {error && (
        <div style={{
          background: "#fce8e8", border: "1px solid #f5c2c2",
          borderRadius: "8px", padding: "14px", color: "#c62828", marginBottom: "16px"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── RESULTS ───────────────────────────────────── */}
      {results && (
        <div>
          <h3 style={{ marginBottom: "12px" }}>
            {results.serviceable_couriers.length > 0
              ? `✅ ${results.serviceable_couriers.length} Courier${results.serviceable_couriers.length > 1 ? "s" : ""} Available`
              : "❌ No Serviceable Couriers Found"}
          </h3>
          <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>
            {results.pickup_pincode} → {results.destination_pincode}
          </p>

          {results.serviceable_couriers.length === 0 && (
            <div style={{
              textAlign: "center", padding: "40px", color: "#999",
              border: "1px dashed #ddd", borderRadius: "10px"
            }}>
              No courier partners service this route for your account.
            </div>
          )}

          {results.serviceable_couriers.map((courier, idx) => (
            <CourierResultCard key={`${courier.name}-${idx}`} courier={courier} />
          ))}
        </div>
      )}
    </div>
  );
}

// Shared input style helper
function inputStyle(hasError = false) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: `1px solid ${hasError ? "#c62828" : "#ccc"}`,
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box"
  };
}
