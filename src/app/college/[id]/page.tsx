"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FadeIn } from "@/components/Motion";
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
        <div className="h-64 rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-gray-400">
        College not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-sm text-primary-500 hover:text-primary-700 mb-6 inline-flex items-center gap-1 transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to search
      </Link>

      <FadeIn>
        {college.imageUrl && (
          <div className="relative mb-6 h-56 overflow-hidden rounded-2xl sm:h-72">
            <img
              src={college.imageUrl}
              alt={college.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <div className="rounded-2xl border border-gray-150 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{college.name}</h1>
              <p className="mt-1 text-gray-500 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {college.location}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
                ★ {college.rating}
              </span>
              {session?.user && (
                <button
                  onClick={toggleSave}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    saved
                      ? "bg-primary-500 text-white shadow-sm"
                      : "border border-gray-200 text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600"
                  }`}
                >
                  {saved ? "Saved" : "Save"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Detail stat="Fees" value={`₹${college.fees.toLocaleString()}/yr`} />
            <Detail stat="Rating" value={`${college.rating} ★`} />
            <Detail stat="Est." value={String(college.established || "N/A")} />
            <Detail stat="Type" value={college.type || "N/A"} />
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-gray-900">Overview</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">{college.overview}</p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-900">Courses Offered</h2>
            <p className="mt-3 text-gray-600">{college.courses}</p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-900">Placements</h2>
            <p className="mt-3 text-gray-600">{college.placements}</p>
          </section>

          {college.website && (
            <section className="mt-6">
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
              >
                Visit Website
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </section>
          )}
        </div>
      </FadeIn>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Reviews ({college.reviews.length})
        </h2>
        {college.reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {college.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {review.user.name || "Anonymous"}
                  </span>
                  <span className="text-sm text-primary-600 font-medium">★ {review.rating}/5</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
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
    <div className="rounded-xl bg-primary-50 p-4 text-center">
      <p className="text-xs font-medium text-primary-500 uppercase tracking-wide">{stat}</p>
      <p className="mt-1 font-bold text-gray-900">{value}</p>
    </div>
  );
}
