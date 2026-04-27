const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const checkServiceability = async (params) => {
  const q = new URLSearchParams(
    Object.entries(params)
      .filter(([_, v]) => v != null)
      .map(([k, v]) => [k, String(v)])
  );
  const res = await fetch(`${BASE}/api/check-serviceability?${q}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(
      (await res.json().catch(() => ({}))).detail || `API error: ${res.status}`
    );
  }
  return res.json();
};
