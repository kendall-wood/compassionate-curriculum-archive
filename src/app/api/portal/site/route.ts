// Builds a normalized, flat list of every real page on the live site (in
// the same lesson/activity/appendix/about structure the site itself uses)
// by importing the site's own content modules directly — not a copy, not
// re-extracted from the PDF. This guarantees the portal's "Website" view is
// always exactly what's actually on the site, since it reads the same
// source files the site's pages import from.
import { NextResponse } from "next/server";
import { loadAllSections, loadSection } from "@/data/curriculum";
import { ICE_BREAKERS, ICE_BREAKERS_INTRO } from "@/data/appendix";
import { REFERENCE_SECTIONS } from "@/data/references";
import type { ContentBlock, Section, Lesson } from "@/data/types";
import messages from "@/messages/en.json";

export interface SiteBlock {
  kind: "p" | "ul" | "ol" | "h" | "label" | "image" | "download";
  text?: string;
  bold?: boolean;
  // A bold lead-in that precedes `text` on the same line at a different
  // weight than the rest — kept as a separate field rather than folding
  // into `bold` so each run can report its own true weight on hover.
  boldPrefix?: string;
  items?: string[];
  src?: string;
  alt?: string;
  caption?: string;
  href?: string;
}

export interface SiteActivity {
  id: string;
  label: string;
  title: string;
  blocks: SiteBlock[];
}

export interface SiteBreadcrumb {
  sectionTitle: string;
  globalIndex: number;
}

export interface CurriculumTableRow {
  lessonLabel: string;
  lessonTitle: string;
  activities: { label: string; title: string }[];
}

export interface IceBreakerRow {
  number: number;
  title: string;
  directions: { prefix?: string; text: string }[];
}

export interface ReferenceRow {
  sectionLabel: string;
  showSectionLabel: boolean;
  lessonLabel: string;
  lessonTitle: string;
  sources: string[];
}

export interface SitePage {
  id: string;
  chapter: string;
  kind: "intro" | "section" | "lesson" | "appendix-index" | "ice-breakers" | "references" | "about";
  title: string;
  heroImage?: string;
  breadcrumb?: SiteBreadcrumb;
  blocks: SiteBlock[];
  activities?: SiteActivity[];
  curriculumTable?: CurriculumTableRow[];
  iceBreakerRows?: IceBreakerRow[];
  referenceRows?: ReferenceRow[];
}

const p = (text: string, bold = false, boldPrefix?: string): SiteBlock => ({
  kind: "p",
  text,
  bold,
  boldPrefix,
});
const h = (text: string): SiteBlock => ({ kind: "h", text });

function asBlocks(blocks: ContentBlock[] | undefined): SiteBlock[] {
  return (blocks ?? []).map((b) => ({ ...b }));
}

function chapterLabel(sectionId: string): string {
  switch (sectionId) {
    case "beloved-community":
      return "I. Beloved Community";
    case "restorative-practices":
      return "II. Restorative Practices";
    case "media-narrative-futuring":
      return "III. Media, Narrative & Futuring";
    case "appendix":
      return "Appendix";
    default:
      return sectionId;
  }
}

// Mirrors curriculum.ts's buildGlobalLessonIndex: every lesson across the 3
// main sections, then Appendix's own lessons, numbered 1..N in one
// continuous sequence — exactly what LessonPage's "/ L#" breadcrumb and (for
// the 3 main sections) CurriculumTable's own local numbering both show.
async function buildGlobalIndex(): Promise<Map<string, number>> {
  const sections = await loadAllSections();
  const map = new Map<string, number>();
  let n = 0;
  for (const s of sections) {
    for (const l of s.lessons) map.set(`${s.id}/${l.id}`, ++n);
  }
  const appendixSection = await loadSection("appendix");
  if (appendixSection) {
    for (const l of appendixSection.lessons) map.set(`appendix/${l.id}`, ++n);
  }
  return map;
}

