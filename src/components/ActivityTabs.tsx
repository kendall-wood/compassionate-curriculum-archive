"use client";

import { useEffect, useState } from "react";
import type { Activity } from "@/data/types";

const baseTab =
  "inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-[20px] tracking-[-0.4px] leading-none whitespace-nowrap transition-colors";

export function ActivityTabs({ activities }: { activities: Activity[] }) {
  const [active, setActive] = useState<string>("overview");

  useEffect(() => {
    const onScroll = () => {
      const ids = ["overview", ...activities.map((a) => a.id)];
      let current = "overview";
      const offset = 120;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top - offset;
        if (top <= 0) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activities]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tab = (id: string, label: string) => {
    const isActive = active === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => scrollTo(id)}
        className={`${baseTab} ${
          isActive ? "text-black" : "text-fg bg-bg hover:bg-accent hover:text-black"
        }`}
        style={isActive ? { background: "var(--color-accent)" } : undefined}
        aria-current={isActive ? "true" : undefined}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="cc-activity-tabs flex gap-[8px] items-center w-full">
      {tab("overview", "Overview")}
      {activities.map((a) => tab(a.id, a.label))}
    </div>
  );
}
