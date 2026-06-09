"use client";

import { useState, useEffect } from "react";
import { ComparisonTable } from "@/components/ComparisonTable";
import { FadeIn } from "@/components/Motion";
import type { College } from "@/lib/types";

export default function ComparePage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<College[]>([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/colleges?q=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.colleges || []);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function addCollege(ccollege: College) {
    if (colleges.length >= 3) return;
    if (colleges.find((c) => c.id === ccollege.id)) return;
    setColleges((prev) => [...prev, ccollege]);
    setSearchQuery("");
    setSearchResults([]);
  }

  function removeCollege(id: string) {
    setColleges((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <FadeIn>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Colleges</h1>
        <p className="text-gray-500 mb-8">Select 2-3 colleges to compare side by side.</p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a college to add..."
            disabled={colleges.length >= 3}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:opacity-50 transition-all"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-150 bg-white shadow-lg overflow-hidden">
              {searchResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addCollege(c)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-primary-500 text-xs font-medium">★ {c.rating}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      <div className="mb-6 flex flex-wrap gap-2">
        {colleges.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700"
          >
            {c.name}
            <button onClick={() => removeCollege(c.id)} className="hover:text-primary-900 transition-colors">&times;</button>
          </span>
        ))}
        {colleges.length === 0 && (
          <span className="text-sm text-gray-400">No colleges selected yet.</span>
        )}
      </div>

      {colleges.length >= 2 && (
        <FadeIn>
          <ComparisonTable colleges={colleges} />
        </FadeIn>
      )}

      {colleges.length < 2 && (
        <div className="mt-20 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <p className="mt-4 text-gray-400">Add at least 2 colleges to see the comparison.</p>
        </div>
      )}
    </div>
  );
}
