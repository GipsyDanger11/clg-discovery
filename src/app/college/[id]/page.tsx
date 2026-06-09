"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { CollegeWithReviews } from "@/lib/types";

export default function CollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [college, setCollege] = useState<CollegeWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchCollege() {
      try {
        const res = await fetch(`/api/colleges/${id}`);
        if (res.ok) setCollege(await res.json());
      } finally {
        setLoading(false);
      }
    }
    fetchCollege();
  }, [id]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/saved")
        .then((r) => r.json())
        .then((items) => {
          if (items.some?.((i: { collegeId: string }) => i.collegeId === id)) {
            setSaved(true);
          }
        })
        .catch(() => {});
    }
  }, [session, id]);

  async function toggleSave() {
    if (!session?.user) return;
    try {
      if (saved) {
        await fetch(`/api/user/saved?collegeId=${id}`, { method: "DELETE" });
        setSaved(false);
      } else {
        await fetch("/api/user/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId: id }),
        });
        setSaved(true);
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-64 rounded-xl border border-purple-500/20 bg-purple-950/30 animate-pulse" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-purple-400">
        College not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 mb-4 inline-block">
        &larr; Back to search
      </Link>

      <div className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-100">{college.name}</h1>
            <p className="mt-1 text-purple-300">{college.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-purple-200">
              ★ {college.rating}
            </span>
            {session?.user && (
              <button
                onClick={toggleSave}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  saved
                    ? "bg-purple-600 text-white"
                    : "border border-purple-500/30 text-purple-200 hover:bg-purple-800/50"
                }`}
              >
                {saved ? "Saved" : "Save"}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Detail stat="Fees" value={`₹${college.fees.toLocaleString()}/yr`} />
          <Detail stat="Rating" value={String(college.rating)} />
          <Detail stat="Est." value={String(college.established || "N/A")} />
          <Detail stat="Type" value={college.type || "N/A"} />
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-purple-200">Overview</h2>
          <p className="mt-2 text-purple-300 leading-relaxed">{college.overview}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-purple-200">Courses Offered</h2>
          <p className="mt-2 text-purple-300">{college.courses}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-purple-200">Placements</h2>
          <p className="mt-2 text-purple-300">{college.placements}</p>
        </section>

        {college.website && (
          <section className="mt-6">
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Visit Website &rarr;
            </a>
          </section>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-purple-200 mb-4">
          Reviews ({college.reviews.length})
        </h2>
        {college.reviews.length === 0 ? (
          <p className="text-purple-400">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {college.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-purple-500/20 bg-purple-950/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-200">
                    {review.user.name || "Anonymous"}
                  </span>
                  <span className="text-sm text-purple-300">★ {review.rating}/5</span>
                </div>
                <p className="mt-2 text-sm text-purple-300">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ stat, value }: { stat: string; value: string }) {
  return (
    <div className="rounded-lg bg-purple-900/30 p-3 text-center">
      <p className="text-xs text-purple-400">{stat}</p>
      <p className="mt-1 font-semibold text-purple-100">{value}</p>
    </div>
  );
}
