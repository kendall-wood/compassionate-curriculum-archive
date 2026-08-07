"use client";

import type { DeployStatus } from "./useDeployStatus";

export function PublishStatus({ status }: { status: DeployStatus }) {
  if (status === "idle") return null;
  if (status === "unknown") {
    return <span className="text-xs text-neutral-400">Saved — live in about a minute.</span>;
  }
  if (status === "publishing") {
    return <span className="text-xs text-amber-600">Publishing… (usually ~1 min)</span>;
  }
  if (status === "errored") {
    return <span className="text-xs text-red-600">The last publish failed — check Vercel.</span>;
  }
  return <span className="text-xs text-green-600">Live ✓</span>;
}
