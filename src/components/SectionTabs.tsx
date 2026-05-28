"use client";

import { Link } from "@/i18n/routing";
import { sections } from "@/data/curriculum";

export function SectionTabs({ activeId }: { activeId: string }) {
  const base =
    "inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border text-[1.25rem] tracking-[-0.02em] leading-[1.2] transition-colors";

  const tabStyle = (id: string) => {
    const isActive = id === activeId;
    return {
      className: `${base} ${isActive ? "border-fg text-accent-fg" : "border-fg text-fg bg-bg hover:bg-accent hover:text-accent-fg"}`,
      style: isActive ? { background: "var(--color-accent)" } : undefined,
    };
  };

  return (
    <div
      className="cc-section-tabs flex gap-[0.5rem] items-center w-full flex-wrap"
      role="tablist"
      aria-label="Curriculum sections"
    >
      <Link
        href="/intro"
        role="tab"
        aria-selected={activeId === "intro"}
        {...tabStyle("intro")}
      >
        Intro
      </Link>
      {sections.map((s) => (
        <Link
          key={s.id}
          href={`/${s.id}`}
          role="tab"
          aria-selected={s.id === activeId}
          {...tabStyle(s.id)}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}
