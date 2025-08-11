import React from "react";
import RegisterTeamForm from "./RegisterTeamForm";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { fetchSportFilter } from "@/app/api/sport";
// Force dynamic to ensure fresh data on each request
export const dynamic = "force-dynamic";

// Error state component
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
      {/* <AlertCircle className="w-12 h-12 text-red-500 mb-4" /> */}
      <h2 className="text-lg font-semibold text-red-700 mb-2">
        Unable to load register team form
      </h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <p className="text-sm text-red-500">
        Please try again later or contact support if the problem persists.
      </p>
    </div>
  );
}

const FindMatchPage = async () => {

  try {
    const sports = await fetchSportFilter();
    return (
      <div className="max-w-4xl mx-auto pb-20 md:pb-2 p-1 space-y-8">
        <ErrorBoundary
          fallback={
            <ErrorState error={new Error("Failed to load open match form")} />
          }
        >
          <RegisterTeamForm sports={sports}/>
        </ErrorBoundary>
      </div>
    );
  } catch (error) {
    return (
      <main className="p-2 space-y-1 max-w-3xl mx-auto">
        <div className="max-w-5xl mx-auto p-1 bg-white">
          <header className="flex items-center gap-2 my-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Register Team 👥
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
  
};

export default FindMatchPage;
