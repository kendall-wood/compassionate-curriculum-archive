import type { Section } from "./types";
import { DEFAULT_LOCALE } from "@/i18n/locales";

// All section JSON files are pre-known so the bundler can statically
// resolve them. A dynamic `import(`./sections/${id}/${locale}.json`)`
// would also work at runtime but breaks server-side static analysis.
// New section? Add it here (and create matching JSON files).
//
// English is always imported eagerly so we can fall back synchronously
// when a non-English catalog is missing a section.

import belovedEn from "./sections/beloved-community/en.json";
import restorativeEn from "./sections/restorative-practices/en.json";
import mediaEn from "./sections/media-narrative-futuring/en.json";

const EN_SECTIONS: Record<string, Section> = {
  "beloved-community": belovedEn as Section,
  "restorative-practices": restorativeEn as Section,
  "media-narrative-futuring": mediaEn as Section,
};

// Display order of sections in nav/curriculum. Locale-independent.
export const SECTION_ORDER = [
  "beloved-community",
  "restorative-practices",
  "media-narrative-futuring",
] as const;

export type SectionId = (typeof SECTION_ORDER)[number];

// Async loader: pulls the locale-specific JSON if it exists, else falls
// back to English. The translation script populates `<id>/<locale>.json`
// for every locale, so in production the fallback is rarely hit.
export async function loadSection(
  id: string,
  locale: string = DEFAULT_LOCALE
): Promise<Section | undefined> {
  if (!(id in EN_SECTIONS)) return undefined;
  if (locale === DEFAULT_LOCALE) return EN_SECTIONS[id];
  try {
    const mod = await import(`./sections/${id}/${locale}.json`);
    return mod.default as Section;
  } catch {
    return EN_SECTIONS[id];
  }
}

export async function loadAllSections(
  locale: string = DEFAULT_LOCALE
): Promise<Section[]> {
  const loaded = await Promise.all(
    SECTION_ORDER.map((id) => loadSection(id, locale))
  );
  return loaded.filter((s): s is Section => Boolean(s));
}

export async function loadLesson(
  sectionId: string,
  lessonId: string,
  locale: string = DEFAULT_LOCALE
) {
  const s = await loadSection(sectionId, locale);
  return s?.lessons.find((l) => l.id === lessonId);
}

export async function loadActivity(
  sectionId: string,
  lessonId: string,
  activityId: string,
  locale: string = DEFAULT_LOCALE
) {
  const l = await loadLesson(sectionId, lessonId, locale);
  return l?.activities.find((a) => a.id === activityId);
}

export type LessonRef = {
  sectionId: string;
  lessonId: string;
  label: string;
  title: string;
};

// Returns a map of "sectionId/lessonId" → 1-based global lesson number (L1–L16).
export async function buildGlobalLessonIndex(
  locale: string = DEFAULT_LOCALE
): Promise<Map<string, number>> {
  const all = await loadAllSections(locale);
  const map = new Map<string, number>();
  let n = 0;
  for (const s of all) {
    for (const l of s.lessons) {
      map.set(`${s.id}/${l.id}`, ++n);
    }
  }
  return map;
}

// Flat, ordered list of every lesson across all sections (the "lesson trail"),
// used to walk prev/next between lessons — including across section boundaries.
export async function loadLessonNeighbors(
  sectionId: string,
  lessonId: string,
  locale: string = DEFAULT_LOCALE
): Promise<{ prev?: LessonRef; next?: LessonRef }> {
  const all = await loadAllSections(locale);
  const flat: LessonRef[] = all.flatMap((s) =>
    s.lessons.map((l) => ({
      sectionId: s.id,
      lessonId: l.id,
      label: l.label,
      title: l.title,
    }))
  );
  const idx = flat.findIndex(
    (x) => x.sectionId === sectionId && x.lessonId === lessonId
  );
  if (idx === -1) return {};
  // Wrap the trail around so every lesson always has both a previous and a
  // next: the first lesson's "previous" is the last lesson of the curriculum,
  // and the last lesson's "next" is the very first lesson.
  return {
    prev: flat[(idx - 1 + flat.length) % flat.length],
    next: flat[(idx + 1) % flat.length],
  };
}

// --- Locale-independent metadata (for static generation, navigation) ---

export const sections: Section[] = SECTION_ORDER.map(
  (id) => EN_SECTIONS[id]
);

// Backwards-compatible sync getters (English). Used by static param
// generators and any client-side code that just needs IDs/counts.
export function getSection(id: string): Section | undefined {
  return EN_SECTIONS[id];
}

export function getLesson(sectionId: string, lessonId: string) {
  return getSection(sectionId)?.lessons.find((l) => l.id === lessonId);
}

export function getActivity(
  sectionId: string,
  lessonId: string,
  activityId: string
) {
  return getLesson(sectionId, lessonId)?.activities.find(
    (a) => a.id === activityId
  );
}
