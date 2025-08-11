import React from "react";
import TeamList from "@/components/shared/your-teams/TeamList";
import { Notebook } from "lucide-react";
import { fetchOwnTeams } from "@/app/api/team";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
// Force dynamic to ensure fresh data on each request
export const dynamic = "force-dynamic";

// Error state component
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
      {/* <AlertCircle className="w-12 h-12 text-red-500 mb-4" /> */}
      <h2 className="text-lg font-semibold text-red-700 mb-2">
        Unable to load your team data
      </h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <p className="text-sm text-red-500">
        Please try again later or contact support if the problem persists.
      </p>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
      {/* <Calendar className="w-12 h-12 text-gray-400 mb-4" /> */}
      <h2 className="text-lg font-semibold text-gray-700 mb-2">No team yet</h2>
      <p className="text-gray-600">
        When you register or join team, it will appear here
      </p>
    </div>
  );
}

export default async function TeamPage() {
  try {
    const searchParams = { search: "" };
    const teamListFetch: any = await fetchOwnTeams({
      page: 1,
      itemsPerPage: 10,
    });
    console.log(teamListFetch, '---')
    return (
      <main className="p-2 space-y-1 max-w-3xl mx-auto">
        <div className="max-w-5xl mx-auto p-1 bg-white">
          <header className="flex items-center gap-2 my-4">
            <h1 className="text-xl font-semibold text-gray-800">Your Teams</h1>
            <Notebook className="w-5 h-5 text-purple-500" />
          </header>
          {/* <TeamDetailsPage team={data} /> */}
          
          <ErrorBoundary fallback={<ErrorState error={new Error("Failed to load teams")} />}>
          
            {Array.isArray(teamListFetch?.items) && teamListFetch.items.length > 0 ? (
              <TeamList teamListFetch={teamListFetch} searchParams={searchParams} />
            ) : (
              <EmptyState />
            )}
        </ErrorBoundary>
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="p-2 space-y-1 max-w-3xl mx-auto">
        <div className="max-w-5xl mx-auto p-1 bg-white">
          <header className="flex items-center gap-2 my-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Your Team 👥
            </h1>
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
