import type { Metadata } from "next";
import "../../styles/globals.css";

// /portal sits outside the [locale] segment tree (see src/middleware.ts,
// which excludes it from locale routing) — it's a local working tool for
// prepping the InDesign re-layout, not part of the localized public site.
// Since app/ has no layout.tsx of its own, this is the root-most layout for
// anything under /portal and must own the html/body tags.
export const metadata: Metadata = {
  title: "InDesign Portal — Compassionate Curriculum",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('portal-theme')!=='light'){document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