function buildSectionPages(section: Section, globalIndex: Map<string, number>): SitePage[] {
  const chapter = chapterLabel(section.id);
  const pages: SitePage[] = [];

  pages.push({
    id: `section/${section.id}`,
    chapter,
    kind: "section",
    title: section.title,
    blocks: [p(section.overview), ...asBlocks(section.facilitatorBlocks)],
    curriculumTable: section.lessons.map((lesson) => ({
      lessonLabel: `L${globalIndex.get(`${section.id}/${lesson.id}`) ?? "?"}`,
      lessonTitle: lesson.title,
      activities: lesson.activities.map((a) => ({ label: a.label, title: a.title })),
    })),
  });

  for (const lesson of section.lessons as Lesson[]) {
    pages.push({
      id: `lesson/${section.id}/${lesson.id}`,
      chapter,
      kind: "lesson",
      title: lesson.title,
      heroImage: lesson.heroImage,
      breadcrumb: {
        sectionTitle: section.title,
        globalIndex: globalIndex.get(`${section.id}/${lesson.id}`) ?? 0,
      },
      blocks: asBlocks(lesson.facilitatorBlocks),
      activities: lesson.activities.map((a) => ({
        id: a.id,
        label: a.label,
        title: a.title,
        blocks: asBlocks(a.blocks),
      })),
    });
  }

  return pages;
}

export async function GET() {
  const pages: SitePage[] = [];
  const [globalIndex, sections, appendixSection] = await Promise.all([
    buildGlobalIndex(),
    loadAllSections(),
    loadSection("appendix"),
  ]);

  // --- Intro ---
  const intro = messages.intro as Record<string, string>;
  pages.push({
    id: "intro",
    chapter: "Front Matter",
    kind: "intro",
    title: intro.heading,
    blocks: [
      p(intro.p1),
      p(intro.p2),
      p(intro.p3Intro),
      h(intro.p3PillBeloved),
      p(intro.p3MidBeloved),
      h(intro.p3PillRestorative),
      p(intro.p3MidRestorative),
      h(intro.p3PillMedia),
      p(intro.p3MidMedia),
      p(intro.p4),
      p(intro.p5),
    ],
  });

  // --- Beloved Community / Restorative Practices / Media, Narrative & Futuring ---
  for (const section of sections) {
    pages.push(...buildSectionPages(section, globalIndex));
  }

  // --- Appendix (index + its own Grounding Activities / After Care lessons) ---
  const appendixMsgs = messages.appendix as Record<string, string>;
  pages.push({
    id: "appendix-index",
    chapter: "Appendix",
    kind: "appendix-index",
    title: appendixMsgs.heading,
    blocks: [p(appendixMsgs.resourcesIntro)],
  });
  if (appendixSection) {
    for (const lesson of appendixSection.lessons as Lesson[]) {
      pages.push({
        id: `lesson/appendix/${lesson.id}`,
        chapter: "Appendix",
        kind: "lesson",
        title: lesson.title,
        heroImage: lesson.heroImage,
        breadcrumb: {
          sectionTitle: appendixSection.title,
          globalIndex: globalIndex.get(`appendix/${lesson.id}`) ?? 0,
        },
        blocks: asBlocks(lesson.facilitatorBlocks),
        activities: lesson.activities.map((a) => ({
          id: a.id,
          label: a.label,
          title: a.title,
          blocks: asBlocks(a.blocks),
        })),
      });
    }
  }

  // --- Ice Breakers ---
  pages.push({
    id: "ice-breakers",
    chapter: "Appendix",
    kind: "ice-breakers",
    title: appendixMsgs.iceBreakersHeading,
    blocks: [p(ICE_BREAKERS_INTRO)],
    iceBreakerRows: ICE_BREAKERS.map((ib, i) => ({
      number: i + 1,
      title: ib.title,
      directions: ib.blocks.map((b) => ({
        prefix: b.heading ? `${b.heading}: ` : undefined,
        text: b.text,
      })),
    })),
  });

  // --- References ---
  const aboutMsgs = messages.about as unknown as Record<string, string>;
  pages.push({
    id: "references",
    chapter: "Appendix",
    kind: "references",
    title: aboutMsgs.referencesHeading ?? "References",
    blocks: [p(aboutMsgs.referencesIntro)],
    referenceRows: REFERENCE_SECTIONS.flatMap((section) =>
      section.lessons.map((lesson, li) => ({
        sectionLabel: section.section,
        showSectionLabel: li === 0,
        lessonLabel: lesson.lessonLabel,
        lessonTitle: lesson.lessonTitle,
        sources: lesson.sources,
      }))
    ),
  });

  // --- About ---
  const about = messages.about as unknown as Record<string, string> & { ackThanks: string[] };
  pages.push({
    id: "about",
    chapter: "About",
    kind: "about",
    title: about.heading,
    blocks: [
      p(about.p1),
      p(about.p2),
      h(about.storyHeading),
      p(about.story1),
      p(about.story2),
      p(about.story3),
      p(about.story4),
      h(about.acknowledgementsHeading),
      p(about.ack1),
      p(about.ack2),
      { kind: "ul", items: about.ackThanks },
      p(about.ack3),
    ],
  });

  return NextResponse.json({ pages });
}
