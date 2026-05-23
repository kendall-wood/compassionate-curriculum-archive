"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const { theme, toggleTheme, accent, setAccent, zoomIn, zoomOut, zoomLabel } = useTheme();

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
          <Link href="/accessibility" className={navBtn}>
            Settings &amp; Accessibility
          </Link>
        </nav>
      </div>

      <div className="flex gap-[8px] items-center justify-end w-full">
        <button
          type="button"
          onClick={toggleTheme}
          className={utilBtn}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="size-[20px] inline-flex items-center justify-center">
            {theme === "dark" ? <MoonIcon className="size-full" /> : <SunIcon className="size-full" />}
          </span>
        </button>

        <span
          className="inline-flex items-center justify-center px-[10px] py-[6px] border text-black"
          style={{ background: "var(--color-active)", borderColor: "var(--color-bg)" }}
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
                  boxShadow: isActive ? "0 0 0 2px var(--color-fg) inset" : undefined,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
