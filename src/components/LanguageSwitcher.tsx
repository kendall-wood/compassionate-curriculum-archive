"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { READY_LOCALES } from "@/i18n/locales";

// A plain <select> rather than a custom popover so screen readers and
// keyboard users get the native experience for free in 30 languages.
// Native names are shown so a Spanish reader sees "Español" not "Spanish".
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const t = useTranslations("toolbar");

  return (
    <label
      // Height kept in sync with Toolbar's UTIL_H so every item in the
      // utility row shares the same vertical rhythm.
      className="inline-flex items-center gap-[0.5rem] border border-fg bg-bg text-fg px-[0.625rem] text-[1.25rem] tracking-[-0.02em] leading-[1.2] h-[2.375rem]"
      aria-label={t("language")}
    >
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(() => {
            router.replace(pathname, { locale: next });
          });
        }}
        className="bg-transparent text-fg outline-none text-[1.25rem] tracking-[-0.02em] leading-[1.2] h-full"
      >
        {READY_LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName === l.englishName
              ? l.nativeName
              : `${l.nativeName} (${l.englishName})`}
          </option>
        ))}
      </select>
    </label>
  );
}
