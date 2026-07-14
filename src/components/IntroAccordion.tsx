"use client";
import { useState } from "react";
import { Link } from "@/i18n/routing";

type AccordionItem = { label: string; description: string; href: string };

export function IntroAccordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full">
      <div className="border-t border-fg" />
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            onMouseEnter={() => setOpenIndex(i)}
            onMouseLeave={() => setOpenIndex(null)}
          >
            <Link
              href={item.href}
              className="w-full flex items-baseline justify-between py-[1.25rem] px-[0.375rem] text-fg transition-colors duration-100 hover:bg-accent hover:text-accent-fg"
            >
              <span className="text-[2rem] leading-[1.25] tracking-[-0.02em] font-normal text-left">
                <span className="text-[1.875rem] leading-snug">
                  {item.label}
                </span>
                {isOpen && <> {item.description}</>}
              </span>
              <span aria-hidden="true" className="text-[1.25rem] shrink-0 ml-[1rem]">
                ↗
              </span>
            </Link>
            <div className="border-b border-fg" />
          </div>
        );
      })}
    </div>
  );
}
