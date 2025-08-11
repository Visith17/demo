"use server"

import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";

interface Sport {
  id: number;
  name: string;
}

const API_ENDPOINTS = {
  SPORT: "/api/sport-types/filter"
} as const;

const CACHE_REVALIDATE_TIME = 60; // 60 seconds

export async function fetchSportFilter(): Promise<Sport> {
  await initializeTokens();

  try {
    const response = await apiService.get<Sport>(
      API_ENDPOINTS.SPORT,
      {
        next: { revalidate: CACHE_REVALIDATE_TIME },
      }
    );
    
    if (!response) {
      throw new Error("No sports data received");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to fetch sports: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}