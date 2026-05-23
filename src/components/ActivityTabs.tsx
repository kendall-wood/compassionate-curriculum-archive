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
  const tabStyle = (isActive: boolean) =>
    `${baseTab} ${
      isActive
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
        className={tabStyle(!activeActivityId)}
        style={!activeActivityId ? { background: "var(--color-accent)" } : undefined}
      >
        Overview
      </Link>
      {activities.map((a) => {
        const isActive = a.id === activeActivityId;
        return (
          <Link
            key={a.id}
            href={`/${sectionId}/${lessonId}/${a.id}`}
            role="tab"
            aria-selected={isActive}
            className={tabStyle(isActive)}
            style={isActive ? { background: "var(--color-accent)" } : undefined}
          >
            {a.label}
          </Link>
        );
      })}
    </div>
  );
}
