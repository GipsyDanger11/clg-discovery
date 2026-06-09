"use client";

import { useState, useEffect, useRef } from "react";
import { CollegeCard } from "@/components/CollegeCard";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { Pagination } from "@/components/Pagination";
import type { College, PaginationInfo } from "@/lib/types";

export default function HomePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const filterRef = useRef({ query, location, minRating, sortBy });

  useEffect(() => {
    const prev = filterRef.current;
    const filtersChanged =
      prev.query !== query ||
      prev.location !== location ||
      prev.minRating !== minRating ||
      prev.sortBy !== sortBy;

    if (filtersChanged) {
      filterRef.current = { query, location, minRating, sortBy };
      setPage(1);
      return;
    }

    async function fetchColleges() {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (location) params.set("location", location);
      if (minRating) params.set("minRating", minRating);
      params.set("sortBy", sortBy);
      params.set("page", String(page));
      params.set("limit", String(12));

      try {
        const res = await fetch(`/api/colleges?${params}`);
        const data = await res.json();
        setColleges(data.colleges);
        setPagination(data.pagination);
      } catch {
        setColleges([]);
      } finally {
        setLoading(false);
      }
    }
    fetchColleges();
  }, [query, location, minRating, sortBy, page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-100">
          Discover Your Future College
        </h1>
        <p className="mt-2 text-purple-300">
          Search, compare, and explore colleges with AI assistance
        </p>
      </div>

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        location={location}
        onLocationChange={setLocation}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-purple-500/20 bg-purple-950/30 animate-pulse"
            />
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <div className="mt-16 text-center text-purple-400">
          No colleges found. Try adjusting your filters.
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
