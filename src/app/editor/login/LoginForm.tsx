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
      className="flex w-full max-w-[24rem] flex-col gap-4 rounded-lg border border-neutral-200 p-8 shadow-sm"
    >
      <h1 className="text-2xl font-semibold text-neutral-900">Editor login</h1>
      <p className="text-sm text-neutral-500">
        Enter the shared password to edit the site.
      </p>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="rounded-md border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="rounded-md bg-neutral-900 px-4 py-2 text-white transition-colors disabled:opacity-50"
      >
        {submitting ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
