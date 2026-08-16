import type { Section } from "@/data/types";
import { extractHeaderHits, normalizeForMatch, type HeaderHit } from "./running-header";

export interface OrderFinding {
  severity: "error" | "warning" | "info";
  message: string;
  pages?: number[];
}

// One row per page carrying a running header — "where the content is from,"
// surfaced directly in the portal so a page's site location doesn't have to
// be worked out by hand.
export interface PageMapEntry {
  page: number;
  sectionId: string | null;
  sectionTitle: string;
  lessonNum: number;
  lessonTitle: string;
  matchesSite: boolean;
}

interface ExpectedLesson {
  sectionId: string;
  sectionTitle: string;
  lessonTitle: string;
}

// Site lessons flattened in curriculum order, 1-indexed by position — this
// is the same continuous L1..Ln numbering the website and this PDF both use
// (lessons are NOT renumbered per section in either place).
function buildExpectedSequence(sections: Section[]): ExpectedLesson[] {
  const out: ExpectedLesson[] = [];
  for (const s of sections) {
    for (const l of s.lessons) {
      out.push({ sectionId: s.id, sectionTitle: s.title, lessonTitle: l.title });
    }
  }
  return out;
}

function sectionIdForTitle(title: string, sections: Section[]): string | null {
  const norm = normalizeForMatch(title);
  return sections.find((s) => normalizeForMatch(s.title) === norm)?.id ?? null;
}

export function buildPageMap(
  pages: { page: number; text: string }[],
  sections: Section[]
): PageMapEntry[] {
  const expected = buildExpectedSequence(sections);
  return extractHeaderHits(pages).map((h) => {
    const exp = expected[h.lessonNum - 1];
    const matchesSite =
      !!exp &&
      sectionIdForTitle(h.sectionTitle, sections) === exp.sectionId &&
      normalizeForMatch(h.lessonTitle) === normalizeForMatch(exp.lessonTitle);
    return {
      page: h.page,
      sectionId: sectionIdForTitle(h.sectionTitle, sections),
      sectionTitle: h.sectionTitle,
      lessonNum: h.lessonNum,
      lessonTitle: h.lessonTitle,
      matchesSite,
    };
  });
}

export function checkOrder(
  pages: { page: number; text: string }[],
  sections: Section[] // in expected curriculum order, e.g. loadAllSections()
): OrderFinding[] {
  const findings: OrderFinding[] = [];
  const expected = buildExpectedSequence(sections);
  const hits = extractHeaderHits(pages);

  if (hits.length === 0) {
    findings.push({
      severity: "warning",
      message:
        "No section/lesson running headers were found in this PDF, so lesson order couldn't be checked. " +
        '(This check looks for headers like "III. Media, Narrative & Futuring / L14. Participatory Futuring ' +
        'and Worldbuilding" on each content page.)',
    });
    return findings;
  }

  // Distinct lesson numbers, in the order first encountered — both PDF and
  // site number lessons continuously across the whole curriculum (L1..Ln),
  // so this checks the single global sequence rather than per-section runs.
  const seenOrder: number[] = [];
  for (const h of hits) {
    if (seenOrder[seenOrder.length - 1] !== h.lessonNum) seenOrder.push(h.lessonNum);
  }
  const distinct: number[] = [];
  for (const n of seenOrder) if (!distinct.includes(n)) distinct.push(n);

  const isStrictlyIncreasing = distinct.every((n, i) => i === 0 || n > distinct[i - 1]);
  if (!isStrictlyIncreasing) {
    findings.push({
      severity: "error",
      message: `Lessons appear out of order in the PDF: L${distinct.join(", L")}.`,
      pages: hits.map((h) => h.page),
    });
  }

  const maxExpected = expected.length;
  const outOfRange = distinct.filter((n) => n < 1 || n > maxExpected);
  if (outOfRange.length > 0) {
    findings.push({
      severity: "error",
      message: `PDF running headers reference lesson number(s) that don't exist on the site: L${outOfRange.join(", L")} (site has L1–L${maxExpected}).`,
    });
  }

  const gaps = Array.from({ length: maxExpected }, (_, i) => i + 1).filter(
    (n) => !distinct.includes(n)
  );
  if (gaps.length > 0) {
    const labels = gaps.map((n) => {
      const exp = expected[n - 1];
      return exp ? `L${n} (${exp.lessonTitle})` : `L${n}`;
    });
    findings.push({
      severity: "error",
      message: `Missing from the PDF's running headers: ${labels.join(", ")}.`,
    });
  }

  // Per-lesson cross-check against the site: right section, right title.
  // Grouped by lesson number (a lesson usually spans several spreads, each
  // carrying the same header) so this reports once per lesson, not once per
  // page.
  const hitsByLesson = new Map<number, HeaderHit[]>();
  for (const h of hits) {
    if (!hitsByLesson.has(h.lessonNum)) hitsByLesson.set(h.lessonNum, []);
    hitsByLesson.get(h.lessonNum)!.push(h);
  }
  for (const [lessonNum, group] of hitsByLesson) {
    const exp = expected[lessonNum - 1];
    if (!exp) continue; // already reported via outOfRange
    const pagesForLesson = group.map((h) => h.page);
    const first = group[0];
    const gotSectionId = sectionIdForTitle(first.sectionTitle, sections);
    if (gotSectionId !== exp.sectionId) {
      const expectedSectionTitle = sections.find((s) => s.id === exp.sectionId)?.title;
      findings.push({
        severity: "error",
        message: `L${lessonNum}: PDF header puts it under "${first.sectionTitle}", but the site has L${lessonNum} under "${expectedSectionTitle}".`,
        pages: pagesForLesson,
      });
    }
    if (normalizeForMatch(first.lessonTitle) !== normalizeForMatch(exp.lessonTitle)) {
      findings.push({
        severity: "warning",
        message: `L${lessonNum}: PDF header title "${first.lessonTitle}" differs from the site's "${exp.lessonTitle}".`,
        pages: pagesForLesson,
      });
    }
  }

  findings.push({
    severity: "info",
    message:
      "Appendix content (e.g. Grounding Activities, After Care) doesn't carry a lesson running header in " +
      "the PDF, so this check can't verify its position — check it manually if it was recently reordered.",
  });

  if (findings.length === 1) {
    findings.unshift({
      severity: "info",
      message: `All ${distinct.length} lessons found in the PDF match the site's order, sections, and titles.`,
    });
  }

  return findings;
}
