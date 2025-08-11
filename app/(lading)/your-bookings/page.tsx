import { fetchBookingList } from "@/app/api/booking";
import BookingList from "@/components/shared/your-bookings/BookingList";
import { AlertCircle, Calendar, Notebook } from "lucide-react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// Force dynamic to ensure fresh data on each request
export const dynamic = "force-dynamic";

// Loading component for BookingList
function BookingListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-24 bg-gray-100 rounded-lg" />
      ))}
    </div>
  );
}

// Error fallback component
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-red-700 mb-2">
        Unable to load bookings
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
      <Calendar className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        No bookings yet
      </h2>
      <p className="text-gray-600">
        When you book a pitch, it will appear here
      </p>
    </div>
  );
}

export default async function YourBookingPage() {
  try {
    const bookingList = await fetchBookingList();
    return (
      <main className="p-2 space-y-1 max-w-3xl mx-auto">
        <div className="max-w-5xl mx-auto p-1 bg-white pb-20 md:pb-2">
          <header className="flex items-center gap-2 my-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Your Bookings
            </h1>
            <Notebook className="w-5 h-5 text-purple-500" />
          </header>

          <ErrorBoundary
            fallback={
              <ErrorState error={new Error("Failed to load bookings")} />
            }
          >
            {Array.isArray(bookingList?.items) &&
            bookingList.items.length > 0 ? (
              <BookingList
                bookingListFetch={bookingList}
                isHandling={false}
                className="divide-y divide-gray-100"
              />
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
              Your Bookings
            </h1>
            <Notebook className="w-5 h-5 text-purple-500" />
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
