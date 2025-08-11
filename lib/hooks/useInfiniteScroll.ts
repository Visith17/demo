import { useCallback, useRef } from "react";

type UseInfiniteScrollParams = {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDebounceStart?: () => void;
};

export default function useInfiniteScroll<T extends Element>({
  loading,
  hasMore,
  onLoadMore,
  onDebounceStart,
}: UseInfiniteScrollParams) {
  const observer = useRef<IntersectionObserver | null>(null);
  const debounceRef = useRef(false);

  const lastElementRef = useCallback(
    (node: T | null) => {
      if (loading || debounceRef.current) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          debounceRef.current = true;
          onDebounceStart?.(); // Notify component before load
          onLoadMore();
          setTimeout(() => (debounceRef.current = false), 20);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore, onDebounceStart]
  );

  return lastElementRef;
}
