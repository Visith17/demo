'use client';

import { useState, useCallback, Suspense, useTransition } from 'react';
import { Payment } from '@/types';
import PaymentCard from './PaymentCard';
import { fetchTransactionList } from '@/app/api/transaction';
import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll';
import usePullToRefresh from '@/lib/hooks/usePullToRefresh';
import SkeletonCard from '@/components/shared/SkeletonCard';
import { useRouter } from 'next/navigation';
import { RotateCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface PaymentListProps {
  paymentListFetch: {
    items: Payment[];
    total: number;
    error?: string;
  };
  isHandling?: boolean;
  className?: string;
}

interface PaymentListState {
  items: Payment[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

// Constants
const ITEMS_PER_PAGE = 3;
const REFRESH_DELAY = 1000;
const INITIAL_PAGE = 2; // Initial page is 2 since page 1 is pre-fetched

// Animation variants
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

/**
 * ErrorMessage component for displaying errors with retry functionality
 */
function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-red-500 p-6 rounded-md bg-red-50 text-center flex flex-col items-center gap-4"
      role="alert"
    >
      <AlertCircle className="h-8 w-8" />
      <p className="font-medium">{message}</p>
      <button 
        onClick={onRetry} 
        className="px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
      >
        Try again
      </button>
    </motion.div>
  );
}

/**
 * EmptyState component for when there are no payments
 */
function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500"
    >
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <RotateCw className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-lg font-medium">No payments yet</p>
      <p className="text-sm text-gray-400 mt-2">Your payment history will appear here</p>
    </motion.div>
  );
}

/**
 * RefreshIndicator component for pull-to-refresh state
 */
function RefreshIndicator() {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="absolute -top-8 left-0 right-0 flex items-center justify-center gap-2 text-sm text-blue-500"
      aria-live="polite"
    >
      <RotateCw className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Refreshing...</span>
    </motion.div>
  );
}

/**
 * LoadingSkeletons component for loading state
 */
function LoadingSkeletons() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-4"
    >
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <SkeletonCard 
          key={`skeleton-${i}`} 
          className={cn(
            "animate-pulse",
            "transition-opacity duration-200",
            {
              'delay-[0ms]': i === 0,
              'delay-[100ms]': i === 1,
              'delay-[200ms]': i === 2,
            }
          )}
        />
      ))}
    </motion.div>
  );
}

/**
 * PaymentList component displays a list of payments with infinite scroll and pull-to-refresh
 */
export default function PaymentList({ 
  paymentListFetch, 
  isHandling, 
  className 
}: PaymentListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // State management
  const [state, setState] = useState<PaymentListState>({
    items: paymentListFetch.items || [],
    page: INITIAL_PAGE,
    hasMore: paymentListFetch.items.length < paymentListFetch.total,
    loading: false,
    refreshing: false,
    error: paymentListFetch.error || null
  });

  // Load more payments
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetchTransactionList({ page: state.page });
      
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...response.items],
        hasMore: prev.items.length + response.items.length < response.total,
        page: prev.page + 1,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Failed to load more payments:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load more payment history.'
      }));
    }
  }, [state.page, state.loading, state.hasMore]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    
    startTransition(() => {
      router.refresh();
    });
    
    // Keep indicator visible for better UX
    setTimeout(() => {
      setState(prev => ({ ...prev, refreshing: false }));
    }, REFRESH_DELAY);
  }, [router]);

  // Initialize infinite scroll
  const lastPaymentRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: state.hasMore,
    loading: state.loading,
  });

  // Initialize pull-to-refresh
  usePullToRefresh({
    onRefresh: handleRefresh,
  });

  // Error state
  if (state.error) {
    return (
      <ErrorMessage 
        message={state.error}
        onRetry={loadMore}
      />
    );
  }

  return (
    <Suspense fallback={<LoadingSkeletons />}>
      <div 
        className={cn(
          // "relative overflow-auto",
          // "min-h-[500px] max-h-[800px]",
          className
        )}
        aria-busy={state.loading || state.refreshing}
      >
        <AnimatePresence>
          {state.refreshing && <RefreshIndicator />}
        </AnimatePresence>

        {!state.items.length ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-4 mt-4"
          >
            {state.items.map((payment, index) => {
              const isLast = index === state.items.length - 1;
              
              return (
                <motion.div
                  key={payment.referenceNumber}
                  ref={isLast ? lastPaymentRef : null}
                  variants={itemVariants}
                  className={cn(
                    "transition-all duration-200 ease-in-out",
                    "hover:scale-102 focus-within:scale-102",
                    "hover:shadow-lg focus-within:shadow-lg",
                    "rounded-lg overflow-hidden"
                  )}
                >
                  <PaymentCard 
                    payment={payment}
                    index={index}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <AnimatePresence>
          {state.loading && <LoadingSkeletons />}
        </AnimatePresence>
      </div>
    </Suspense>
  );
}
