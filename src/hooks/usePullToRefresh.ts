import { useEffect, useRef, useState } from "react";

export function usePullToRefresh(onRefresh: () => Promise<void> | void, containerRef: React.RefObject<HTMLElement>) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const THRESHOLD = 70;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop > 0) return;
      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && el.scrollTop === 0) {
        setPulling(true);
        setPullY(Math.min(delta * 0.5, THRESHOLD + 20));
      }
    };

    const onTouchEnd = async () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (pullY >= THRESHOLD) {
        setRefreshing(true);
        setPullY(0);
        setPulling(false);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      } else {
        setPulling(false);
        setPullY(0);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [containerRef, onRefresh, pullY]);

  return { pulling, refreshing, pullY };
}
