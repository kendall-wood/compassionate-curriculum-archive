"use client";

import { useEffect, useRef, useState } from "react";

export type DeployStatus = "idle" | "publishing" | "live" | "errored" | "unknown";

// Polls /api/editor/deploy-status once per completed save (identified by a
// new commit sha) until the resulting Vercel deployment reports READY.
export function useDeployStatus(lastCommitSha: string | null) {
  const [status, setStatus] = useState<DeployStatus>("idle");
  const seenSha = useRef<string | null>(null);

  useEffect(() => {
    if (!lastCommitSha || lastCommitSha === seenSha.current) return;
    seenSha.current = lastCommitSha;
    let cancelled = false;
    setStatus("publishing");

    async function poll() {
      try {
        const res = await fetch("/api/editor/deploy-status");
        const data = await res.json();
        if (cancelled) return;
        if (!data.configured) {
          setStatus("unknown");
          return;
        }
        if (data.ready) {
          setStatus("live");
          return;
        }
        if (data.errored) {
          setStatus("errored");
          return;
        }
      } catch {
        // transient network hiccup — keep polling rather than giving up
      }
      if (!cancelled) setTimeout(poll, 5000);
    }
    poll();

    return () => {
      cancelled = true;
    };
  }, [lastCommitSha]);

  return status;
}
