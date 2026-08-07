import type { StandalonePage } from "./types";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import pagesIndexData from "./pages-index.json";

// Ordered list of every standalone page's slug (outside the curriculum
// section/lesson/activity structure). Adding a page means appending a slug
// here plus creating `src/data/pages/<slug>/en.json` — no code change.
const PAGES_INDEX = pagesIndexData as string[];

export function pageSlugs(): string[] {
  return PAGES_INDEX;
}

const enCache = new Map<string, StandalonePage>();

async function loadEnPage(slug: string): Promise<StandalonePage | undefined> {
  if (enCache.has(slug)) return enCache.get(slug);
  try {
    const mod = await import(`./pages/${slug}/en.json`);
    const page = mod.default as StandalonePage;
    enCache.set(slug, page);
    return page;
  } catch {
    return undefined;
  }
}

export async function loadPage(
  slug: string,
  locale: string = DEFAULT_LOCALE
): Promise<StandalonePage | undefined> {
  if (!PAGES_INDEX.includes(slug)) return undefined;
  if (locale === DEFAULT_LOCALE) return loadEnPage(slug);
  try {
    const mod = await import(`./pages/${slug}/${locale}.json`);
    return mod.default as StandalonePage;
  } catch {
    return loadEnPage(slug);
  }
}

export async function loadAllPages(
  locale: string = DEFAULT_LOCALE
): Promise<StandalonePage[]> {
  const loaded = await Promise.all(
    PAGES_INDEX.map((slug) => loadPage(slug, locale))
  );
  return loaded.filter((p): p is StandalonePage => Boolean(p));
}
