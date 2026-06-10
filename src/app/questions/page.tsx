"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FadeIn } from "@/components/Motion";
import type { Question } from "@/lib/types";

export default function QuestionsPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.ok ? r.json() : { questions: [] })
      .then((data) => setQuestions(data.questions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Q&A Discussions</h1>
            <p className="text-gray-500 mt-1">Ask questions and help others with college admissions.</p>
          </div>
          {session?.user && (
            <Link href="/questions/new" className="rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors shadow-sm">
              Ask Question
            </Link>
          )}
        </div>
      </FadeIn>

      {loading && (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-150 p-5">
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-100 rounded mb-1"></div>
              <div className="h-4 w-1/3 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && questions.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>No questions yet.</p>
          {session?.user && (
            <Link href="/questions/new" className="text-primary-500 hover:underline mt-2 inline-block">
              Be the first to ask a question
            </Link>
          )}
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link key={q.id} href={`/questions/${q.id}`}>
              <div className="rounded-xl border border-gray-150 bg-white p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{q.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{q.body}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{q.user.name || "Anonymous"}</span>
                      {q.college && <span>about {q.college.name}</span>}
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="text-lg font-bold text-primary-600">{q._count?.answers || 0}</div>
                    <div className="text-xs text-gray-400">{q._count?.answers === 1 ? "answer" : "answers"}</div>
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
