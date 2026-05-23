"use client";

import Link from "next/link";
import { sections } from "@/data/curriculum";

export function SectionTabs({ activeId }: { activeId: string }) {
  return (
    <div
      className="cc-section-tabs flex gap-[8px] items-center w-full h-[35px]"
      role="tablist"
      aria-label="Curriculum sections"
    >
      {sections.map((s) => {
        const isActive = s.id === activeId;
        const base =
          "inline-flex items-center justify-center px-[10px] py-[6px] border text-[20px] tracking-[-0.4px] leading-none whitespace-nowrap transition-colors";
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
