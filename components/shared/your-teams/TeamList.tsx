'use client';

import { useState, useEffect, useCallback, Suspense, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOwnTeams } from '@/app/api/team';

import useInfiniteScroll from '@/lib/hooks/useInfiniteScroll';
import usePullToRefresh from '@/lib/hooks/usePullToRefresh';

import TeamDetailsPage from './TeamDetailsPage';
import { TeamCard } from './TeamCard';
import SkeletonCard from '@/components/shared/SkeletonCard';
import { RotateCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Constants
const ITEMS_PER_PAGE = 3;
const REFRESH_DELAY = 1000;
const INITIAL_PAGE = 2;

// Props & State Types
interface TeamListProps {
  teamListFetch: {
    items: any[];
    total: number;
    error?: string;
  };
  searchParams: { search?: string };
  className?: string;
}

interface TeamListState {
  items: any[];
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
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// UI Subcomponents
const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
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

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500"
  >
    <div className="rounded-full bg-gray-100 p-4 mb-4">
      <RotateCw className="h-8 w-8 text-gray-400" />
    </div>
    <p className="text-lg font-medium">No teams yet</p>
    <p className="text-sm text-gray-400 mt-2">Your team history will appear here</p>
  </motion.div>
);

const RefreshIndicator = () => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -20, opacity: 0 }}
    className="absolute -top-8 left-0 right-0 flex items-center justify-center gap-2 text-sm text-blue-500"
    aria-live="polite"
  >
    <RotateCw className="h-4 w-4 animate-spin" />
    <span>Refreshing...</span>
  </motion.div>
);

const LoadingSkeletons = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4"
  >
    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
      <SkeletonCard
        key={i}
        className={cn("animate-pulse transition-opacity duration-200", {
          'delay-[0ms]': i === 0,
          'delay-[100ms]': i === 1,
          'delay-[200ms]': i === 2,
        })}
      />
    ))}
  </motion.div>
);

// Main Component
export default function TeamList({ teamListFetch, searchParams, className }: TeamListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [state, setState] = useState<TeamListState>({
    items: teamListFetch.items,
    page: INITIAL_PAGE,
    search: searchParams.search,
    hasMore: teamListFetch.items.length < teamListFetch.total,
    loading: false,
    refreshing: false,
    error: teamListFetch.error || null,
  });

  // Refresh state when props change
  useEffect(() => {
    setState({
      items: teamListFetch.items,
      page: INITIAL_PAGE,
      search: searchParams.search,
      hasMore: teamListFetch.items.length < teamListFetch.total,
      loading: false,
      refreshing: false,
      error: teamListFetch.error || null,
    });
  }, [teamListFetch, searchParams.search]);

  // Load more teams
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true }));
    try {
      const response = await fetchOwnTeams({
        itemsPerPage: ITEMS_PER_PAGE,
        page: state.page,
        // search: state.search,
      });

      setState(prev => ({
        ...prev,
        items: [...prev.items, ...response.items],
        page: prev.page + 1,
        hasMore: prev.items.length + response.items.length < response.total,
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error('Load failed:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load more teams.',
      }));
    }
  }, [state.loading, state.hasMore, state.page, state.search]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshing: true }));
    startTransition(() => router.refresh());
    setTimeout(() => {
      setState(prev => ({ ...prev, refreshing: false }));
    }, REFRESH_DELAY);
  }, [router]);

  const lastTeamRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: state.hasMore,
    loading: state.loading,
  });

  usePullToRefresh({ onRefresh: handleRefresh });

  if (state.error) return <ErrorMessage message={state.error} onRetry={loadMore} />;

  return (
    <Suspense fallback={<LoadingSkeletons />}>
      <div className={cn(className)} aria-busy={state.loading || state.refreshing}>
        <AnimatePresence>{state.refreshing && <RefreshIndicator />}</AnimatePresence>

        {!state.items.length ? (
          <EmptyState />
        ) : (
          <TeamCard teams={state.items} />
          // <motion.div
          //   variants={listVariants}
          //   initial="hidden"
          //   animate="show"
          //   className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 mt-4"
          // >
          //   {state.items.map((team, index) => {
          //     const isLast = index === state.items.length - 1;
          //     return (
          //       <motion.div
          //         key={team.id}
          //         ref={isLast ? lastTeamRef : null}
          //         variants={itemVariants}
          //         className={cn(
          //           "transition-all duration-200 ease-in-out",
          //           "hover:scale-102 focus-within:scale-102",
          //           "hover:shadow-lg focus-within:shadow-lg",
          //           "rounded-lg overflow-hidden"
          //         )}
          //       >
          //         <TeamDetailsPage team={team} index={index} />
                 
          //       </motion.div>
          //     );
          //   })}
          // </motion.div>
        )}

        <AnimatePresence>{state.loading && <LoadingSkeletons />}</AnimatePresence>
      </div>
    </Suspense>
  );
}
