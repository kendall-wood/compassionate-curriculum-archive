"use client";

import type { DeployStatus } from "./useDeployStatus";

export function PublishStatus({ status }: { status: DeployStatus }) {
  if (status === "idle") return null;
  if (status === "unknown") {
    return (
      <span className="whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
        Saved — live in about a minute
      </span>
    );
  }
  if (status === "publishing") {
    return (
      <span className="whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
        Publishing… (usually ~1 min)
      </span>
    );
  }
  if (status === "errored") {
    return (
      <span className="whitespace-nowrap text-xs text-red-500 dark:text-red-400">
        Last publish failed — check Vercel
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap text-xs text-emerald-600 dark:text-emerald-400">
      Live ✓
    </span>
  );
}
