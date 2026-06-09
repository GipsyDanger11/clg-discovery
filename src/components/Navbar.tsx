"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-purple-500/20 bg-purple-950/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-purple-300">
          CollegeDiscovery
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-purple-200 hover:text-purple-100 transition-colors">
            Colleges
          </Link>
          <Link href="/compare" className="text-purple-200 hover:text-purple-100 transition-colors">
            Compare
          </Link>
          <Link href="/chat" className="text-purple-200 hover:text-purple-100 transition-colors">
            AI Chat
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-purple-300">{session.user.name || session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="rounded-lg bg-purple-700 px-3 py-1.5 text-white hover:bg-purple-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-white hover:bg-purple-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
