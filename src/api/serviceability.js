// src/api/serviceability.js
// Single place for all API calls — if the backend URL changes, fix it here only.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Check pincode serviceability.
 * @param {Object} params - { pickup_pincode?, destination_pincode, user_id, warehouse_id?, cod?, order_value?, weight? }
 * @returns {Promise<{ serviceable_couriers: Array, pickup_pincode: string, destination_pincode: string }>}
 */
export async function checkServiceability(params) {
  const query = new URLSearchParams();

  // Only append defined, non-null values
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const response = await fetch(
    `${BASE_URL}/api/check-serviceability?${query.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch user's warehouses for the pickup dropdown.
 */
export async function getUserWarehouses(userId) {
  const response = await fetch(
    `${BASE_URL}/api/warehouses?user_id=${encodeURIComponent(userId)}`
  );
  if (!response.ok) throw new Error("Failed to fetch warehouses");
  return response.json();
}
