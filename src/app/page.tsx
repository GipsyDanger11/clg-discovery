"use client";

import { useState, useEffect } from "react";
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
  const [fetchId, setFetchId] = useState(0);

  useEffect(() => {
    setPage(1);
    setFetchId((id) => id + 1);
  }, [query, location, minRating, sortBy]);

  useEffect(() => {
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
  }, [page, fetchId]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <FadeIn>
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-purple-700 p-10 text-white shadow-xl sm:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Your <span className="text-primary-200">Future College</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Search, compare, and explore top engineering colleges across India with AI-powered assistance
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#listings"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-600 shadow-lg transition-all hover:bg-primary-50 hover:shadow-xl"
              >
                Browse Colleges
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </a>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Try AI Assistant
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </Link>
            </div>
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
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="h-40 bg-gray-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-gray-100 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-4 w-20 rounded bg-gray-100 animate-pulse" />
                    <div className="h-5 w-12 rounded-full bg-gray-100 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : colleges.length === 0 ? (
          <FadeIn>
            <div className="mt-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                <svg className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-medium text-gray-600">No colleges found</p>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          </FadeIn>
        ) : (
          <>
            <StaggerChildren>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

