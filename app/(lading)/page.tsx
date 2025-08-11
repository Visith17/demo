import { AvailablePitchParams } from "@/types";
import { fetchClubFilter } from "@/app/api/club";
import { fetchAvailablePitches } from "@/app/api/booking";
import PitchSkeletonList from "@/components/shared/PitchSkeletonList";
import FilterCard from "@/components/shared/filter/PitchFilterCard";
import PitchList from "@/components/shared/pitch/PitchList";
import { AlertCircle, Search } from "lucide-react";
import { fetchSportFilter } from "../api/sport";
import initializePreferences from "@/lib/preferences-init";

interface Props {
  searchParams: Record<string, string | null>;
}

// Constants
const DEFAULTS = {
  PAGE: 1,
  ITEMS_PER_PAGE: 10,
  INTERVAL_HOURS: 2
} as const;

// Enable dynamic data fetching for authentication
export const dynamic = 'force-dynamic';

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-red-700 mb-2">Unable to load pitches</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <p className="text-sm text-red-500">Please try again later or contact support if the problem persists.</p>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
      <Search className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        {hasFilters ? 'No matches found' : 'No pitches available'}
      </h2>
      <p className="text-gray-600">
        {hasFilters 
          ? 'Try adjusting your filters or selecting a different date'
          : 'Check back later for available pitches'}
      </p>
    </div>
  );
}

export default async function PitchesPage({ searchParams }: Props) {
  try {
    const {favoriteClubs, favoriteSports, favoriteTime} = await initializePreferences();
    // Wait for searchParams to resolve and parse them
    const fetchPayload: AvailablePitchParams = {
      page: searchParams.page ? parseInt(searchParams.page) : DEFAULTS.PAGE,
      itemsPerPage: searchParams.itemsPerPage ? parseInt(searchParams.itemsPerPage) : DEFAULTS.ITEMS_PER_PAGE,
      sportClubIds: searchParams.sportClubIds ? searchParams.sportClubIds.split(',').map(Number) : favoriteClubs,
      sportTypeIds: searchParams.sportTypeIds ? searchParams.sportTypeIds.split(',').map(Number) : favoriteSports,
      playDate: searchParams.playDate ?? null,
      timeIn: searchParams.timeIn ?? null,
      intervalHours: searchParams.intervalHours ? parseInt(searchParams.intervalHours) : 2,
      dayOption: favoriteTime ?? null
    };
    
    // Fetch data in parallel
    const [clubs, sports, pitches] = await Promise.all([
      fetchClubFilter(),
      fetchSportFilter(),
      fetchAvailablePitches(fetchPayload)
    ]);
    
    // Check if any filters are a pplied
    const hasFilters = Boolean(
      fetchPayload.sportClubIds ||
      fetchPayload.playDate ||
      fetchPayload.sportTypeIds ||
      fetchPayload.timeIn ||
      fetchPayload.timeOut
    );

    return (
      <main className="pb-20 md:pb-2 p-2 space-y-1 max-w-3xl mx-auto">
        <FilterCard clubs={clubs} sports={sports} />
          {/* <PitchSkeletonList/> */}
          {Array.isArray(pitches?.items) && pitches.items.length > 0 ? (
            <PitchList 
              availablePitches={pitches} 
              searchParams={searchParams} 
            />
            
          ) : (
            <EmptyState hasFilters={hasFilters} />
          )}
      </main>
    );
  } catch (error) {
    return (
      <main className="max-w-4xl mx-auto pb-20 md:pb-2 p-1 space-y-3">
        <ErrorState error={error instanceof Error ? error : new Error('An unexpected error occurred')} />
      </main>
    );
  }
}