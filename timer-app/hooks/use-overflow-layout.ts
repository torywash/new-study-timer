"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Below this width, side-by-side would squeeze each item too narrow to be
// worth it — better to stay stacked and let the page scroll instead.
const MIN_ROW_WIDTH = 640;

// Stacks a set of items vertically by default, only switching to a
// side-by-side row once the stacked items would actually be taller than the
// visible viewport below them (so the row layout is a fallback for
// overflow, not a viewport-width breakpoint).
export function useOverflowLayout(itemCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [isRow, setIsRow] = useState(false);

  const setItemRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const gapPx = parseFloat(getComputedStyle(container).rowGap || "0");

    const measure = () => {
      const items = itemRefs.current.filter(
        (el): el is HTMLElement => el !== null,
      );
      if (items.length === 0) return;

      // Each item's own height barely changes whether it's laid out at full
      // width (stacked) or half width (row), so summing current offsetHeights
      // is a stable proxy for "how tall would this be if stacked" even while
      // already in row mode.
      const stackedHeight =
        items.reduce((sum, el) => sum + el.offsetHeight, 0) +
        gapPx * Math.max(items.length - 1, 0);
      const availableHeight =
        window.innerHeight - container.getBoundingClientRect().top;

      setIsRow(
        stackedHeight > availableHeight && window.innerWidth >= MIN_ROW_WIDTH,
      );
    };

    measure();

    // On phones, rotating the device fires `resize` while the browser's
    // own UI (address bar collapsing/expanding, safe-area insets) is still
    // animating, so innerWidth/innerHeight can be momentarily stale. Wait a
    // frame after orientation-driven events before re-measuring so the row
    // vs. stacked decision reflects the settled viewport.
    const measureNextFrame = () => {
      requestAnimationFrame(measure);
    };

    const resizeObserver = new ResizeObserver(measure);
    itemRefs.current.forEach((el) => el && resizeObserver.observe(el));
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measureNextFrame);
    screen.orientation?.addEventListener?.("change", measureNextFrame);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measureNextFrame);
      screen.orientation?.removeEventListener?.("change", measureNextFrame);
    };
  }, [itemCount]);

  return { containerRef, setItemRef, isRow };
}
