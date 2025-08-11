"use server";
import apiService from "@/lib/api";
import { AvailablePitchParams } from "@/types";
import initializeTokens from "@/lib/tokens-init";

// Types and interfaces
interface PaginationParams {
  itemsPerPage?: number;
  page?: number;
}

interface BookingPayload {
  timeIn: string;
  timeOut: string;
  playDate: string;
  pitchDetailId: number;
  timePartIds: number[];
  totalHours: number;
  price: number;
}

interface Status {
  status: "confirmed" | "canceled" | "pending";
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_INTERVAL_HOURS = 2;

// API endpoints
export async function bookPitch(payload: BookingPayload) {
  await initializeTokens();
  return await apiService.post("/api/booking-details/", payload);
}

export async function fetchBookingList({
  itemsPerPage = DEFAULT_PAGE_SIZE,
  page = DEFAULT_PAGE,
}: PaginationParams = {}) {
  await initializeTokens();
  
  try {
    return await apiService.get(
      `/api/booking-details/?itemsPerPage=${itemsPerPage}&page=${page}`,
      { cache: "no-store" }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Authentication failed")) {
      throw error;
    }
    throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getBookingById(id: number) {
  await initializeTokens();
  return await apiService.get(
    `/api/booking-details/booking/${id}`,
    { cache: "no-store" }
  );
}

export async function fetchAvailablePitches({
  page = DEFAULT_PAGE,
  itemsPerPage = DEFAULT_PAGE_SIZE,
  sportClubIds,
  sportTypeIds,
  intervalHours,
  playDate,
  timeIn,
  timeOut,
  dayOption
}: AvailablePitchParams) {
  
  const AVAILABLE_PITCHES_URL = "/api/booking-details/available-pitch";
  
  const payload = {
    sportClubIds: sportClubIds,
    sportTypeIds: sportTypeIds,
    playDate: playDate ?? null,
    timeIn: timeIn ?? null,
    timeOut: timeOut ?? null,
    intervalHours,
    dayOption: dayOption ?? null
  };

  try {
    
    return await apiService.post(
      `${AVAILABLE_PITCHES_URL}/?itemsPerPage=${itemsPerPage}&page=${page}`,
      payload,
      { cache: "no-store" }
    );
  } catch (error) {
    throw new Error(`Failed to fetch available pitches: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handlePayNow(bookingId: number) {
  await initializeTokens();
  return await apiService.put<Status>(
    `/api/booking-details/${bookingId}`, 
    { status: "confirmed" }, 
    { cache: "no-store" }
  );
}

export async function handleCancelBooking(bookingId: number) {
  await initializeTokens();
  return await apiService.put<Status>(
    `/api/booking-details/${bookingId}`, 
    { status: "canceled" }, 
    { cache: "no-store" }
  );
}