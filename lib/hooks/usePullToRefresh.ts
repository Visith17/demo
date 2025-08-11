import { useEffect, useRef, useState } from "react";

type PullToRefreshOptions = {
  onRefresh: () => void;
  threshold?: number;
};

export default function usePullToRefresh({ onRefresh, threshold = 60 }: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef<number | null>(null);
  const isRefreshing = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current !== null && !isRefreshing.current) {
        const distance = e.touches[0].clientY - startY.current;
        if (distance > 0) setIsPulling(true);
        if (distance > threshold) {
          isRefreshing.current = true;
          onRefresh();
        }
      }
    };

    const handleTouchEnd = () => {
      startY.current = null;
      isRefreshing.current = false;
      setIsPulling(false);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onRefresh, threshold]);

  return { isPulling };
}
