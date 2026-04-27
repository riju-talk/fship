import { useState } from "react";
import { checkServiceability } from "../api/serviceability";

export default function ServiceabilityChecker() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pickupPincode, setPickupPincode] = useState("110001");
  const [destinationPincode, setDestinationPincode] = useState("400001");

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkServiceability({
        user_id: "demo_user",
        pickup_pincode: pickupPincode,
        destination_pincode: destinationPincode,
        cod: true,
        order_value: 1000,
        weight: 1,
      });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pincode Serviceability Checker</h2>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Pickup Pincode:{" "}
          <input
            type="text"
            value={pickupPincode}
            onChange={(e) => setPickupPincode(e.target.value)}
            maxLength="6"
          />
        </label>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Destination Pincode:{" "}
          <input
            type="text"
            value={destinationPincode}
            onChange={(e) => setDestinationPincode(e.target.value)}
            maxLength="6"
          />
        </label>
      </div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Checking…" : "Check"}
      </button>
      {error && <div style={{ color: "red", marginTop: "10px" }}>⚠️ {error}</div>}
      {results && (
        <div style={{ marginTop: "20px" }}>
          <h3>Serviceable Couriers:</h3>
          {results.serviceable_couriers?.length > 0 ? (
            results.serviceable_couriers.map((c, i) => (
              <div key={i} style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                <strong>{c.name}</strong> via {c.aggregator} · ETA: {c.eta} · {c.type}
              </div>
            ))
          ) : (
            <p>No serviceable couriers found for this route.</p>
          )}
        </div>
      )}
    </div>
  );
}
