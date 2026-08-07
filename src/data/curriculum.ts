import type { Section } from "./types";
import { DEFAULT_LOCALE } from "@/i18n/locales";
import sectionsIndexData from "./sections-index.json";

// Single source of truth for which sections exist and their curriculum
// order. Adding a section (e.g. from the client editor) means appending a
// row here plus creating `src/data/sections/<id>/en.json` — no code change.
// `inCurriculum: false` sections (currently just Appendix) are still
// loadable via loadSection/loadLesson/loadActivity, but excluded from
// SECTION_ORDER/loadAllSections/CurriculumTable/SectionTabs/print, which
// all render Appendix through its own dedicated route instead.
interface SectionIndexEntry {
  id: string;
  inCurriculum: boolean;
}

const SECTIONS_INDEX = sectionsIndexData as SectionIndexEntry[];

export const SECTION_ORDER = SECTIONS_INDEX.filter((s) => s.inCurriculum).map(
  (s) => s.id
);

export type SectionId = string;

// Every registered section id, curriculum or not (i.e. including Appendix) —
// for the editor's content tree, which lets the client edit Appendix content
// too even though it's excluded from the public curriculum nav/print/index.
export function allSectionIds(): string[] {
  return SECTIONS_INDEX.map((s) => s.id);
}

// English is the fallback for every locale, so it's cached rather than
// re-imported on every call. Populated lazily via loadSection's dynamic
// import rather than eager static imports — this is what lets a brand-new
// section (added after this file was last edited) load without a code
// change: webpack's template-literal import() bundles every file matching
// `./sections/*/en.json` regardless of which id is requested at runtime.
const enCache = new Map<string, Section>();

async function loadEnSection(id: string): Promise<Section | undefined> {
  if (enCache.has(id)) return enCache.get(id);
  try {
    const mod = await import(`./sections/${id}/en.json`);
    const section = mod.default as Section;
    enCache.set(id, section);
    return section;
  } catch {
    return undefined;
  }
}

// Async loader: pulls the locale-specific JSON if it exists, else falls
// back to English. The translation script populates `<id>/<locale>.json`
// for every locale, so in production the fallback is rarely hit.
export async function loadSection(
  id: string,
  locale: string = DEFAULT_LOCALE
): Promise<Section | undefined> {
  if (!SECTIONS_INDEX.some((s) => s.id === id)) return undefined;
  if (locale === DEFAULT_LOCALE) return loadEnSection(id);
  try {
    const mod = await import(`./sections/${id}/${locale}.json`);
    return mod.default as Section;
  } catch {
    return loadEnSection(id);
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

// `loadAllSections` plus Appendix, for generateStaticParams on the generic
// lesson/activity routes only ([section]/[lesson] and .../[activity]).
// Deliberately not used for [section]'s own generateStaticParams — Appendix
// has its own static route there, so including it would collide.
export async function loadSectionsWithAppendix(
  locale: string = DEFAULT_LOCALE
): Promise<Section[]> {
  const all = await loadAllSections(locale);
  const appendix = await loadSection("appendix", locale);
  return appendix ? [...all, appendix] : all;
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

// Returns a map of "sectionId/lessonId" → 1-based global lesson number
// (L1–L16). Appendix isn't part of SECTION_ORDER, but its lessons still get
// the final numbers in the sequence, after the last curriculum section.
export async function buildGlobalLessonIndex(
  locale: string = DEFAULT_LOCALE
): Promise<Map<string, number>> {
  const all = await loadAllSections(locale);
  const appendix = await loadSection("appendix", locale);
  const map = new Map<string, number>();
  let n = 0;
  for (const s of [...all, ...(appendix ? [appendix] : [])]) {
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
  const appendix = await loadSection("appendix", locale);
  const flat: LessonRef[] = [...all, ...(appendix ? [appendix] : [])].flatMap(
    (s) =>
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

// Cumulative lesson count for every curriculum section before `sectionId`
// (locale-independent) — CurriculumTable's "L5, L6…" numbering needs this,
// but as a client component it can't await a dynamic import itself, so the
// server page computes it and passes it down as a prop.
export async function sectionLessonOffset(
  sectionId: string,
  locale: string = DEFAULT_LOCALE
): Promise<number> {
  const all = await loadAllSections(locale);
  let offset = 0;
  for (const s of all) {
    if (s.id === sectionId) return offset;
    offset += s.lessons.length;
  }
  return offset;
}
