"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Pitch, AvailablePitchParams } from "@/types";
import PitchCard from "./PitchCard";
import { fetchAvailablePitches } from "@/app/api/booking";
import useInfiniteScroll from "@/lib/hooks/useInfiniteScroll";
import usePullToRefresh from "@/lib/hooks/usePullToRefresh";
import SkeletonCard from "../SkeletonCard";

interface PitchListProps {
  searchParams?: Record<string, string | null>;
  availablePitches: {
    items: Pitch[];
    total: number;
    error?: string;
  };
}

const ITEMS_PER_LOAD = 5; // Number of skeleton items to show while loading

export default function PitchList({ availablePitches, searchParams = {} }: PitchListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pitches, setPitches] = useState<Pitch[]>(availablePitches?.items || []);
  const [page, setPage] = useState(2);
  const [itemsPerPage] = useState(pitches.length || 10);
  const [hasMore, setHasMore] = useState(pitches.length < (availablePitches?.total || 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(availablePitches?.error || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [favoriteTime, setFavoriteTime] = useState<string | null>(null);
  const fetchPayload: AvailablePitchParams = {
    itemsPerPage,
    page,
    sportClubIds: searchParams.sportClubIds ? searchParams.sportClubIds.split(',').map(Number) : [8],
    playDate: searchParams.playDate ?? null,
    timeIn: searchParams.timeIn ?? null,
    intervalHours: searchParams.intervalHours ? parseInt(searchParams.intervalHours) : 2,
    sportTypeIds: searchParams.sportTypeIds ? searchParams.sportTypeIds.split(',').map(Number) : [],
    dayOption: favoriteTime ?? null
  };
   // Initialize state from URL params
   useEffect(() => {
    setPitches(availablePitches.items);
    setHasMore(availablePitches.items.length < (availablePitches.total || 0));
    const getCookieValue = (name: string): string | null => {
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? decodeURIComponent(match[2]) : null;
    };
    
    const favoriteTime = getCookieValue("favoriteTime")?.slice(2) || null
    setFavoriteTime(favoriteTime)
    
  }, [availablePitches]); 

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const response = await fetchAvailablePitches(fetchPayload);
      
      setPitches(prevPitches => [...prevPitches, ...response.items]);
      setHasMore(pitches.length + response.items.length < response.total);
      setPage(prevPage => prevPage + 1);
      setError(null);
    } catch (err) {
      setError("Failed to load more pitches. Please try again later.");
      console.error("[PitchList] Load more error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      router.refresh();
      // Add a small delay to show the refresh indicator
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error("[PitchList] Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Setup infinite scroll
  const lastPitchRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    loading,
  });

  // Setup pull-to-refresh
  usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 150,
  });

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => loadMore()}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-sm shadow-md animate-fade-in-down">
          <div className="container mx-auto py-2 text-center">
            <span className="text-blue-600 text-sm font-medium inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Refreshing...
            </span>
          </div>
        </div>
      )}

      {/* Pitch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-1">
        {pitches.map((pitch, index) => (
          <div 
            key={`${pitch.id}-${index}`}
            ref={index === pitches.length - 1 ? lastPitchRef : null}
            className="transition-opacity duration-200 ease-in-out"
          >
            <PitchCard pitch={pitch} index={index} />
          </div>
        ))}

        {/* Loading Skeletons */}
        {loading && (
          Array.from({ length: ITEMS_PER_LOAD }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))
        )}
      </div>

      {/* Empty State */}
      {pitches.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No pitches available.</p>
        </div>
      )}
    </div>
  );
}
