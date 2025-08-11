"use server"

import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";
import { Notification } from "@/types";

export interface NotificationResponse {
  status: number;
  items: Notification[];
  total: number;
}

interface PaginationParams {
  itemsPerPage?: number;
  page?: number;
}

interface NotificationDetailResponse {
  status: number;
  data?: Notification;
}

const API_ENDPOINTS = {
  NOTIFICATIONS: "/api/notifications",
  NOTIFICATION_DETAIL: (id: number) => `/api/notifications/${id}`
} as const;

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

export async function fetchNotificationList(): Promise<NotificationResponse> {
  await initializeTokens();

  try {
    const response = await apiService.get<NotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS,
      { cache: "no-store" }
    );

    if (!response) {
      throw new Error("No response received from server");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getNotificationById(id: number): Promise<NotificationDetailResponse> {
  await initializeTokens();

  // TODO: Replace mock response with actual API call when ready
  return {
    status: 404
  };
  
  /* Uncomment when API is ready
  try {
    return await apiService.get<NotificationDetailResponse>(
      API_ENDPOINTS.NOTIFICATION_DETAIL(id)
    );
  } catch (error) {
    throw new Error(`Failed to fetch notification details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  */
}