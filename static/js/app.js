(function () {
  const USER_ID = "demo_user";
  const ZONES = ["A", "B", "C", "D", "E"];
  const ZONE_CLASSES = {
    A: "bg-emerald-100 text-emerald-700",
    B: "bg-blue-100 text-blue-700",
    C: "bg-amber-100 text-amber-700",
    D: "bg-purple-100 text-purple-700",
    E: "bg-rose-100 text-rose-700",
  };

  const shipmentType = document.getElementById("shipmentType");
  const expressType = document.getElementById("expressType");
  const warehouseSelect = document.getElementById("warehouseSelect");
  const sourcePincode = document.getElementById("sourcePincode");
  const destPincode = document.getElementById("destPincode");
  const searchBtn = document.getElementById("searchBtn");
  const resetBtn = document.getElementById("resetBtn");
  const resultsBody = document.getElementById("results-body");

  const defaultSearchLabel = searchBtn.textContent;
  const warehouseMap = new Map();
  const dashboardElements = {
    active: document.getElementById("active-couriers"),
    pincodes: document.getElementById("pincodes-covered"),
    cod: document.getElementById("cod-available"),
    ndd: document.getElementById("ndd-zones"),
  };

  function isValidPincode(value) {
    return /^\d{6}$/.test(value || "");
  }

  function formatNumber(value) {
    if (typeof value !== "number") {
      return value ?? "--";
    }
    return value.toLocaleString("en-US");
  }

  function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    resetBtn.disabled = isLoading;
    searchBtn.textContent = isLoading ? "Searching..." : defaultSearchLabel;

    if (isLoading) {
      renderSkeletonRows();
    }
  }

  function renderSkeletonRows() {
    const cell = "h-4 animate-skeleton rounded bg-[#e8edf4]";
    let rowsHtml = "";

    for (let i = 0; i < 5; i += 1) {
      rowsHtml += "<tr>";
      rowsHtml += `<td class=\"px-4 py-4\"><div class=\"${cell} w-24\"></div></td>`;
      rowsHtml += `<td class=\"px-4 py-4\"><div class=\"${cell} w-32\"></div></td>`;
      for (let j = 0; j < 5; j += 1) {
        rowsHtml += `<td class=\"px-4 py-4 text-center\"><div class=\"${cell} mx-auto w-10 rounded-full\" style=\"height:20px\"></div></td>`;
      }
      rowsHtml += `<td class=\"px-4 py-4 text-center\"><div class=\"${cell} mx-auto w-6\"></div></td>`;
      rowsHtml += "</tr>";
    }

    resultsBody.innerHTML = rowsHtml;
  }

  function renderEmptyState() {
    resultsBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
            <div class="mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-xl bg-[#eff2f7]">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <circle cx="14" cy="14" r="7" stroke="#94a3b8" stroke-width="1.8" />
                <path d="M19.1 19.1L24.8 24.8" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round" />
                <circle cx="11" cy="20.8" r="4.5" fill="#d5dbea" />
                <path d="M9 20.8h4M11 18.8v4" stroke="#7f8da7" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <p class="mb-2 text-[28px] font-semibold leading-none text-[#1f2937]">No data available</p>
            <p class="max-w-[430px] text-[15px] leading-[1.55] text-[#717b8c]">
              Please enter source and destination pincodes to check for available courier services in our network.
            </p>
            <div class="mt-5 flex items-center gap-2 text-[11px] text-[#a0a9b7]">
              <span class="h-1 w-1 rounded-full bg-[#c2cad7]"></span>
              <span>Real-time verification</span>
              <span class="h-1 w-1 rounded-full bg-[#c2cad7]"></span>
              <span>Priority routing</span>
            </div>
          </div>
        </td>
      </tr>
    `;
  }

  function mapCouriersToRows(response, destination) {
    const couriers = Array.isArray(response.serviceable_couriers)
      ? response.serviceable_couriers
      : [];

    return couriers.map((courier, idx) => {
      const courierType = String(courier.type || "surface").toLowerCase();
      const zone = courier.zone || ZONES[idx % ZONES.length];
      return {
        id: idx,
        courier: courier.name || "Unknown",
        destination: `${destination} - ${String(courier.aggregator || "NA").toUpperCase()}`,
        pickup: courier.pickup !== undefined ? courier.pickup : true,
        reverse: courier.reverse !== undefined ? courier.reverse : false,
        prepaid: courier.prepaid !== undefined ? courier.prepaid : true,
        cod: courier.cod !== undefined ? courier.cod : courierType !== "air",
        ndd: courier.ndd !== undefined ? courier.ndd : courierType === "air",
        zone,
      };
    });
  }

  function renderRows(rows) {
    if (!rows.length) {
      renderEmptyState();
      return;
    }

    let rowsHtml = "";
    rows.forEach((row, idx) => {
      const zoneLabel = row.zone || "-";
      const zoneClass = ZONE_CLASSES[zoneLabel] || "bg-gray-100 text-gray-600";
      const zoneHtml = zoneLabel === "-"
        ? '<span class="text-[11px] text-[#94a3b8]">-</span>'
        : `<span class=\"inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold ${zoneClass}\">${zoneLabel}</span>`;

      rowsHtml += `
        <tr class="animate-slide-up transition-colors duration-150 hover:bg-[#fafbfe]" style="animation-delay:${idx * 45}ms">
          <td class="px-4 py-3.5">
            <div class="flex items-center gap-2.5">
              <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#fff2ea]">
                <span class="text-[10px] font-bold text-[#ef6a23]">${row.courier.slice(0, 2).toUpperCase()}</span>
              </span>
              <span class="text-[13px] font-semibold text-[#1f2937]">${row.courier}</span>
            </div>
          </td>
          <td class="whitespace-nowrap px-4 py-3.5 text-[13px] text-[#4b5563]">${row.destination}</td>
          ${buildToggleCell(row.pickup)}
          ${buildToggleCell(row.reverse)}
          ${buildToggleCell(row.prepaid)}
          ${buildToggleCell(row.cod)}
          ${buildToggleCell(row.ndd)}
          <td class="px-4 py-3.5 text-center">${zoneHtml}</td>
        </tr>
      `;
    });

    resultsBody.innerHTML = rowsHtml;
  }

  function buildToggleCell(checked) {
    const value = checked ? "true" : "false";
    return `
      <td class="px-4 py-3.5 text-center">
        <div class="flex justify-center">
          <button class="toggle" role="switch" aria-checked="${value}" data-toggle="true">
            <span class="toggle-knob"></span>
          </button>
        </div>
      </td>
    `;
  }

  async function fetchServiceability(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });

    const response = await fetch(`/api/check-serviceability?${query.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error.detail || error.error || `API error: ${response.status}`;
      throw new Error(message);
    }

    return response.json();
  }

  async function fetchDashboardData() {
    if (!dashboardElements.active) {
      return;
    }
    try {
      const response = await fetch(`/api/dashboard-data?user_id=${USER_ID}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      dashboardElements.active.textContent = formatNumber(data.active_couriers);
      dashboardElements.pincodes.textContent = formatNumber(data.pincodes_covered);
      dashboardElements.cod.textContent = formatNumber(data.cod_available);
      dashboardElements.ndd.textContent = formatNumber(data.ndd_zones);
    } catch (error) {
      console.error("Dashboard data fetch failed:", error);
    }
  }

  async function loadWarehouses() {
    if (!warehouseSelect) {
      return;
    }
    try {
      const response = await fetch(`/api/warehouses?user_id=${USER_ID}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      const warehouses = Array.isArray(data.warehouses) ? data.warehouses : [];

      warehouses.forEach((warehouse) => {
        const option = document.createElement("option");
        option.value = warehouse.warehouse_id;
        option.textContent = `${warehouse.name} (${warehouse.pincode})`;
        warehouseSelect.appendChild(option);
        warehouseMap.set(warehouse.warehouse_id, warehouse);
      });
    } catch (error) {
      console.error("Warehouse fetch failed:", error);
    }
  }

  function syncWarehouseSelection() {
    if (!warehouseSelect) {
      return;
    }
    const selectedId = warehouseSelect.value;
    if (!selectedId) {
      sourcePincode.disabled = false;
      return;
    }

    const warehouse = warehouseMap.get(selectedId);
    if (warehouse) {
      sourcePincode.value = warehouse.pincode;
    }
    sourcePincode.disabled = true;
  }

  async function handleSearch() {
    const pickup = sourcePincode.value.trim();
    const destination = destPincode.value.trim();

    const warehouseId = warehouseSelect ? warehouseSelect.value : "";

    if (!warehouseId && !isValidPincode(pickup)) {
      alert("Please enter a valid pickup pincode or choose a warehouse.");
      return;
    }

    if (!isValidPincode(destination)) {
      alert("Please enter a valid 6-digit destination pincode.");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchServiceability({
        pickup_pincode: warehouseId ? "" : pickup,
        destination_pincode: destination,
        warehouse_id: warehouseId,
        user_id: USER_ID,
        shipment_type: shipmentType.value,
        express_type: expressType.value,
      });

      const rows = mapCouriersToRows(data, destination);
      renderRows(rows);
    } catch (error) {
      console.error("Serviceability API request failed:", error);
      renderEmptyState();
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    shipmentType.value = "forward";
    expressType.value = "air";
    if (warehouseSelect) {
      warehouseSelect.value = "";
    }
    sourcePincode.value = "";
    destPincode.value = "";
    sourcePincode.disabled = false;
    renderEmptyState();
  }

  searchBtn.addEventListener("click", handleSearch);
  resetBtn.addEventListener("click", handleReset);
  if (warehouseSelect) {
    warehouseSelect.addEventListener("change", syncWarehouseSelection);
  }

  resultsBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-toggle]");
    if (!button) {
      return;
    }
    const checked = button.getAttribute("aria-checked") === "true";
    button.setAttribute("aria-checked", checked ? "false" : "true");
  });

  fetchDashboardData();
  loadWarehouses();
  renderEmptyState();
})();
