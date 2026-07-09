"use client";

import { useCallback, useRef, useState } from "react";

// Splits a citation on http(s) URLs and renders the URLs as links. Clicks on a
// link navigate (and don't trigger the copy) via stopPropagation.
const urlRegex = /(https?:\/\/[^\s)]+)/g;

function linkifyCitation(text: string) {
  return text.split(urlRegex).map((part, i) => {
    if (!/^https?:\/\//.test(part)) return <span key={i}>{part}</span>;
    // Keep trailing sentence punctuation out of the linked URL.
    const m = part.match(/^(.*?)([.,;:]+)$/);
    const href = m ? m[1] : part;
    const trail = m ? m[2] : "";
    return (
      <span key={i}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="underline decoration-fg underline-offset-2 hover:text-accent hover:decoration-accent transition-colors break-words"
        >
          {href}
        </a>
        {trail}
      </span>
    );
  });
}

// A single bibliography entry: shares the section-table highlight on hover and,
// on click, copies the citation text and flashes a small "Copied!" token at the
// pointer for one second.
export function ReferenceSource({ text }: { text: string }) {
  const liRef = useRef<HTMLLIElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState<{ x: number; y: number } | null>(null);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      const rect = liRef.current?.getBoundingClientRect();
      const x = rect ? e.clientX - rect.left : 0;
      const y = rect ? e.clientY - rect.top : 0;

      navigator.clipboard?.writeText(text).catch(() => {});

      setCopied({ x, y });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 1000);
    },
    [text]
  );

  return (
    <li
      ref={liRef}
      onClick={onClick}
      className="relative text-[1.25rem] leading-[1.4] tracking-[-0.02em] text-fg cursor-pointer"
    >
      <span
        className="px-[0.375rem] py-[0.125rem] hover:bg-accent hover:text-accent-fg transition-colors duration-100"
        style={{
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {linkifyCitation(text)}
      </span>
      {copied ? (
        <span
          role="status"
          className="pointer-events-none absolute z-10 -translate-y-full px-[0.375rem] py-[0.125rem] border border-fg bg-bg text-fg text-[1rem] leading-none tracking-[-0.02em] whitespace-nowrap"
          style={{ left: copied.x, top: copied.y }}
        >
          Copied!
        </span>
      ) : null}
    </li>
  );
}
