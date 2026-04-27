/**
 * Serviceability API Client
 * 
 * This module provides functions to interact with the backend serviceability API.
 * All API calls are routed through the FastAPI backend which then calls:
 * - Fship Pincode Serviceability API
 * - RapidShyp B2C Pincode Serviceability API
 */

export interface Courier {
  name: string;
  aggregator: string;
  eta: string;
  type: string;
}

export interface TableRow {
  id: number;
  courier: string;
  destination: string;
  pickup: boolean;
  reverse: boolean;
  prepaid: boolean;
  cod: boolean;
  ndd: boolean;
  zone: string;
}

export interface ServiceabilityResponse {
  serviceable_couriers: Courier[];
  table_rows: TableRow[];
}

export interface CheckServiceabilityParams {
  pickup_pincode: string;
  destination_pincode: string;
  user_id?: string;
}

/**
 * Check serviceability between two pincodes
 * 
 * @param params - The check parameters
 * @returns Promise resolving to serviceability data
 */
export async function checkServiceability(
  params: CheckServiceabilityParams
): Promise<ServiceabilityResponse> {
  const { pickup_pincode, destination_pincode, user_id = 'demo_user' } = params;

  const queryParams = new URLSearchParams({
    pickup_pincode,
    destination_pincode,
    user_id,
  });

  const response = await fetch(`/api/check-serviceability?${queryParams.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Serviceability API failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Validate pincode format (6 digits)
 */
export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}
