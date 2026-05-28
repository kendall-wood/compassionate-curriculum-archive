import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { LOCALE_CODES, DEFAULT_LOCALE } from "./locales";

// `as` is the human-stable internal pathname; `pathnames` would let us
// translate the URL segments themselves (e.g. /es/comunidad-amada). We
// deliberately keep the section/lesson slugs the same across locales so
// bookmarks survive locale switches and our CMS-free data files don't have
// to maintain N slug aliases.
export const routing = defineRouting({
  locales: LOCALE_CODES,
  defaultLocale: DEFAULT_LOCALE,
  // `as-needed` keeps the default-locale URL clean (/beloved-community for
  // English, /es/beloved-community for Spanish, etc.) which is the modern
  // SEO recommendation and avoids breaking existing inbound links.
  localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
