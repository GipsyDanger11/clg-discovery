"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface SaveButtonProps {
  collegeId: string;
}

export function SaveButton({ collegeId }: SaveButtonProps) {
  const { data: session, status } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading" || !session?.user) return;
    fetch("/api/user/saved")
      .then((r) => r.ok ? r.json() : [])
      .then((items) => {
        if (items.some?.((i: { collegeId: string }) => i.collegeId === collegeId)) {
          setSaved(true);
        }
      })
      .catch(() => {});
  }, [session, status, collegeId]);

  async function toggle() {
    if (!session?.user) return;
    setLoading(true);
    try {
      if (saved) {
        const res = await fetch(`/api/user/saved?collegeId=${collegeId}`, { method: "DELETE" });
        if (res.ok) setSaved(false);
      } else {
        const res = await fetch("/api/user/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId }),
        });
        if (res.ok) setSaved(true);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  if (status === "loading" || !session?.user) return null;

  return (
    <button onClick={toggle} disabled={loading} className="flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:border-white disabled:opacity-50">
      <svg className={`h-3.5 w-3.5 transition-colors ${saved ? "fill-red-500 text-red-500" : "text-gray-400"}`} viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
