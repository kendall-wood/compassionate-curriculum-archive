"use client";

import Link from "next/link";
import type { Activity } from "@/data/types";

const baseTab =
  "inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-[1.25rem] tracking-[-0.02em] leading-[1.2] transition-colors";

type ActivityTabsProps = {
  sectionId: string;
  lessonId: string;
  activities: Activity[];
  activeActivityId?: string; // undefined = on overview/facilitator page
};

export function ActivityTabs({
  sectionId,
  lessonId,
  activities,
  activeActivityId,
}: ActivityTabsProps) {
  // Cumulative highlight: every tab up to and including the active one is lit.
  // Overview is always included once any activity is active.
  const activeIndex = activeActivityId
    ? activities.findIndex((a) => a.id === activeActivityId)
    : -1; // -1 = on overview page, nothing highlighted beyond Overview itself

  const overviewFilled = activeIndex >= 0 || !activeActivityId;

  const tabStyle = (filled: boolean) =>
    `${baseTab} ${
      filled
        ? "text-black"
        : "text-fg bg-bg hover:bg-accent hover:text-black"
    }`;

  return (
    <div
      className="cc-activity-tabs flex gap-[0.5rem] items-center w-full flex-wrap"
      role="tablist"
      aria-label="Lesson activities"
    >
      <Link
        href={`/${sectionId}/${lessonId}`}
        role="tab"
        aria-selected={!activeActivityId}
        className={tabStyle(overviewFilled)}
        style={overviewFilled ? { background: "var(--color-accent)" } : undefined}
      >
        Overview
      </Link>
      {activities.map((a, i) => {
        const filled = activeIndex >= 0 && i <= activeIndex;
        return (
          <Link
            key={a.id}
            href={`/${sectionId}/${lessonId}/${a.id}`}
            role="tab"
            aria-selected={a.id === activeActivityId}
            className={tabStyle(filled)}
            style={filled ? { background: "var(--color-accent)" } : undefined}
          >
            {a.label}
          </Link>
        );
      })}
    </div>
  );
}
