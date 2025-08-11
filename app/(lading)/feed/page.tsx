import { fetchClubList } from "@/app/api/club";
import { fetchTeams } from "@/app/api/team";
import { fetchOopenMatches } from "@/app/api/match";
import { HomeIcon, AlertCircle } from "lucide-react";
import InteractiveSportFeed from "@/components/shared/feed/newFeed";

// Force dynamic to ensure fresh data on each request
export const dynamic = "force-dynamic";

// Error state component
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-red-700 mb-2">
        Unable to load sport clubs
      </h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <p className="text-sm text-red-500">
        Please try again later or contact support if the problem persists.
      </p>
    </div>
  );
}

export default async function ClubPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  try {
    const clubList = await fetchClubList({
      itemsPerPage: 100,
      page: 1,
      search: searchParams?.search ?? "",
    });

    const teamList = await fetchTeams();
    const matchList = await fetchOopenMatches();

    return (
      <main>
        <InteractiveSportFeed
          clubList={clubList}
          teamList={teamList.data}
          matchList={matchList}
        />
      </main>
    );
  } catch (error) {
    return (
      <main className="p-2 space-y-1 max-w-3xl mx-auto">
        <div className="max-w-5xl mx-auto p-1 bg-white">
          <header className="flex items-center gap-2 my-4">
            <h1 className="text-xl font-semibold text-gray-800">Home</h1>
            <HomeIcon className="w-5 h-5 text-purple-500" />
          </header>
          <ErrorState
            error={
              error instanceof Error
                ? error
                : new Error("An unexpected error occurred")
            }
          />
        </div>
      </main>
    );
  }
}
