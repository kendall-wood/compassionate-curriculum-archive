// Body-content check: does the actual prose in a lesson (facilitator notes +
// every activity's paragraphs, headings, and list items) still show up in
// the PDF, not just the right title/order? The running-header check only
// verifies "where" a lesson is; this verifies "what's actually printed there"
// against the site's own ContentBlock data.
import type { ContentBlock, Lesson, Section } from "@/data/types";
import { attributeSegments, parseRunningHeader } from "./running-header";

export interface ContentUnit {
  source: string; // human-readable origin, e.g. "A1. Backcasting"
  text: string;
}

// Markdown-link syntax (e.g. image captions sourcing a URL) renders as plain
// text in the print book, not "[label](url)" — strip it so that difference
// alone doesn't read as missing content.
function stripMarkdownLinks(s: string): string {
  return s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

// Collapses line-wrap artifacts from PDF text extraction (soft hyphens at
// wrap points, multi-line paragraphs broken into one line per visual row)
// and typography variants (curly quotes, em/en dashes) so a paragraph that's
// printed identically but re-flowed differently still matches.
export function normalizeBody(s: string): string {
  return stripMarkdownLinks(s)
    .replace(/\xad\s*/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function blockUnits(blocks: ContentBlock[], source: string): ContentUnit[] {
  const out: ContentUnit[] = [];
  for (const b of blocks) {
    if (b.kind === "p" || b.kind === "h" || b.kind === "label") {
      if (b.text.trim()) out.push({ source, text: b.text });
    } else if (b.kind === "ul" || b.kind === "ol") {
      for (const item of b.items) if (item.trim()) out.push({ source, text: item });
    }
    // "image"/"download" blocks intentionally skipped: download links have
    // no print equivalent, and image captions often carry markdown-link
    // syntax the print layout renders differently — neither is a reliable
    // signal of dropped prose.
  }
  return out;
}

export function lessonContentUnits(lesson: Lesson): ContentUnit[] {
  const out: ContentUnit[] = [];
  out.push(...blockUnits(lesson.facilitatorBlocks, "Facilitator notes"));
  for (const a of lesson.activities) {
    const label = a.label ? `${a.label}. ${a.title}` : a.title;
    if (a.title.trim()) out.push({ source: label, text: a.title });
    out.push(...blockUnits(a.blocks, label));
  }
  return out;
}

// Drops the printed page's chrome (folio number, book title, the small
// combined running header line) from a page's raw extracted text, leaving
// just what a reader would actually read — for showing the print side of a
// side-by-side comparison against the site's own text.
function cleanForDisplay(text: string): string {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^\d+$/.test(line)) return false;
      if (line === "Compassionate Curriculum") return false;
      if (parseRunningHeader(line)) return false;
      return true;
    })
    .join("\n");
}

export interface CheckedUnit extends ContentUnit {
  found: boolean;
}

export interface LessonContentReport {
  lessonNum: number;
  lessonTitle: string;
  sectionTitle: string;
  pages: number[];
  totalUnits: number;
  missing: ContentUnit[];
  units: CheckedUnit[]; // every unit, in site order, each flagged found/missing
  pdfText: string; // cleaned print text for this lesson's pages, for side-by-side display
}

export function buildLessonContentReport(
  pages: { page: number; text: string }[],
  sections: Section[]
): LessonContentReport[] {
  // Every page/half-page's text, bucketed by the lesson it's actually part
  // of (carried-forward — see attributeSegments) rather than by whichever
  // lesson the page's own running header names, so a spread's left half
  // (tail of the previous lesson, no header of its own) lands in the right
  // bucket instead of being lost or misread as the next lesson's content.
  const textByLesson = new Map<number, string[]>();
  const pagesByLesson = new Map<number, number[]>();
  for (const seg of attributeSegments(pages)) {
    if (seg.lessonNum == null || !seg.text.trim()) continue;
    if (!textByLesson.has(seg.lessonNum)) textByLesson.set(seg.lessonNum, []);
    textByLesson.get(seg.lessonNum)!.push(seg.text);
    const ps = pagesByLesson.get(seg.lessonNum) ?? [];
    if (!ps.includes(seg.page)) ps.push(seg.page);
    pagesByLesson.set(seg.lessonNum, ps);
  }

  const flatLessons: { sectionTitle: string; lesson: Lesson }[] = [];
  for (const s of sections) {
    for (const l of s.lessons) flatLessons.push({ sectionTitle: s.title, lesson: l });
  }

  const reports: LessonContentReport[] = [];
  flatLessons.forEach(({ sectionTitle, lesson }, i) => {
    const lessonNum = i + 1;
    const lessonPages = pagesByLesson.get(lessonNum);
    const lessonText = textByLesson.get(lessonNum);
    // No pages found for this lesson at all — already reported as a gap by
    // the order check; nothing to diff content against.
    if (!lessonPages || !lessonText || lessonPages.length === 0) return;

    const blob = normalizeBody(lessonText.join(" \n "));
    const rawUnits = lessonContentUnits(lesson);
    const checkedUnits: CheckedUnit[] = rawUnits.map((u) => {
      const norm = normalizeBody(u.text);
      return { ...u, found: norm.length === 0 || blob.includes(norm) };
    });
    const missing = checkedUnits.filter((u) => !u.found);

    reports.push({
      lessonNum,
      lessonTitle: lesson.title,
      sectionTitle,
      pages: lessonPages,
      totalUnits: rawUnits.length,
      missing,
      units: checkedUnits,
      pdfText: cleanForDisplay(lessonText.join("\n")),
    });
  });

  return reports;
}
