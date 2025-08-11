"use server"
import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";
import { User } from "@/types";

const API_ENDPOINTS = {
  USER: (id: number) => `/api/user/${id}`,
  PROFILE: "/api/user-profile"
} as const;

const DEFAULT_USER: User = {
  id: -1,
  firstName: "",
  lastName: "",
  phone: ""
};

/**
 * Updates user information
 * @throws Error if update fails
 */
export async function updateUser(payload: User): Promise<User> {
  await initializeTokens();
  if (!payload.id) {
    throw new Error("User ID is required for update");
  }

  try {
    const response = await apiService.put<User>(
      API_ENDPOINTS.USER(payload.id),
      payload,
      { cache: "no-store" }
    );

    if (!response) {
      throw new Error("No response received from server");
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    throw new Error(`User update failed: ${message}`);
  }
}

export async function updatePassword(payload: string): Promise<string> {
  await initializeTokens();
  if (!payload) {
    throw new Error("User ID is required for update");
  }

  try {
    const response = await apiService.put<string>(
      API_ENDPOINTS.USER(1),
      payload,
      { cache: "no-store" }
    );

    if (!response) {
      throw new Error("No response received from server");
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user";
    throw new Error(`User update failed: ${message}`);
  }
}

/**
 * Fetches user profile information
 * @returns User profile or default user if fetch fails
 */
export async function fetchProfile(): Promise<User> {
  try {
    await initializeTokens();
    const response = await apiService.get<User>(API_ENDPOINTS.PROFILE);

    if (!response) {
      throw new Error("No profile data received");
    }

    return response;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return DEFAULT_USER;
  }
}