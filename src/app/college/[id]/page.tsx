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
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-56 animate-pulse bg-gray-100 sm:h-72" />
          <div className="space-y-4 p-8">
            <div className="h-8 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <svg className="h-8 w-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-600">College not found</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to colleges
      </Link>

      <FadeIn>
        {college.imageUrl && (
          <div className="relative mb-8 h-56 overflow-hidden rounded-2xl sm:h-72 shadow-md">
            <img
              src={college.imageUrl}
              alt={college.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-sm">
                {college.type || "College"}
              </span>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-150 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{college.name}</h1>
              <p className="mt-2 text-gray-500 flex items-center gap-1.5">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {college.location}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
                <svg className="h-4 w-4 fill-primary-600" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                {college.rating}
              </span>
              {session?.user && (
                <button
                  onClick={toggleSave}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                    saved
                      ? "bg-primary-500 text-white shadow-sm hover:bg-primary-600"
                      : "border border-gray-200 text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600"
                  }`}
                >
                  {saved ? "Saved" : "Save"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Detail stat="Annual Fees" value={`₹${college.fees.toLocaleString()}`} unit="/yr" />
            <Detail stat="Rating" value={college.rating.toString()} unit="★" />
            <Detail stat="Established" value={String(college.established || "N/A")} />
            <Detail stat="Type" value={college.type || "N/A"} />
          </div>

          {college.overview && (
            <section className="mt-10">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 text-xs font-bold text-primary-600">i</span>
                Overview
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">{college.overview}</p>
            </section>
          )}

          {college.courses && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
                Courses Offered
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">{college.courses}</p>
            </section>
          )}

          {college.placements && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.986c1.235.292 2.366.647 3.413.822m-3.413-.822a47.985 47.985 0 0 0-6.87 0m-3.5.294-.076.019m0 0a2.18 2.18 0 0 1-.75 1.645v-.005m0 0a2.18 2.18 0 0 1-1.138.934l-.17.043m2.108-.977v.005m0 0a48.011 48.011 0 0 1-3.413.822m2.108-4.727c.075.016.151.032.228.047m-2.336-.047c.077-.015.154-.03.232-.047m0 0a2.18 2.18 0 0 1 1.37-.682m1.66 0a48.094 48.094 0 0 1 3.413-.387m-3.413.387c-.6.067-1.183.155-1.752.248m13.457.837c.596.071 1.18.16 1.752.248" />
                </svg>
                Placements
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">{college.placements}</p>
            </section>
          )}

          {college.website && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Visit Official Website
              </a>
            </div>
          )}
        </div>
      </FadeIn>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Reviews
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {college.reviews.length} {college.reviews.length === 1 ? "review" : "reviews"} from students and alumni
        </p>
        {college.reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-400">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {college.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {(review.user.name || "A").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {review.user.name || "Anonymous"}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                    ★ {review.rating}/5
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ stat, value, unit }: { stat: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-50/50 p-4 text-center border border-primary-100/50">
      <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider">{stat}</p>
      <p className="mt-1.5 text-xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}
