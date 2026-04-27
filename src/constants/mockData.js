/**
 * Mock courier serviceability data.
 * In production this would come from an API call.
 */
export const SHIPMENT_TYPES = [
  { value: 'forward', label: 'Forward Shipment' },
  { value: 'reverse', label: 'Reverse Shipment' },
  { value: 'exchange', label: 'Exchange Shipment' },
]

export const EXPRESS_TYPES = [
  { value: 'air', label: 'Air Express' },
  { value: 'surface', label: 'Surface Express' },
  { value: 'priority', label: 'Priority Express' },
]

const COURIER_PARTNERS = [
  'Blue Dart',
  'Delhivery',
  'DTDC',
  'Ekart Logistics',
  'FedEx',
  'Xpressbees',
]

const DEST_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata']
const ZONES = ['A', 'B', 'C', 'D', 'E']

/**
 * Generates mock result rows based on search params.
 * Simulates a realistic API response shape.
 */
export function generateMockResults(shipmentType, expressType, sourcePincode, destPincode) {
  const typeBias = shipmentType === 'reverse' ? -0.08 : shipmentType === 'exchange' ? -0.03 : 0
  const speedBias = expressType === 'air' ? 0.08 : expressType === 'priority' ? 0.14 : 0
  const baseline = Math.max(0.35, 0.7 + speedBias + typeBias)

  return COURIER_PARTNERS.map((name, idx) => ({
    id: idx,
    courier: name,
    destination: `${destPincode} - ${DEST_CITIES[idx % DEST_CITIES.length]}`,
    pickup: Math.random() < baseline,
    reverse: Math.random() < baseline - 0.12,
    prepaid: Math.random() < baseline + 0.08,
    cod: Math.random() < baseline - 0.16,
    ndd: Math.random() < baseline - 0.2,
    zone: ZONES[idx % ZONES.length],
  }))
}
