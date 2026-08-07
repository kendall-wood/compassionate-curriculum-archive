// Polled by the editor after a save so it can show "Publishing…" until the
// new Vercel deployment triggered by that commit is actually live, and
// block further saves until then (saving again before the previous save's
// deploy finishes would read stale content as the edit's starting point).
// Degrades gracefully to `{configured: false}` if VERCEL_TOKEN/
// VERCEL_PROJECT_ID aren't set — the client falls back to a static
// "saved, live in about a minute" message instead of polling.
import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) {
    return NextResponse.json({ configured: false });
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json({ configured: true, error: true });
    }
    const data = await res.json();
    const latest = data.deployments?.[0];
    const state: string | undefined = latest?.state ?? latest?.readyState;
    return NextResponse.json({
      configured: true,
      state: state ?? null,
      ready: state === "READY",
      errored: state === "ERROR" || state === "CANCELED",
      createdAt: latest?.createdAt ?? null,
    });
  } catch {
    return NextResponse.json({ configured: true, error: true });
  }
}
