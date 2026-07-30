"use client";

import { useState } from "react";

/**
 * Client-side show-more pagination. Pass the current filter/search values as
 * `resetKey` so changing them starts back at the first page.
 */
export function usePagination<T>(
  items: T[],
  pageSize: number,
  resetKey = ""
) {
  const [count, setCount] = useState(pageSize);
  const [prevKey, setPrevKey] = useState(resetKey);
  // Adjust-state-during-render (React-sanctioned) instead of an effect
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setCount(pageSize);
  }

  return {
    paged: items.slice(0, count),
    remaining: Math.max(0, items.length - count),
    showMore: () => setCount((c) => c + pageSize),
  };
}

export function ShowMoreButton({
  remaining,
  onShowMore,
  className = "",
}: {
  remaining: number;
  onShowMore: () => void;
  className?: string;
}) {
  if (remaining <= 0) return null;
  return (
    <div className={`mt-4 text-center ${className}`}>
      <button
        type="button"
        onClick={onShowMore}
        className="px-5 py-2.5 rounded-full text-sm border border-line bg-white hover:bg-cream transition"
      >
        Show more ({remaining} left)
      </button>
    </div>
  );
}
