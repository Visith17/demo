import { cookies } from "next/headers";
// Initialize API context
const initializePreferences = async () => {
    try {
      const cookieStore = await cookies();
      const favoriteClubsRaw = cookieStore.get("favoriteClubs")?.value ?? null;
      const favoriteSportsRaw = cookieStore.get("favoriteSports")?.value ?? null;
      const favoriteTimeRaw = cookieStore.get('favoriteTime')?.value ?? null;
      
      const extractArray = (str: string | null): number[] | null => {
        if (!str) return null;
        const match = str.match(/\[(.*?)\]/);
        if (!match) return null;
        try {
          return JSON.parse(`[${match[1]}]`);
        } catch {
          return null;
        }
      };
      
      const favoriteSports = extractArray(favoriteSportsRaw);
      const favoriteClubs = extractArray(favoriteClubsRaw);
      const favoriteTime = favoriteTimeRaw?.slice(2) || null;
    
      return {favoriteClubs, favoriteSports, favoriteTime}
    } catch (error) {
      throw new Error("Authentication failed: Please log in again");
    }
  };

export default initializePreferences;