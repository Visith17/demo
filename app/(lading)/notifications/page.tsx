import { fetchNotificationList } from "@/app/api/notification";
import NotificationList from "@/components/shared/notifications/NotificationList";
import { AlertCircle, Bell, BellOff } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

// Force dynamic to ensure fresh data on each request
export const dynamic = 'force-dynamic';

// Loading component for NotificationList
function NotificationListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="h-16 bg-gray-100 rounded-lg" />
      ))}
    </div>
  );
}

// Error state component
function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-red-700 mb-2">Unable to load notifications</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <p className="text-sm text-red-500">Please try again later or contact support if the problem persists.</p>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
      <BellOff className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h2>
      <p className="text-gray-600">
        You&apos;re all caught up! New notifications will appear here
      </p>
    </div>
  );
}

export default async function NotificationPage() {
  try {
    const notifications = await fetchNotificationList();

    return (
      <main className="md:container pb-20 md:pb-2">
        <header className="flex items-center gap-2 my-4">
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
          <Bell className="w-5 h-5 text-purple-500" />
        </header>

        <ErrorBoundary fallback={<ErrorState error={new Error("Failed to load notifications")} />}>
          <Suspense fallback={<NotificationListSkeleton />}>
            {Array.isArray(notifications?.items) && notifications.items.length > 0 ? (
              <NotificationList
                notificationFetch={notifications}
                isHandling={false}
                className="space-y-4"
              />
            ) : (
              <EmptyState />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>
    );
  } catch (error) {
    return (
      <main className="md:container pb-20 md:pb-2">
        <header className="flex items-center gap-2 my-4">
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
          <Bell className="w-5 h-5 text-purple-500" />
        </header>
        <ErrorState error={error instanceof Error ? error : new Error('An unexpected error occurred')} />
      </main>
    );
  }
}
