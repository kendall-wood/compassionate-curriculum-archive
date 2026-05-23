"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACCENT_SWATCHES, useTheme } from "./ThemeProvider";
import { LeafIcon, MoonIcon, SunIcon } from "./icons";

type ToolbarProps = {
  showBack?: boolean;
  backHref?: string;
};

const navBtn =
  "inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-fg bg-bg text-[20px] tracking-[-0.4px] leading-none whitespace-nowrap hover:bg-accent hover:text-black transition-colors";

const utilBtn =
  "inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-fg bg-bg text-[20px] tracking-[-0.4px] leading-none whitespace-nowrap";

export function Toolbar({ showBack = false, backHref = "/" }: ToolbarProps) {
  const router = useRouter();
  const { theme, toggleTheme, accent, setAccent, zoomIn, zoomOut, zoomLabel } =
    useTheme();

  // Settings & Accessibility now toggles the utility row inline instead of
  // navigating to a dedicated page.
  const [showUtilityRow, setShowUtilityRow] = useState(false);

  return (
    <div className="cc-toolbar w-full flex flex-col gap-[18px]">
      <div className="flex items-center justify-between w-full h-[35px]">
        <div className="flex gap-[16px] items-center">
          {showBack ? (
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className={navBtn}
              aria-label="Back"
            >
              Back
            </button>
          ) : null}
          <Link href="/" className={navBtn} aria-label="Home">
            Home
          </Link>
        </div>
        <nav className="flex gap-[12px] items-center" aria-label="Primary">
          <Link href="/about" className={navBtn}>
            About
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className={navBtn}
            aria-label="Print"
          >
            Print
          </button>
          <Link href="/contact" className={navBtn}>
            Contact
          </Link>
          <button
            type="button"
            onClick={() => setShowUtilityRow((v) => !v)}
            className={navBtn}
            aria-expanded={showUtilityRow}
            aria-controls="cc-utility-row"
          >
            Settings &amp; Accessibility
          </button>
        </nav>
      </div>

      {showUtilityRow ? (
        <div
          id="cc-utility-row"
          className="flex gap-[8px] items-center justify-end w-full"
        >
          <button
            type="button"
            onClick={toggleTheme}
            className={utilBtn}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <span className="size-[20px] inline-flex items-center justify-center">
              {theme === "dark" ? (
                <MoonIcon className="size-full" />
              ) : (
                <SunIcon className="size-full" />
              )}
            </span>
          </button>

          <span
            className="inline-flex items-center justify-center px-[10px] py-[6px] border text-black"
            style={{
              background: "var(--color-active)",
              borderColor: "var(--color-bg)",
            }}
            aria-label="Active accent indicator"
          >
            <LeafIcon className="size-[17.6px]" />
          </span>

          <button
            type="button"
            onClick={zoomOut}
            className={utilBtn}
            aria-label="Decrease zoom"
          >
            -
          </button>
          <span className={utilBtn} aria-live="polite">
            {zoomLabel}
          </span>
          <button
            type="button"
            onClick={zoomIn}
            className={utilBtn}
            aria-label="Increase zoom"
          >
            +
          </button>

          <div
            className="inline-flex items-center justify-center gap-[10px] px-[10px] py-[6px] border border-fg bg-bg"
            role="group"
            aria-label="Accent color swatches"
          >
            {ACCENT_SWATCHES.map((color) => {
              const isActive = accent.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccent(color)}
                  aria-label={`Use accent color ${color}`}
                  aria-pressed={isActive}
                  className="size-[19px] inline-block border border-fg"
                  style={{
                    background: color,
                    borderRadius: "9999px",
                    boxShadow: isActive
                      ? "0 0 0 2px var(--color-fg) inset"
                      : undefined,
                  }}
                />
              );
            })}

            {/* Custom color picker — uses a native <input type="color"> styled
                as a circular rainbow chip so it sits visually with the
                preset swatches. */}
            <label
              className="size-[19px] inline-flex items-center justify-center relative overflow-hidden border border-fg"
              style={{
                borderRadius: "9999px",
                background:
                  "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
              }}
              aria-label="Pick a custom accent color"
              title="Pick a custom accent color"
            >
              <input
                type="color"
                value={normalizeHex(accent)}
                onChange={(e) => setAccent(e.target.value)}
                className="absolute inset-0 opacity-0"
                aria-label="Custom accent color picker"
              />
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** <input type="color"> requires a 6-digit hex; normalise stored value. */
function normalizeHex(value: string): string {
  if (/^#([0-9a-f]{6})$/i.test(value)) return value.toLowerCase();
  if (/^#([0-9a-f]{3})$/i.test(value)) {
    const [, h] = value.match(/^#([0-9a-f]{3})$/i) ?? [];
    return `#${h
      .split("")
      .map((c) => c + c)
      .join("")}`.toLowerCase();
  }
  return "#fff75d";
}
