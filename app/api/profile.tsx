"use server"

import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  // Add other profile fields as needed
}

const API_ENDPOINTS = {
  PROFILE: "/api/user-profile"
} as const;

const CACHE_REVALIDATE_TIME = 60; // 60 seconds

export async function fetchProfile(): Promise<UserProfile> {
  await initializeTokens();

  try {
    const response = await apiService.get<UserProfile>(
      API_ENDPOINTS.PROFILE,
      {
        next: { revalidate: CACHE_REVALIDATE_TIME },
      }
    );
    if (!response) {
      throw new Error("No profile data received");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}