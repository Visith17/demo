import apiService from "@/lib/api";
import { cookies } from "next/headers";
// Initialize API context
const initializeTokens = async () => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value ?? null;
      const refreshToken = cookieStore.get("refreshToken")?.value ?? null;
    
      if (!accessToken) {
        throw new Error("No access token found");
      }
      
      apiService.initializeTokensFromContext(accessToken, refreshToken);
    } catch (error) {
      throw new Error("Authentication failed: Please log in again");
    }
  };

export default initializeTokens