// app/your-bookings/[bookingId]/page.tsx
'use server'

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getBookingById } from "@/app/api/booking";
import BookingDetails from '@/components/shared/your-bookings/BookingDetails';
import { Booking } from '@/types';
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface PageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

/**
 * Loading skeleton for booking details
 */
function BookingDetailsSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>

      {/* Main content */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full max-w-[400px]" />
          <Skeleton className="h-4 w-full max-w-[300px]" />
          <Skeleton className="h-4 w-full max-w-[350px]" />
        </div>

        {/* Additional details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[120px] rounded-lg" />
          <Skeleton className="h-[120px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Generate metadata for the booking details page
 */
export async function generateMetadata({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const bookingId = Number(resolvedParams.bookingId);

    if (isNaN(bookingId) || bookingId <= 0) {
      return {
        title: 'Invalid Booking',
        description: 'The booking ID provided is invalid.',
      };
    }

    const booking = await getBookingById(bookingId);
    
    if (!booking) {
      return {
        title: 'Booking Not Found',
        description: 'The requested booking could not be found.',
      };
    }

    return {
      title: `Booking #${booking.id} - Details`,
      description: `View details for your booking at ${booking.clubName} on ${booking.playDate}`,
    };
  } catch (error) {
    console.error('[generateMetadata] Error:', error);
    return {
      title: 'Booking Details',
      description: 'View your booking details',
    };
  }
}

/**
 * BookingDetailsPage component
 * Displays detailed information about a specific booking
 */
export default async function BookingDetailsPage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const bookingId = Number(resolvedParams.bookingId);

    // Validate bookingId
    if (isNaN(bookingId) || bookingId <= 0) {
      notFound();
    }

    const booking = await getBookingById(bookingId);

    if (!booking) {
      notFound();
    }

    return (
      <main className="container mx-auto px-1">
        <Suspense fallback={<BookingDetailsSkeleton />}>
          <BookingDetails bookingDetails={booking} />
        </Suspense>
      </main>
    );
  } catch (error) {
    // Log the error with additional context
    console.error('[BookingDetailsPage] Error:', {
      params: await params,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new Error(
      error instanceof Error 
        ? `Failed to load booking details: ${error.message}`
        : 'Failed to load booking details'
    );
  }
}

