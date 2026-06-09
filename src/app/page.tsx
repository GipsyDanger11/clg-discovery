"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CollegeCard } from "@/components/CollegeCard";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { Pagination } from "@/components/Pagination";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/Motion";
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
    <div className="mx-auto max-w-7xl px-4 py-10">
      <FadeIn>
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Discover Your <span className="text-primary-600">Future College</span>
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Search, compare, and explore colleges across India with AI assistance
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="#listings" className="rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-600 hover:shadow-lg transition-all">
              Browse Colleges
            </a>
            <Link href="/chat" className="rounded-xl border border-primary-200 bg-primary-50 px-6 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-all">
              Try AI Assistant
            </Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
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
      </FadeIn>

      <div id="listings" className="scroll-mt-20">
        {loading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-gray-100 bg-white shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <div className="mt-20 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="mt-4 text-gray-400">No colleges found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <StaggerChildren>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {colleges.map((college) => (
                  <StaggerItem key={college.id}>
                    <CollegeCard college={college} />
                  </StaggerItem>
                ))}
              </div>
            </StaggerChildren>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

