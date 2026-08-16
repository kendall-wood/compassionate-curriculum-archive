// Typographic reference for rebuilding the print PDF in InDesign. Sizes,
// weights, and colors are measured directly from the rendered PDF's glyph
// data (font/size/color per span) — the ground truth for what's actually on
// the page, not a guess from the site's CSS. Letter-spacing has no reliable
// PDF-side signal (would require manual kerning analysis), so those values
// are pulled from the live site's own Tailwind tokens instead and labeled
// as such below.

export const TRIM_SIZE = { widthIn: 8.5, heightIn: 11, widthPt: 612, heightPt: 792 };

export const MARGINS = {
  outerPt: 54, // left rail / table columns / chapter titles start here
  bodyLeftPt: 124.7, // main paragraph column start (leaves room for the left rail)
  bodyRightPt: 554.8,
  bodyWidthPt: 430.1,
  bodyWidthIn: 5.97,
};

export const FONT_FAMILY = 'HelveticaNeue (web fallback: "Helvetica Neue", Helvetica, Arial, sans-serif)';

export const BODY_SIZE_PT = 16; // main lesson-copy baseline, used for all ratios below

export interface TypeRole {
  role: string;
  sizePt: number;
  weight: "Regular" | "Bold";
  color: string;
  sample: string;
  note?: string;
}

export const TYPE_SCALE: TypeRole[] = [
  { role: "Cover hero", sizePt: 44, weight: "Regular", color: "#000000", sample: "Compassionate / Curriculum Archive" },
  { role: "Chapter / lesson title (H1)", sizePt: 36, weight: "Regular", color: "#000000", sample: "Contents · Appendix · Identity: Helping to know ourselves", note: "Same style for section-divider pages (Contents, Appendix, About, References) and each lesson's opening title." },
  { role: "Cover subtitle", sizePt: 14, weight: "Regular", color: "#000000", sample: "An interactive, accessible archive of the..." },
  { role: "Body copy", sizePt: 16, weight: "Regular", color: "#000000", sample: "Identity work should begin with self reflection..." },
  { role: "Body pull-quote", sizePt: 16, weight: "Bold", color: "#000000", sample: "“Beloved community is formed not by the eradication...”" },
  { role: "Subhead / label", sizePt: 12, weight: "Bold", color: "#000000", sample: "For Facilitators · Ice Breakers item titles (“1. Walking circle”)" },
  { role: "Compact body (Appendix/Ice Breakers)", sizePt: 11, weight: "Regular", color: "#000000", sample: "This is a great icebreaker for activating a space..." },
  { role: "Compact inline label", sizePt: 11, weight: "Bold", color: "#000000", sample: "Directions: · Alternatives:" },
  { role: "Nav pill / breadcrumb / TOC row", sizePt: 10, weight: "Regular", color: "#000000", sample: "/ Beloved Community · Intro · L1 Identity: Helping to know ourselves" },
  { role: "TOC section label", sizePt: 10, weight: "Bold", color: "#000000", sample: "I. Beloved Community" },
  { role: "Caption / image credit", sizePt: 10, weight: "Regular", color: "#4D4D4D", sample: "The intersecting axes of privilege, domination, and oppression..." },
  { role: "Citation / reference body", sizePt: 9, weight: "Regular", color: "#000000", sample: "Bhopal, K. (2018) White privilege: the myth of a post-racial society." },
  { role: "Link / citation URL", sizePt: 9.6, weight: "Regular", color: "#333333", sample: "youtu.be/..." },
  { role: "Footer page number", sizePt: 9, weight: "Regular", color: "#000000", sample: "1, 2, 3...", note: "Centered at x=315pt on odd/recto pages, x=297pt on even/verso pages (mirrored outer-margin placement)." },
  { role: "Running header", sizePt: 7.5, weight: "Regular", color: "#000000", sample: "I. BELOVED COMMUNITY · L1", note: "All-caps chapter + lesson label, top corner of every content page." },
];

// From the live site's tailwind.config.ts `letterSpacing` tokens — the only
// authoritative source for tracking, since it isn't reliably recoverable
// from PDF glyph positions.
export const LETTER_SPACING_TOKENS = [
  { token: "hero", valuePx: -2.58, usage: "Cover hero" },
  { token: "title", valuePx: -2.16, usage: "Chapter / lesson titles" },
  { token: "body", valuePx: -0.64, usage: "Body copy" },
  { token: "sub", valuePx: -0.48, usage: "Subheads, captions" },
  { token: "nav", valuePx: -0.4, usage: "Nav pills, breadcrumbs, labels" },
];

// Ground truth for the live site's actual rendered CSS (not the print PDF) —
// read directly from the exact Tailwind arbitrary-value classes in
// ContentRenderer.tsx, ActivityBlock.tsx, and the page components
// (intro/about/[section]/[lesson] pages). Powers the Website view's hover
// inspector: every element rendered there is tagged with a `role` key so
// hovering shows the real site spec for that element, not the portal's own
// (deliberately more compact) reading-view styling.
export interface SiteTypeSpec {
  role: string;
  sizeRem: number;
  weight: 400 | 700;
  trackingEm: number;
  leading: number | "none";
  usage: string;
}

