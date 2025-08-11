"use server"

import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";

// Types
interface TimePartPayload {
  weekPartId: number;
  timeIn: string;
  timeOut: string;
}

interface TimePartResponse {
  status: number;
  timePartIds?: number[];
  error?: string;
}

// Constants
const API_CONFIG = {
  baseUrl: "/api/booking-details",
  endpoints: {
    timeParts: "/time-parts"
  },
  options: {
    cache: "no-store" as const
  }
} as const;

/**
 * Fetches time parts for a given booking slot
 * @param payload - The booking time details
 * @returns Promise<TimePartResponse>
 */
export async function fetchTimeParts(payload: TimePartPayload): Promise<TimePartResponse> {
  try {
    // Initialize API service with tokens
    await initializeTokens();

    // Build URL with path parameters
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.timeParts}/${payload.weekPartId}/${payload.timeIn}/${payload.timeOut}`;

    // Make API request with proper type
    const response = await apiService.get<TimePartResponse>(url, API_CONFIG.options);
    
    return {
      status: response.status || 200,
      timePartIds: response.timePartIds || []
    };
  } catch (error) {
    console.error('[fetchTimeParts] Error:', error);
    
    return {
      status: error instanceof Error && 'status' in error ? (error as any).status : 500,
      timePartIds: [],
      error: error instanceof Error ? error.message : 'Failed to fetch time parts'
    };
  }
}