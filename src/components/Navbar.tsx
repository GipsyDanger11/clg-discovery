"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./Logo";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 sm:px-4"
          >
            Colleges
          </Link>
          <Link
            href="/compare"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 sm:px-4"
          >
            Compare
          </Link>
          <Link
            href="/chat"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 sm:px-4"
          >
            AI Chat
          </Link>
          {session?.user && (
            <>
              <Link
                href="/saved"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 sm:px-4"
              >
                Saved
              </Link>
              <Link
                href="/questions"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 sm:px-4"
              >
                Q&A
              </Link>
            </>
          )}
          <Link
            href="/predictor"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 sm:px-4"
          >
            Predictor
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-2 ml-2 sm:ml-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="ml-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md sm:ml-4"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
