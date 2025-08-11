"use server";

import { SelectItem, Club, ClubList } from "@/types";
import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";

// Types and interfaces
interface PaginationParams {
  itemsPerPage?: number;
  page?: number;
  search?: string;
}

interface SportClub {
  id: number;
  name: string;
}

interface SportType {
  id: number;
  name: string;
}

const CACHE_REVALIDATE_TIME = 60; // 60 seconds
const API_ENDPOINTS = {
  CLUB_FILTER: "/api/sport-clubs/filter",
  SPORT_TYPES: "/api/sport-types/filter",
  CLUBS: `/api/sport-clubs`,
  CLUB_DETAILS: "/api/sport-clubs/:id"
} as const;

const mapToSelectItem = <T extends SportClub | SportType>(item: T): SelectItem => ({
  id: item.id,
  value: item.id.toString(),
  label: item.name,
});

export async function fetchClubFilter(): Promise<SelectItem[]> {
  try {
    await initializeTokens();
    const response = await apiService.get<SportClub[]>(API_ENDPOINTS.CLUB_FILTER, {
      next: { revalidate: CACHE_REVALIDATE_TIME },
    });
    
    return response?.map(mapToSelectItem) ?? [];
    
  } catch (error) {
    throw new Error(`Failed to fetch sport clubs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchAllSportTypes(): Promise<SelectItem[]> {
  try {
    await initializeTokens();
    const response = await apiService.get<SportType[]>(API_ENDPOINTS.SPORT_TYPES, {
      next: { revalidate: CACHE_REVALIDATE_TIME },
    });
    return response?.map(mapToSelectItem) ?? [];
  } catch (error) {
    throw new Error(`Failed to fetch sport types: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchClubList({
  itemsPerPage = 10,
  page = 1,
  search
}: PaginationParams = {}) {
  try{
    await initializeTokens();
    const response = await apiService.get<ClubList>(`${API_ENDPOINTS.CLUBS}/?itemsPerPage=${itemsPerPage}&page=${page}&search=${search}`, { cache: "no-store" });
    
    return response ?? {};
  } catch (error) {
    throw new Error(`Failed to fetch clubs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
