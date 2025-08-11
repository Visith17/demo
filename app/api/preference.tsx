"use server"

import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";

interface Preference {
  id: number;
  notifications: string;
  theme: string;
  language: string;
  userId: number;
  sportTypeIds: any;
  sportClubIds: any;
  favoriteTime: string;
  // Add other profile fields as needed
}

const API_ENDPOINTS = {
  PREFERENCE: "/api/preference/me",
  UPDATE: "/api/preference"
} as const;

const CACHE_REVALIDATE_TIME = 6; // 60 seconds

export async function fetchPrefernce(): Promise<Preference> {
  await initializeTokens();

  try {
    const response = await apiService.get<Preference>(
      API_ENDPOINTS.PREFERENCE,
      { cache: "no-store" }
    );
    if (!response) {
      throw new Error("No preference data received");
    }
    
    return {
      ...response,
      sportTypeIds: response.sportTypeIds.map((s: {id: string}) => {return s.id.toString()}),
      sportClubIds: response.sportClubIds.map((c: {id: string})=>{ return c.id.toString()}),
    };
  } catch (error) {
    throw new Error(`Failed to fetch preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updatePreference(payload: any): Promise<Preference> {
  await initializeTokens();
  try {
    const response = await apiService.put<Preference>(
      API_ENDPOINTS.UPDATE, payload,
      {
        next: { revalidate: CACHE_REVALIDATE_TIME },
      }
    );
    if (!response) {
      throw new Error("No preference data received");
    }
    return {
      ...response,
      sportTypeIds: response.sportTypeIds.map((s: {id: number}) => {return s.id}),
      sportClubIds: response.sportClubIds.map((c: {id: number})=>{ return c.id})
    };
  } catch (error) {
    throw new Error(`Failed to fetch preference: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}