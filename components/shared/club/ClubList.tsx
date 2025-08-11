'use client';

import { useState, useEffect, useCallback, Suspense, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Club } from '@/types';
import { ClubCard } from './ClubCard';
import { fetchClubList } from '@/app/api/club';
import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll';
import usePullToRefresh from '@/lib/hooks/usePullToRefresh';
import SkeletonCard from '@/components/shared/SkeletonCard';
import { RotateCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Constants
const ITEMS_PER_PAGE = 3;
const REFRESH_DELAY = 1000;
const INITIAL_PAGE = 2;

// Types
interface ClubListProps {
  ClubListFetch: {
    items: Club[];
    total: number;
    error?: string;
  };
  searchParams: { search?: string };
  isHandling?: boolean;
  className?: string;
}

interface ClubListState {
  items: Club[];
  page: number;
  search?: string;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

// Animations
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// UI Components
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
      <p className="text-lg font-medium">No clubs yet</p>
      <p className="text-sm text-gray-400 mt-2">Your club history will appear here</p>
    </motion.div>
  );
}

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

function LoadingSkeletons() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4"
    >
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <SkeletonCard
          key={i}
          className={cn("animate-pulse", "transition-opacity duration-200", {
            'delay-[0ms]': i === 0,
            'delay-[100ms]': i === 1,
            'delay-[200ms]': i === 2,
          })}
        />
      ))}
    </motion.div>
  );
}

export default function ClubList({
  ClubListFetch,
  searchParams,
  className,
}: ClubListProps) {
  
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [state, setState] = useState<ClubListState>({
    items: ClubListFetch.items,
    page: INITIAL_PAGE,
    search: searchParams.search,
    hasMore: ClubListFetch.items.length < ClubListFetch.total,
    loading: false,
    refreshing: false,
    error: ClubListFetch.error || null,
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true }));
    setState((prev) => ({
      ...prev,
      items: ClubListFetch.items,
      page: INITIAL_PAGE,
      search: searchParams.search,
      hasMore: ClubListFetch.items.length < ClubListFetch.total,
      loading: false,
      refreshing: false,
      error: ClubListFetch.error || null,
    }));
  }, [ClubListFetch, searchParams.search]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetchClubList({
        itemsPerPage: ITEMS_PER_PAGE,
        page: state.page,
        search: state.search,
      });
      
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...response.items],
        page: prev.page + 1,
        hasMore: prev.items.length + response.items.length < response.total,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Load failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load more clubs.',
      }));
    }
  }, [state.loading, state.hasMore, state.page, state.search]);

  const handleRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshing: true }));
    startTransition(() => router.refresh());
    setTimeout(() => {
      setState(prev => ({ ...prev, refreshing: false }));
    }, REFRESH_DELAY);
  }, [router]);

  const lastClubRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: state.hasMore,
    loading: state.loading,
  });

  usePullToRefresh({ onRefresh: handleRefresh });

  if (state.error) {
    return <ErrorMessage message={state.error} onRetry={loadMore} />;
  }

  return (
    <Suspense fallback={<LoadingSkeletons />}>
      <div className={cn(className)} aria-busy={state.loading || state.refreshing}>
        <AnimatePresence>{state.refreshing && <RefreshIndicator />}</AnimatePresence>

        {!state.items.length ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 mt-4"
          >
            {state.items.map((club, index) => {
              const isLast = index === state.items.length - 1;
              return (
                <motion.div
                  key={club.id}
                  ref={isLast ? lastClubRef : null}
                  variants={itemVariants}
                  className={cn(
                    "transition-all duration-200 ease-in-out",
                    "hover:scale-102 focus-within:scale-102",
                    "hover:shadow-lg focus-within:shadow-lg",
                    "rounded-lg overflow-hidden"
                  )}
                >
                  <ClubCard club={club} index={index} />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <AnimatePresence>{state.loading && <LoadingSkeletons />}</AnimatePresence>
      </div>
    </Suspense>
  );
}
