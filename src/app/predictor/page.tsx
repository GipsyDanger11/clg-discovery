"use client";

import { useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/Motion";
import type { College } from "@/lib/types";

const exams = ["JEE Advanced", "JEE Main", "MHT CET"];

export default function PredictorPage() {
  const [exam, setExam] = useState("");
  const [rank, setRank] = useState("");
  const [results, setResults] = useState<(College & { matchReason: string; confidence: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exam || !rank) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/predictor?exam=${encodeURIComponent(exam)}&rank=${encodeURIComponent(rank)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <FadeIn>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">College Predictor</h1>
        <p className="text-gray-500 mb-8">Enter your exam and rank to find colleges where you have a strong chance.</p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <form onSubmit={handleSubmit} className="mb-10 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam</label>
            <select value={exam} onChange={(e) => setExam(e.target.value)} required className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              <option value="">Select exam</option>
              {exams.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rank / Percentile</label>
            <input type="number" min="1" value={rank} onChange={(e) => setRank(e.target.value)} placeholder="e.g. 5000" required className="w-40 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <button type="submit" disabled={loading} className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm">
            {loading ? "Searching..." : "Predict"}
          </button>
        </form>
      </FadeIn>

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-150 p-5">
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-100 rounded mb-1"></div>
              <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>No matching colleges found for this exam and rank.</p>
          <p className="text-sm mt-1">Try a different exam or a broader rank range.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((c) => (
            <Link key={c.id} href={`/college/${c.id}`}>
              <div className="rounded-xl border border-gray-150 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{c.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{c.location}</p>
                    <p className="text-sm text-gray-600 mt-2">{c.matchReason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-primary-600">{c.confidence}%</div>
                    <div className="text-xs text-gray-400">match</div>
                    <div className="text-sm font-medium text-gray-700 mt-1">₹{c.fees.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
