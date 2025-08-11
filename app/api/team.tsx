"use server"

import apiService from "@/lib/api";
import initializeTokens from "@/lib/tokens-init";

interface Team {
  id: number;
  email: string;
  name: string;
  // Add other profile fields as needed
}

const API_ENDPOINTS = {
  YOUR_TEAM: "/api/sport-teams/owner",
  TEAMS: "/api/sport-teams",
  INVITE: "/api/sport-teams/members/add",
  REMOVE: "/api/sport-teams/member/remove",
  APPROVE: "/api/sport-teams/member/approve",
  JOIN: "/api/sport-teams/member/add"
} as const;

const CACHE_REVALIDATE_TIME = 60; // 60 seconds

export async function fetchOwnTeams({
  itemsPerPage = 10,
  page = 1,
}): Promise<any> {
  await initializeTokens();

  try {
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.YOUR_TEAM}/?itemsPerPage=${itemsPerPage}&page=${page}`,
      { cache: "no-store" }
    );
   
    if (!response) {
      throw new Error("No team data received");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to fetch teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetcTeamById(id:string): Promise<any> {
  await initializeTokens();

  try {
    const response = await apiService.get<any>(
      `${API_ENDPOINTS.YOUR_TEAM}/${id}`,
      { cache: "no-store" }
    );
   
    if (!response) {
      throw new Error("No team data received");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to fetch teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function fetchTeams(): Promise<any> {
  await initializeTokens();

  try {
    const response = await apiService.get<any>(
      API_ENDPOINTS.TEAMS,
      { cache: "no-store" }
    );
   
    if (!response) {
      throw new Error("No team data received");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to fetch teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function registerTeam(payload: any): Promise<any> {
  await initializeTokens();

  try {
    const response = await apiService.post<any>(
      API_ENDPOINTS.TEAMS,
      payload,
      { cache: "no-store" }
    );
   
    if (!response) {
      throw new Error("Failed to create team");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to create team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateTeam(payload: any): Promise<any> {
  await initializeTokens();
  try {
    const response = await apiService.patch<any>(
      `${API_ENDPOINTS.TEAMS}/${payload.teamId}`,
      payload,
      { cache: "no-store" }
    );
   
    if (!response) {
      throw new Error("Failed to create team");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to create team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function requestJoinTeam(payload: any): Promise<any> {
  await initializeTokens();
  try {
    const response = await apiService.post<any>(
      API_ENDPOINTS.JOIN,
      payload,
      { cache: "no-store" }
    );
   
    if (!response) {
      throw new Error("Failed to join team");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to join team: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function inviteMembers(payload: any): Promise<any> {
  await initializeTokens();
  try {
    const response = await apiService.post<any>(
      API_ENDPOINTS.INVITE,
      payload,
      { cache: "no-store" }
    );
   
    if (!response) {
      throw new Error("Failed to add member");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to add member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function removeMembers(payload: any): Promise<any> {
  await initializeTokens();
  try {
    const response = await apiService.delete<any>(
      API_ENDPOINTS.REMOVE,
      payload,
    );
   
    if (!response) {
      throw new Error("Failed to remove member");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to remove member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function approveMember(payload: any): Promise<any> {
  await initializeTokens();
  try {
    const response = await apiService.post<any>(
      API_ENDPOINTS.APPROVE,
      payload,
    );
   
    if (!response) {
      throw new Error("Failed to approve member");
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to approve member: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}