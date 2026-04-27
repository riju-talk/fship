// src/components/CourierResultCard.jsx
export default function CourierResultCard({ courier }) {
  const isAir = courier.type?.toLowerCase() === "air";

  return (
    <div style={{
      border: "1px solid #e0e0e0",
      borderRadius: "10px",
      padding: "16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
      background: "#fff",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
    }}>
      {/* Left: Courier name + aggregator badge */}
      <div>
        <div style={{ fontWeight: 600, fontSize: "16px" }}>{courier.name}</div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
          via {courier.aggregator}
          {courier.courier_code && ` · #${courier.courier_code}`}
        </div>
        {courier.cutoff_time && (
          <div style={{ fontSize: "12px", color: "#e65c00", marginTop: "4px" }}>
            ⏰ Order by {courier.cutoff_time}
          </div>
        )}
      </div>

      {/* Right: ETA + type + freight */}
      <div style={{ textAlign: "right" }}>
        <div style={{
          display: "inline-block",
          padding: "3px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 600,
          background: isAir ? "#e8f4ff" : "#f0fdf4",
          color: isAir ? "#1a73e8" : "#15803d",
          marginBottom: "6px"
        }}>
          {isAir ? "✈ Air" : "🚛 Surface"}
        </div>
        {courier.eta && courier.eta !== "N/A" && (
          <div style={{ fontSize: "13px", color: "#333" }}>
            ETA: <strong>{courier.eta}</strong>
          </div>
        )}
        {courier.total_freight != null && (
          <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
            Est. ₹{courier.total_freight}
          </div>
        )}
      </div>
    </div>
  );
}
