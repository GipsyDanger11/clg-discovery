"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Sign up failed");
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-8 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-purple-100 text-center mb-6">
          {isSignUp ? "Create Account" : "Sign In"}
        </h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-300 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full rounded-lg border border-purple-500/30 bg-purple-900/50 px-4 py-2.5 text-sm text-purple-100 placeholder-purple-400 outline-none focus:border-purple-400"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-lg border border-purple-500/30 bg-purple-900/50 px-4 py-2.5 text-sm text-purple-100 placeholder-purple-400 outline-none focus:border-purple-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-lg border border-purple-500/30 bg-purple-900/50 px-4 py-2.5 text-sm text-purple-100 placeholder-purple-400 outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-purple-600 py-2.5 text-sm text-white hover:bg-purple-500 transition-colors"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full rounded-lg border border-purple-500/30 py-2.5 text-sm text-purple-200 hover:bg-purple-800/50 transition-colors"
          >
            Continue with Google
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-purple-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-300 hover:text-purple-200"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
