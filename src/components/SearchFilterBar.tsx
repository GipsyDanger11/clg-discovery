"use client";

import { useCallback, useRef, useEffect } from "react";

interface SearchFilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  location: string;
  onLocationChange: (loc: string) => void;
  minRating: string;
  onMinRatingChange: (r: string) => void;
  sortBy: string;
  onSortByChange: (s: string) => void;
}

export function SearchFilterBar({
  query,
  onQueryChange,
  location,
  onLocationChange,
  minRating,
  onMinRatingChange,
  sortBy,
  onSortByChange,
}: SearchFilterBarProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debouncedChange = useCallback(
    (value: string, setter: (v: string) => void) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setter(value), 300);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-purple-500/20 bg-purple-950/40 p-4 backdrop-blur-sm">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs text-purple-300 mb-1">Search</label>
        <input
          type="text"
          defaultValue={query}
          onChange={(e) => debouncedChange(e.target.value, onQueryChange)}
          placeholder="College name, location, courses..."
          className="w-full rounded-lg border border-purple-500/30 bg-purple-900/50 px-3 py-2 text-sm text-purple-100 placeholder-purple-400 outline-none focus:border-purple-400"
        />
      </div>
      <div className="min-w-[140px]">
        <label className="block text-xs text-purple-300 mb-1">Location</label>
        <input
          type="text"
          defaultValue={location}
          onChange={(e) => debouncedChange(e.target.value, onLocationChange)}
          placeholder="City, state..."
          className="w-full rounded-lg border border-purple-500/30 bg-purple-900/50 px-3 py-2 text-sm text-purple-100 placeholder-purple-400 outline-none focus:border-purple-400"
        />
      </div>
      <div className="min-w-[100px]">
        <label className="block text-xs text-purple-300 mb-1">Min Rating</label>
        <select
          value={minRating}
          onChange={(e) => onMinRatingChange(e.target.value)}
          className="w-full rounded-lg border border-purple-500/30 bg-purple-900/50 px-3 py-2 text-sm text-purple-100 outline-none focus:border-purple-400"
        >
          <option value="">Any</option>
          <option value="4">4+</option>
          <option value="3">3+</option>
          <option value="2">2+</option>
        </select>
      </div>
      <div className="min-w-[120px]">
        <label className="block text-xs text-purple-300 mb-1">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="w-full rounded-lg border border-purple-500/30 bg-purple-900/50 px-3 py-2 text-sm text-purple-100 outline-none focus:border-purple-400"
        >
          <option value="name">Name</option>
          <option value="rating">Rating</option>
          <option value="fees">Fees</option>
        </select>
      </div>
    </div>
  );
}
