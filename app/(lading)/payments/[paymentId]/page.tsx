'use server'

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchTransactionById } from "@/app/api/transaction";
import {TransactionDetail} from '@/components/shared/payments/PaymentDetails';
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface PageProps {
  params: Promise<{
    paymentId: string;
  }>;
}

/**
 * Loading skeleton for payment details
 */
function PaymentDetailsSkeleton() {
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
 * Generate metadata for the payment details page
 */
export async function generateMetadata({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const paymentId = resolvedParams.paymentId;

    if (paymentId==='') {
      return {
        title: 'Invalid Payment',
        description: 'The paymentId provided is invalid.',
      };
    }

    const payment = await fetchTransactionById(paymentId);
    
    if (!payment) {
      return {
        title: 'Payment Not Found',
        description: 'The requested payment could not be found.',
      };
    }

    return {
      title: `Payment #${payment.paymentId} - Details`,
      description: `View details for your payment at ${payment.status} on ${payment.createdAt}`,
    };
  } catch (error) {
    console.error('[generateMetadata] Error:', error);
    return {
      title: 'Payment Details',
      description: 'View your payment details',
    };
  }
}

/**
 * PaymentDetailsPage component
 * Displays detailed information about a specific payment
 */
export default async function PaymentDetailsPage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const paymentId = resolvedParams.paymentId;

    // Validate paymentId
    if (paymentId==='') {
      notFound();
    }

    const payment = await fetchTransactionById(paymentId);

    if (!payment) {
      notFound();
    }

    return (
      <main className="container mx-auto px-1">
        <Suspense fallback={<PaymentDetailsSkeleton />}>
          <TransactionDetail transaction={payment} />
        </Suspense>
      </main>
    );
  } catch (error) {
    // Log the error with additional context
    console.error('[PaymentDetailsPage] Error:', {
      params: await params,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new Error(
      error instanceof Error 
        ? `Failed to load payment details: ${error.message}`
        : 'Failed to load payment details'
    );
  }
}

