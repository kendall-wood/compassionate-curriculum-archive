import type { Metadata } from "next";
import "../../styles/globals.css";

// /editor sits outside the [locale] segment tree (see src/middleware.ts,
// which excludes it from locale routing and instead gates it with the
// password check) — it's the client's content editor, not part of the
// localized public site. Since app/ has no layout.tsx of its own, this is
// the root-most layout for anything under /editor and must own the
// html/body tags — same reasoning as /portal's layout.tsx.
export const metadata: Metadata = {
  title: "Editor — Compassionate Curriculum",
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">{children}</body>
    </html>
  );
}
