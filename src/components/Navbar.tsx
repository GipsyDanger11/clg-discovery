"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./Logo";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-primary-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
            Colleges
          </Link>
          <Link href="/compare" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
            Compare
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">{session.user.name || session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="rounded-lg bg-primary-500 px-4 py-1.5 text-sm text-white font-medium hover:bg-primary-600 transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-primary-500 px-4 py-1.5 text-sm text-white font-medium hover:bg-primary-600 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
