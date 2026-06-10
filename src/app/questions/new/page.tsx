"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FadeIn } from "@/components/Motion";
import type { College } from "@/lib/types";

export default function NewQuestionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState<College[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/colleges?limit=50")
      .then((r) => r.ok ? r.json() : { colleges: [] })
      .then((data) => setColleges(data.colleges || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title || !body) { setError("Title and details are required"); return; }
    if (!session?.user) { setError("You must be signed in to post a question"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, collegeId: collegeId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post question");
      router.push(`/questions/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setSubmitting(false);
  }

  if (status === "loading") {
    return <div className="mx-auto max-w-2xl px-4 py-10"><div className="animate-pulse h-8 w-64 bg-gray-200 rounded mb-4"></div><div className="animate-pulse h-4 w-96 bg-gray-200 rounded mb-8"></div></div>;
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-gray-500 text-lg mb-4">Sign in to ask a question.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <FadeIn>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-500 mb-8">Get answers from the community about college admissions, courses, placements, and more.</p>
      </FadeIn>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <FadeIn delay={0.1}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. What is the cutoff for CSE at VJTI?" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">College (optional)</label>
            <select value={collegeId} onChange={(e) => setCollegeId(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100">
              <option value="">General question (no specific college)</option>
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Details</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={5} placeholder="Provide more context about your question..." className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-y" />
          </div>
          <button type="submit" disabled={submitting} className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm">
            {submitting ? "Posting..." : "Post Question"}
          </button>
        </form>
      </FadeIn>
    </div>
  );
}
