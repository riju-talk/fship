export interface ServiceabilityCourier {
  name: string
  aggregator: string
  eta: string
  type: string
}

export interface ServiceabilityRow {
  id: number
  courier: string
  destination: string
  pickup: boolean
  reverse: boolean
  prepaid: boolean
  cod: boolean
  ndd: boolean
  zone: string
}

interface ServiceabilityResponse {
  serviceable_couriers?: ServiceabilityCourier[]
  table_rows?: ServiceabilityRow[]
}

const ZONES = ['A', 'B', 'C', 'D', 'E']

export async function checkServiceability(params: {
  pickupPincode: string
  destinationPincode: string
  userId?: string
  cod?: boolean
  orderValue?: number
  weight?: number
}): Promise<ServiceabilityRow[]> {
  const query = new URLSearchParams({
    pickup_pincode: params.pickupPincode,
    destination_pincode: params.destinationPincode,
    user_id: params.userId ?? 'demo_user',
    cod: String(params.cod ?? true),
    order_value: String(params.orderValue ?? 1000),
    weight: String(params.weight ?? 1),
  })

  const response = await fetch(`/api/check-serviceability?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.detail || `Serviceability API failed with ${response.status}`)
  }

  const data = (await response.json()) as ServiceabilityResponse
  if (Array.isArray(data.table_rows)) {
    return data.table_rows
  }

  const serviceableCouriers = Array.isArray(data.serviceable_couriers)
    ? data.serviceable_couriers
    : []

  return serviceableCouriers.map((courier, idx) => ({
    id: idx,
    courier: courier.name,
    destination: `${params.destinationPincode} - ${courier.aggregator.toUpperCase()}`,
    pickup: true,
    reverse: false,
    prepaid: true,
    cod: courier.type !== 'air',
    ndd: courier.type === 'air',
    zone: ZONES[idx % ZONES.length],
  }))
}
