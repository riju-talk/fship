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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#ef6a23] border-t-transparent" />
        Loading warehouses...
      </div>
    );
  }

  return (
    <select
      disabled={disabled}
      defaultValue=""
      onChange={(e) => onSelect(e.target.value)}
      className="w-full rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#ef6a23]/20 disabled:bg-[#f9fafb]"
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
