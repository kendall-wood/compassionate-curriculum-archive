"use client";

import Link from "next/link";
import { sections } from "@/data/curriculum";

export function SectionTabs({ activeId }: { activeId: string }) {
  return (
    <div
      className="cc-section-tabs flex gap-[0.5rem] items-center w-full flex-wrap"
      role="tablist"
      aria-label="Curriculum sections"
    >
      {sections.map((s) => {
        const isActive = s.id === activeId;
        const base =
          "inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border text-[1.25rem] tracking-[-0.02em] leading-[1.2] transition-colors";
        const styles = isActive
          ? "border-fg text-black"
          : "border-fg text-fg bg-bg hover:bg-accent hover:text-black";
        return (
          <Link
            key={s.id}
            href={`/${s.id}`}
            role="tab"
            aria-selected={isActive}
            className={`${base} ${styles}`}
            style={isActive ? { background: "var(--color-accent)" } : undefined}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
