import ClubList from "@/components/shared/club/ClubList"
import { fetchClubList } from "@/app/api/club";
import { CalendarClock, HomeIcon, AlertCircle } from "lucide-react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import SearchServerParams from '@/components/shared/search/SearchServerParams';

// Force dynamic to ensure fresh data on each request
export const dynamic = 'force-dynamic';

// Error state component
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-red-700 mb-2">Unable to load sport clubs</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <p className="text-sm text-red-500">Please try again later or contact support if the problem persists.</p>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
      <CalendarClock className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-lg font-semibold text-gray-700 mb-2">No sport club</h2>
      <p className="text-gray-600">
        You&apos;re all caught up! New clubs will appear here
      </p>
    </div>
  );
}

export default async function ClubPage({ searchParams }: { searchParams: { search?: string } }) {
  
  try {
    const clubList = await fetchClubList({
      itemsPerPage: 10,
      page: 1,
      search: searchParams?.search?? ''
    });
    
    return (
      <main className="md:container pb-20 md:pb-2">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 my-4 px-2">
          <div className="flex items-center gap-2">
            <HomeIcon className="w-5 h-5 text-purple-500" />
            <h1 className="text-xl font-semibold text-gray-800">Home</h1>
          </div>
          <div className="w-full sm:w-auto">
            <SearchServerParams />
          </div>
        </header>

        <ErrorBoundary
          fallback={
            <ErrorState error={new Error("Failed to load sport clubs")} />
          }
        >
         
            {Array.isArray(clubList.items) && clubList.items.length > 0 ? (
              <ClubList
                ClubListFetch={clubList}
                searchParams={searchParams}
                isHandling={false}
                className="space-y-4"
              />
            ) : (
              <EmptyState />
            )}
        
        </ErrorBoundary>
      </main>
    );
  } catch (error) {
    return (
      <main className="md:container pb-20 md:pb-2">
        <header className="flex items-center gap-2 my-4">
          <h1 className="text-xl font-semibold text-gray-800">Home</h1>
          <HomeIcon className="w-5 h-5 text-purple-500" />
        </header>
        <ErrorState error={error instanceof Error ? error : new Error('An unexpected error occurred')} />
      </main>
    );
  }
}
