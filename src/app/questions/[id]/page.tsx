"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FadeIn } from "@/components/Motion";
import type { Question, Answer } from "@/lib/types";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/questions/${params.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setQuestion(data);
        else router.push("/questions");
      })
      .catch(() => router.push("/questions"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answerBody || !session?.user) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/questions/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: answerBody }),
      });
      if (res.ok) {
        const newAnswer = await res.json();
        setQuestion((prev) => prev ? { ...prev, answers: [...(prev.answers || []), newAnswer] } : prev);
        setAnswerBody("");
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 bg-gray-200 rounded"></div>
          <div className="h-4 w-full bg-gray-100 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <FadeIn>
        <Link href="/questions" className="text-sm text-primary-500 hover:underline mb-4 inline-block">&larr; Back to Q&A</Link>
        <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span>{question.user.name || "Anonymous"}</span>
          {question.college && (
            <Link href={`/college/${question.college.id}`} className="text-primary-500 hover:underline">
              {question.college.name}
            </Link>
          )}
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="mt-4 text-gray-700 whitespace-pre-wrap">{question.body}</p>
      </FadeIn>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {question.answers?.length || 0} {(question.answers?.length || 0) === 1 ? "Answer" : "Answers"}
        </h2>

        {(!question.answers || question.answers.length === 0) && (
          <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <p>No answers yet. Be the first to answer!</p>
          </div>
        )}

        {question.answers?.map((answer) => (
          <div key={answer.id} className="mb-4 rounded-xl border border-gray-150 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {(answer.user.name || "U").charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-700">{answer.user.name || "Anonymous"}</span>
              <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{answer.body}</p>
          </div>
        ))}
      </div>

      {session?.user && (
        <FadeIn delay={0.1}>
          <form onSubmit={submitAnswer} className="mt-8 space-y-4">
            <h3 className="font-semibold text-gray-800">Your Answer</h3>
            <textarea value={answerBody} onChange={(e) => setAnswerBody(e.target.value)} required rows={4} placeholder="Write your answer..." className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-y" />
            <button type="submit" disabled={submitting} className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-sm">
              {submitting ? "Posting..." : "Post Answer"}
            </button>
          </form>
        </FadeIn>
      )}
    </div>
  );
}
