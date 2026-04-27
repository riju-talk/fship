// src/components/WarehouseSelector.jsx
import { useState, useEffect } from "react";
import { getUserWarehouses } from "../api/serviceability";

export default function WarehouseSelector({ userId, onSelect, disabled }) {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getUserWarehouses(userId)
      .then((data) => setWarehouses(data.warehouses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <span>Loading warehouses…</span>;

  return (
    <select
      disabled={disabled}
      defaultValue=""
      onChange={(e) => onSelect(e.target.value)}
      style={{ width: "100%", padding: "8px", borderRadius: "6px" }}
    >
      <option value="">— Select a warehouse —</option>
      {warehouses.map((w) => (
        <option key={w.warehouse_id} value={w.warehouse_id}>
          {w.name} ({w.pincode}) {w.city ? `· ${w.city}` : ""}
        </option>
      ))}
    </select>
  );
}
