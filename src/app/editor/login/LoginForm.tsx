"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/editor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("That password didn't work. Try again.");
        setSubmitting(false);
        return;
      }
      const next = searchParams.get("next") || "/editor";
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-3 rounded border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h1 className="text-sm font-semibold tracking-tight">Content Editor</h1>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Enter the shared password to edit the site.
      </p>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-emerald-400 dark:border-neutral-700 dark:bg-neutral-900"
      />
      {error ? <p className="text-xs text-red-500 dark:text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="rounded border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        {submitting ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
