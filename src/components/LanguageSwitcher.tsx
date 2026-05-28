"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { LOCALES } from "@/i18n/locales";

// A plain <select> rather than a custom popover so screen readers and
// keyboard users get the native experience for free in 30 languages.
// Native names are shown so a Spanish reader sees "Español" not "Spanish".
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  return (
    <label
      className="inline-flex items-center gap-[0.5rem] border border-fg bg-bg text-fg px-[0.625rem] py-[0.375rem] text-[1.25rem] tracking-[-0.02em] leading-[1.2]"
      aria-label="Language"
    >
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(() => {
            router.replace(pathname, { locale: next });
          });
        }}
        className="bg-transparent text-fg outline-none text-[1.25rem] tracking-[-0.02em] leading-[1.2]"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
