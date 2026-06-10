"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FadeIn } from "@/components/Motion";
import type { SavedItem } from "@/lib/types";

export default function SavedPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) { setLoading(false); return; }
    fetch("/api/user/saved")
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Session expired. Please sign in again." : "Failed to load saved colleges");
        const data = await res.json();
        setItems(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [session, status]);

  async function remove(collegeId: string) {
    const res = await fetch(`/api/user/saved?collegeId=${collegeId}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.collegeId !== collegeId));
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="animate-pulse rounded-xl border border-gray-150 p-5"><div className="h-5 w-2/3 bg-gray-200 rounded mb-2"></div><div className="h-4 w-1/2 bg-gray-100 rounded"></div></div>)}</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-500 text-lg mb-4">Sign in to view your saved colleges.</p>
        <Link href="/auth/signin" className="rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors shadow-sm inline-block">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <FadeIn>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Colleges</h1>
        <p className="text-gray-500 mb-8">Colleges you have saved for quick access.</p>
      </FadeIn>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="animate-pulse rounded-xl border border-gray-150 p-5"><div className="h-5 w-2/3 bg-gray-200 rounded mb-2"></div><div className="h-4 w-1/2 bg-gray-100 rounded"></div></div>)}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>No saved colleges yet.</p>
          <Link href="/" className="text-primary-500 hover:underline mt-2 inline-block">Browse colleges</Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-gray-150 bg-white p-5 shadow-sm hover:shadow-md transition-all">
              <Link href={`/college/${item.college.id}`} className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{item.college.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{item.college.location}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="font-medium text-primary-600">₹{item.college.fees.toLocaleString()}/yr</span>
                  <span className="text-gray-500">★ {item.college.rating}</span>
                </div>
              </Link>
              <button onClick={() => remove(item.collegeId)} className="shrink-0 ml-4 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