export const SITE_TYPE_SPECS: Record<string, SiteTypeSpec> = {
  "page-h1": {
    role: "Page title (H1)",
    sizeRem: 4.5,
    weight: 400,
    trackingEm: -0.03,
    leading: 1.05,
    usage: "The site name atop every top-level page (Section, Intro, About, Appendix)",
  },
  "lesson-h1": {
    role: "Lesson hero title",
    sizeRem: 4.5,
    weight: 400,
    trackingEm: -0.03,
    leading: 1.05,
    usage: "LessonHero — the big title over a lesson's hero image",
  },
  "activity-h2": {
    role: "Activity / \"For Facilitators\" heading (H2)",
    sizeRem: 2.5,
    weight: 700,
    trackingEm: -0.03,
    leading: 1.1,
    usage: "ActivityBlock / FacilitatorBlock section heading",
  },
  "section-h2": {
    role: "Page section heading (H2)",
    sizeRem: 1.5,
    weight: 700,
    trackingEm: -0.02,
    leading: 1.2,
    usage: '"Introduction", "Our Story", "Acknowledgements" — and ContentRenderer\'s inline "h" block',
  },
  body: {
    role: "Body paragraph",
    sizeRem: 2,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.25,
    usage: "ContentRenderer \"p\" block, and every Intro/About paragraph",
  },
  "body-bold": {
    role: "Body paragraph (bold)",
    sizeRem: 2,
    weight: 700,
    trackingEm: -0.02,
    leading: 1.25,
    usage: 'ContentRenderer "p" block with bold: true (pull-quotes, emphasis)',
  },
  "list-item": {
    role: "List item",
    sizeRem: 2,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.4,
    usage: 'ContentRenderer "ul"/"ol" block items',
  },
  "label-pill": {
    role: "Label pill",
    sizeRem: 1.25,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.2,
    usage: 'Activity A1/A2 tabs, "For Facilitators" intro pill, ContentRenderer "label" block',
  },
  "image-caption": {
    role: "Image caption",
    sizeRem: 1.25,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.3,
    usage: 'ContentRenderer "image" block caption (rendered at 70% opacity)',
  },
  "download-label": {
    role: "Download link label",
    sizeRem: 1.25,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.2,
    usage: 'ContentRenderer "download" block',
  },
  breadcrumb: {
    role: "Breadcrumb / nav line",
    sizeRem: 1.25,
    weight: 400,
    trackingEm: -0.02,
    leading: "none",
    usage: 'The "/ Section / L1" line under a lesson\'s hero image',
  },
  "reference-citation": {
    role: "Reference citation",
    sizeRem: 1.25,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.4,
    usage: "ReferenceSource — each bibliography entry",
  },
  "reference-label": {
    role: "Reference section / lesson label",
    sizeRem: 1.25,
    weight: 700,
    trackingEm: -0.02,
    leading: 1.3,
    usage: 'References table\'s bold "Section" and "L1 Title" cells',
  },
  "ice-breaker-title": {
    role: "Ice Breaker title / column header",
    sizeRem: 1.25,
    weight: 700,
    trackingEm: -0.02,
    leading: 1.3,
    usage: 'Ice Breakers table\'s bold "1. Walking circle" title cells',
  },
  "ice-breaker-text": {
    role: "Ice Breaker directions text",
    sizeRem: 1.25,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.3,
    usage: "Ice Breakers table's Directions/Alternatives cell body text",
  },
  "ice-breaker-label": {
    role: 'Ice Breaker "Directions:" label',
    sizeRem: 1.25,
    weight: 700,
    trackingEm: -0.02,
    leading: 1.3,
    usage: 'The bold "Directions:"/"Alternatives:" prefix inside an item\'s body paragraph',
  },
  "reference-lesson-title": {
    role: "Reference lesson title (regular run)",
    sizeRem: 1.25,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.3,
    usage:
      'The regular-weight lesson title next to a bold "L1" label — shares the label\'s own 1.3 leading (the same <span>), not the citation list\'s 1.4',
  },
  "curriculum-lesson-label": {
    role: "Curriculum table lesson label",
    sizeRem: 1.25,
    weight: 700,
    trackingEm: -0.02,
    leading: 1.3,
    usage: "CurriculumTable's bold L# label on a section page",
  },
  "curriculum-text": {
    role: "Curriculum table cell text",
    sizeRem: 1.25,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.3,
    usage: "CurriculumTable's lesson title and activity label/title cells",
  },
  "page-intro-note": {
    role: "Page intro note",
    sizeRem: 1.5,
    weight: 400,
    trackingEm: -0.02,
    leading: 1.3,
    usage: 'Appendix and References pages\' opacity-70 intro line (e.g. "Supporting material referenced across the curriculum...")',
  },
};
