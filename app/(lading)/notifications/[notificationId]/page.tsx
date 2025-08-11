'use server';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getNotificationById } from "@/app/api/notification";
import NotificationDetails from '@/components/shared/notifications/NotificationDetails';
import { Notification } from '@/types';

// Types
interface NotificationPageProps {
  params: {
    notificationId: number;
  };
}

// Loading component
function NotificationDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-16 bg-gray-200 rounded" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </div>
  );
}

/**
 * Generate metadata for the notification details page
 */
export async function generateMetadata({ params }: any) {
  try {
    const notification = await getNotificationById(params.notificationId);
    return {
      title: `Notification - ${notification.data?.title || 'Details'}`,
      description: notification.data?.description || 'View notification details',
    };
  } catch {
    return {
      title: 'Notification Details',
      description: 'View your notification details',
    };
  }
}

/**
 * NotificationDetailsPage component
 * Displays detailed information about a specific notification
 */
export default async function NotificationDetailsPage({ params }: any) {
  try {
    const response = await getNotificationById(params.notificationId);

    // Check if notification exists
    if (!response || response.status === 404) {
      notFound();
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<NotificationDetailsSkeleton />}>
          <NotificationDetails notificationDetails={response} />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error('[NotificationDetailsPage] Error:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to load notification details'
    );
  }
}

