"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ACCENT_SWATCHES, useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon } from "./icons";

type ToolbarProps = {
  showBack?: boolean;
  backHref?: string;
};

// All sizing in rem (or em where it should track the local font size) so the
// toolbar grows uniformly with the type-scale slider.
// `leading-[1.2]` (not `leading-none`) so multi-line wrapping at large zoom
// levels looks clean. `whitespace-nowrap` is intentionally absent — buttons
// should reflow inside their flex containers when type is scaled up.
const navBtn =
  "inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2] hover:bg-accent hover:text-accent-fg transition-colors";

const utilBtn =
  "inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2]";

export function Toolbar({ showBack = false, backHref = "/" }: ToolbarProps) {
  const router = useRouter();
  const { theme, toggleTheme, accent, setAccent, mono, setMono, zoomIn, zoomOut, zoomLabel, showUtilityRow, setShowUtilityRow } =
    useTheme();

  return (
    <div className="cc-toolbar w-full flex flex-col gap-[1.125rem]">
      <div className="flex items-center justify-between w-full flex-wrap gap-y-[1rem]">
        <div className="flex gap-[1rem] items-center flex-wrap">
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
        <nav className="flex gap-[0.75rem] items-center flex-wrap" aria-label="Primary">
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
            style={showUtilityRow ? { background: "var(--color-accent)", color: "var(--color-accent-fg)" } : undefined}
          >
            Settings &amp; Accessibility
          </button>
        </nav>
      </div>

      {showUtilityRow ? (
        <div
          id="cc-utility-row"
          className="flex gap-[0.5rem] items-center justify-end w-full flex-wrap"
        >
          <button
            type="button"
            onClick={toggleTheme}
            className={utilBtn}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <span className="size-[1.25rem] inline-flex items-center justify-center">
              {theme === "dark" ? (
                <MoonIcon className="size-full" />
              ) : (
                <SunIcon className="size-full" />
              )}
            </span>
          </button>

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
            className="inline-flex items-center justify-center gap-[0.625rem] px-[0.625rem] py-[0.375rem] border border-fg bg-bg"
            role="group"
            aria-label="Accent color swatches"
          >
            {ACCENT_SWATCHES.map((color) => {
              const isActive =
                !mono && accent.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccent(color)}
                  aria-label={`Use accent color ${color}`}
                  aria-pressed={isActive}
                  className="size-[1.1875rem] inline-block border border-fg"
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

            {/* Monochrome swatch — locks the accent to white-in-dark /
                black-in-light. Unlike the colored swatches it tracks the
                theme, so toggling dark/light flips the accent automatically. */}
            <button
              type="button"
              onClick={setMono}
              aria-label="Use monochrome accent"
              aria-pressed={mono}
              className="size-[1.1875rem] inline-block border border-fg shrink-0"
              style={{
                borderRadius: "9999px",
                background: "linear-gradient(to right, #000000 50%, #ffffff 50%)",
                boxShadow: mono ? "0 0 0 2px var(--color-fg) inset" : undefined,
              }}
            />

            {/* Custom color picker — uses a native <input type="color"> styled
                as a circular rainbow chip so it sits visually with the
                preset swatches. */}
            <label
              className="size-[1.1875rem] inline-flex items-center justify-center relative overflow-hidden border border-fg"
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
