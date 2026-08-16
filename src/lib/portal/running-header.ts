// Parses the InDesign print deliverable's traveling header — printed at the
// top of every content spread as "{roman}. {Section Title} / L{n}. {Lesson
// Title}" (e.g. "III. Media, Narrative & Futuring / L14. Participatory
// Futuring and Worldbuilding"), the same text a facing page shows in the
// printed book to tell a reader where they are. PyMuPDF's text extraction
// doesn't preserve visual position, so this just finds that string wherever
// it lands in a page's extracted text rather than assuming a fixed offset.
export interface HeaderMatch {
  sectionRoman: string;
  sectionTitle: string;
  lessonNum: number;
  lessonTitle: string;
}

const HEADER_RE = /\b([IVXLC]+)\.\s*([^/\n]+?)\s*\/\s*L(\d+)\.\s*([^\n]+)/;

export function parseRunningHeader(text: string): HeaderMatch | null {
  const m = text.match(HEADER_RE);
  if (!m) return null;
  return {
    sectionRoman: m[1],
    sectionTitle: m[2].trim(),
    lessonNum: Number(m[3]),
    lessonTitle: m[4].trim(),
  };
}

// A lesson's own opening spread prints its big title + intro on whichever
// half happens to fall first (often the LEFT half, with the small combined
// header only appearing on the right) — e.g. "L14. Participatory Futuring
// and Worldbuilding" as its own heading line, distinct from the small
// "III. Media, Narrative & Futuring / L14. ..." running header. Recognizing
// this heading too (not just the running header) is what lets that opener
// content attribute to the new lesson instead of carrying forward as the
// previous lesson's tail.
const OPENER_HEADING_RE = /^L(\d+)\.\s+([^\n]+)/;

// Strips whatever precedes the actual heading on a left/verso half: the
// folio (page number) line, and/or the "Compassionate Curriculum" book-title
// line that a verso page's own header carries — both can appear before the
// opener heading depending on extraction order.
function stripLeadingChrome(text: string): string {
  let out = text;
  let prev;
  do {
    prev = out;
    out = out.replace(/^\s*\d+\s*\n/, "").replace(/^\s*Compassionate Curriculum\s*\n/, "");
  } while (out !== prev);
  return out;
}

export function parseOpenerHeading(
  text: string
): { lessonNum: number; lessonTitle: string } | null {
  const m = stripLeadingChrome(text).match(OPENER_HEADING_RE);
  if (!m) return null;
  return { lessonNum: Number(m[1]), lessonTitle: m[2].trim() };
}

// Front/back-matter pages (before L1 and after the last lesson) carry a
// plain chapter-name header with no lesson number at all — recognizing them
// stops a lesson's carried-forward state from bleeding into the Appendix,
// Acknowledgements, etc., which would otherwise look like part of the last
// lesson forever (nothing after it ever carries a header to end the run).
const CHAPTER_RESET_TITLES = new Set([
  "Appendix",
  "Acknowledgements",
  "Grounding Activities",
  "After Care",
  "Ice Breakers",
  "References",
  "Table of Contents",
  "About",
  "Introduction: A Practice of Hope",
]);

export function isChapterResetMarker(text: string): boolean {
  return text.split("\n").some((line) => CHAPTER_RESET_TITLES.has(line.trim()));
}

export interface HeaderHit extends HeaderMatch {
  page: number;
}

// An InDesign spread (verso + recto) exports as one PDF page, but only the
// recto half carries a "Section / L#. Title" header — the verso half only
// ever shows the book title. So a page's own text often carries no header at
// all even though it's clearly still inside whatever lesson was last
// announced (its content is the tail end of the previous lesson, printed on
// the left half of a spread that opens the next lesson on the right).
// attributeSegments() walks the page sequence in physical reading order and
// carries the most recently seen lesson number forward onto pages without
// their own header — the same inference a reader makes without needing the
// header repeated on every page.
export interface AttributedSegment {
  page: number;
  text: string;
  header: HeaderMatch | null; // non-null only when this page's own text carried a header
  lessonNum: number | null; // carried-forward state; null before the first header is seen
}

export function attributeSegments(
  pages: { page: number; text: string }[]
): AttributedSegment[] {
  const out: AttributedSegment[] = [];
  let current: number | null = null;
  for (const p of pages) {
    const header = parseRunningHeader(p.text);
    const opener = parseOpenerHeading(p.text);
    if (header) current = header.lessonNum;
    else if (opener) current = opener.lessonNum;
    else if (isChapterResetMarker(p.text)) current = null;
    out.push({ page: p.page, text: p.text, header, lessonNum: current });
  }
  return out;
}

export function extractHeaderHits(pages: { page: number; text: string }[]): HeaderHit[] {
  const hits: HeaderHit[] = [];
  for (const seg of attributeSegments(pages)) {
    if (seg.header) hits.push({ page: seg.page, ...seg.header });
  }
  return hits;
}

// Loose match for comparing PDF header text against site data: the site's
// own `label` and `title` fields already disagree on punctuation for one
// section ("Media, Narrative, & Futuring" vs "Media, Narrative & Futuring"),
// so this strips case, "&"/"," separators, and other punctuation rather than
// requiring an exact string match.
export function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[&,]/g, " ")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
