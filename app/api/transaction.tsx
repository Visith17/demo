"use server";

import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";

// Types and interfaces
interface PaginationParams {
  itemsPerPage?: number;
  page?: number;
}

const CACHE_REVALIDATE_TIME = 60; // 60 seconds
const API_ENDPOINTS = {
  TRANSACTION: `/api/transactions`,
  TRANSACTION_DETAILS: "/api/transactions/"
} as const;

export async function fetchTransactionList({
  itemsPerPage = 10,
  page = 1,
}: PaginationParams = {}) {
  try{
    await initializeTokens();
    const response = await apiService.get(`${API_ENDPOINTS.TRANSACTION}?itemsPerPage=${itemsPerPage}&page=${page}`, {
      cache: "no-store" 
    });
    return response ?? {}
  } catch (error) {
    throw new Error(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchTransactionById(id:string) {
  try{
    await initializeTokens();
    return await apiService.get(`/api/transactions/${id}`, { cache: "no-cache"})
  } catch (error){
    throw new Error(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
}
