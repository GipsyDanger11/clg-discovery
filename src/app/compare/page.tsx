"use client";

import { useState, useEffect } from "react";
import { ComparisonTable } from "@/components/ComparisonTable";
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-purple-100 mb-2">Compare Colleges</h1>
      <p className="text-purple-300 mb-8">Select 2-3 colleges to compare side by side.</p>

      <div className="mb-6 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a college to add..."
          disabled={colleges.length >= 3}
          className="w-full rounded-lg border border-purple-500/30 bg-purple-900/50 px-4 py-2.5 text-sm text-purple-100 placeholder-purple-400 outline-none focus:border-purple-400 disabled:opacity-50"
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-purple-500/20 bg-purple-900/90 backdrop-blur-sm overflow-hidden">
            {searchResults.map((c) => (
              <button
                key={c.id}
                onClick={() => addCollege(c)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-purple-200 hover:bg-purple-800/50 transition-colors"
              >
                <span>{c.name}</span>
                <span className="text-purple-400">★ {c.rating}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {colleges.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-2 rounded-full bg-purple-700/60 px-3 py-1 text-sm text-purple-100"
          >
            {c.name}
            <button onClick={() => removeCollege(c.id)} className="hover:text-purple-300">&times;</button>
          </span>
        ))}
        {colleges.length === 0 && (
          <span className="text-sm text-purple-400">No colleges selected yet.</span>
        )}
      </div>

      {colleges.length >= 2 && <ComparisonTable colleges={colleges} />}

      {colleges.length < 2 && (
        <div className="mt-16 text-center text-purple-400">
          Add at least 2 colleges to see the comparison.
        </div>
      )}
    </div>
  );
}
