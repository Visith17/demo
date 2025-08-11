"use server"

import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";

interface Match {
  id: number;
  email: string;
  name: string;
  // Add other profile fields as needed
}

const API_ENDPOINTS = {
  MATCHES: "/api/matchmaking/requests", // get open matches
  OPEN_MATCH: "/api/matchmaking/request"
} as const;

const CACHE_REVALIDATE_TIME = 60; // 60 seconds

export async function fetchOopenMatches(): Promise<any> {
  await initializeTokens();

  try {
    const response = await apiService.get<any>(
      API_ENDPOINTS.MATCHES,
      { cache: "no-store" }
    );
    
    if (!response) {
      throw new Error("No match data received");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to fetch matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function openMatch(payload:any): Promise<any> {
  await initializeTokens();

  try {
    const response = await apiService.post<any>(
      `${API_ENDPOINTS.OPEN_MATCH}/${payload.teamId}`,
      payload,
      { cache: "no-store" }
    );
    
    if (!response) {
      throw new Error("No match data received");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to fetch matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}