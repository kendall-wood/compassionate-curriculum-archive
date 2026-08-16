import type { Metadata } from "next";
import "../../styles/globals.css";

// /editor sits outside the [locale] segment tree (see src/middleware.ts,
// which gates it with a password check instead of locale routing) — same
// reasoning as /portal's layout.tsx, which this deliberately mirrors:
// dark-by-default pre-hydration script, same html/body ownership, same
// light/dark class pairing on body.
export const metadata: Metadata = {
  title: "Editor — Compassionate Curriculum",
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('editor-theme')!=='light'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
