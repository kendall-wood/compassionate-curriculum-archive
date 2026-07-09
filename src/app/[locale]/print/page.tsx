import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { loadAllSections } from "@/data/curriculum";
import { ICE_BREAKERS, ICE_BREAKERS_INTRO } from "@/data/appendix";
import { REFERENCE_SECTIONS } from "@/data/references";
import { PrintBlocks } from "@/components/print/PrintBlocks";
import { PrintCurriculumTable } from "@/components/print/PrintCurriculumTable";
import { PagedPreview } from "@/components/print/PagedPreview";
import type { ContentBlock, Section } from "@/data/types";

// Print edition of the full curriculum, laid out to mirror the website:
// the site-title masthead, yellow section tabs, the 4-column curriculum
// table, lesson heroes with breadcrumbs, and the pill + content activity
// grid. The server renders the whole book into a hidden container;
// PagedPreview then runs Paged.js over it to produce 8.5×11in pages with
// mirrored margins and page numbers (see public/print/book.css).

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "print" });
  return { title: t("metaTitle"), robots: { index: false } };
}

// Website tab row (Intro / I / II / III) as static print pills; the active
// tab gets the yellow accent fill exactly like SectionTabs.tsx.
function PrintTabs({
  activeId,
  introLabel,
  sections,
}: {
  activeId: string;
  introLabel: string;
  sections: Section[];
}) {
  const tab = (id: string, label: string) => (
    <span
      key={id}
      className={id === activeId ? "cc-pill cc-pill-active" : "cc-pill"}
    >
      {label}
    </span>
  );
  return (
    <div className="cc-tabs">
      {tab("intro", introLabel)}
      {sections.map((s) => tab(s.id, s.label))}
    </div>
  );
}

// One group row of the contents table, mirroring the curriculum table's
// system: the section name sits in column 1 and all of its entry lines
// stack inside a single bordered row (one hairline per group, not per
// line). Page numbers resolve via Paged.js target-counter on the empty
// <a> in the page column.
type TocEntry = { href: string; label?: string; title?: string };

function TocGroup({
  section,
  sectionHref,
  entries,
}: {
  section: string;
  sectionHref?: string;
  entries: TocEntry[];
}) {
  return (
    <div className="cc-toc-group">
      <span className="cc-toc-col-section">
        {sectionHref ? <a href={sectionHref}>{section}</a> : section}
      </span>
      <div className="cc-toc-lines">
        {entries.map((e) => (
          <div key={e.href} className="cc-toc-line">
            <span className="cc-toc-col-lesson">
              {e.label ? (
                <a href={e.href}>
                  <strong>{e.label}</strong> {e.title}
                </a>
              ) : (
                ""
              )}
            </span>
            <span className="cc-toc-col-page">
              <a className="cc-toc-pagenum" href={e.href} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Ruled activity section mirroring ActivityBlock.tsx: bold heading over a
// full-width rule, then a [pill | content] layout. The heading, pill, and
// FIRST content block are wrapped in one break-inside: avoid unit —
// Paged.js does not reliably honor break-after: avoid, so this is the
// only way to guarantee a heading never strands at a page foot while its
// content starts the next page. The remaining blocks flow and break
// freely in a second container with the same left indent.
function PrintActivity({
  heading,
  pill,
  pillActive,
  blocks,
}: {
  heading: string;
  pill: string;
  pillActive?: boolean;
  blocks: ContentBlock[];
}) {
  const [first, ...rest] = blocks;
  return (
    <section className="cc-activity">
      <div className="cc-activity-lead">
        <h3 className="cc-activity-heading">{heading}</h3>
        <div className="cc-activity-grid">
          <div className="cc-activity-pill-col">
            <span className={pillActive ? "cc-pill cc-pill-active" : "cc-pill"}>
              {pill}
            </span>
          </div>
          <div className="cc-activity-content">
            {first ? <PrintBlocks blocks={[first]} /> : null}
          </div>
        </div>
      </div>
      {rest.length > 0 ? (
        <div className="cc-activity-grid">
          <div className="cc-activity-content">
            <PrintBlocks blocks={rest} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default async function PrintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sections = await loadAllSections(locale);
  const site = await getTranslations("site");
  const t = await getTranslations("print");
  const nav = await getTranslations("nav");
  const table = await getTranslations("table");
  const intro = await getTranslations("intro");
  const about = await getTranslations("about");
  const appendix = await getTranslations("appendix");
  const sectionT = await getTranslations("section");
  const activityT = await getTranslations("activityBlock");
  const activityTabsT = await getTranslations("activityTabs");

  const tableHeaders = {
    lesson: table("lesson"),
    title: table("title"),
    activities: table("activities"),
    linksAndImages: table("linksAndImages"),
  };

  // Cumulative lesson numbering (L1–L14) across sections, same as the web.
  const sectionOffsets: number[] = [];
  sections.reduce((acc, s, i) => {
    sectionOffsets[i] = acc;
    return acc + s.lessons.length;
  }, 0);

  return (
    <div className="cc-print-root">
      {/* Screen-only preview chrome. Kept out of book.css because Paged.js
          drops @media screen rules while compiling that file for print. */}
      <style>{`
        @media screen {
          body { background: #3a3a3a !important; }
          .pagedjs_pages {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            padding: 72px 24px 48px;
          }
          .pagedjs_page {
            background: #ffffff;
            box-shadow: 0 2px 14px rgba(0, 0, 0, 0.45);
          }
        }
      `}</style>
      <PagedPreview />

      {/* Book source — hidden; Paged.js consumes its innerHTML. */}
      <div id="cc-book-source" style={{ display: "none" }}>
        <div className="cc-book">
          {/* ---- Cover: masthead + tab pills, like the site's landing ---- */}
          <section className="cc-cover">
            {/* Running-head source for verso pages (book title master item) */}
            <span className="cc-run cc-run-book">{site("title")}</span>
            <h1 className="cc-site-title cc-cover-title">{site("title")}</h1>
            <div className="cc-tabs cc-cover-tabs">
              <span className="cc-pill">{nav("intro")}</span>
              {sections.map((s) => (
                <span key={s.id} className="cc-pill">
                  {s.label}
                </span>
              ))}
            </div>
            <p className="cc-cover-subtitle">{site("description")}</p>
            <p className="cc-cover-edition">
              <span className="cc-pill cc-pill-active">
                {t("printedEdition")}
              </span>
            </p>
          </section>

          {/* ---- Table of contents: same ruled-table format as the
                 curriculum table (Section | Lesson | Page) ---- */}
          <nav className="cc-toc">
            <h1 className="cc-site-title">{t("contents")}</h1>
            <div className="cc-toc-table">
              <div className="cc-toc-header">
                <span>{about("referencesColSection")}</span>
                <span>{table("lesson")}</span>
                <span className="cc-toc-col-page">{t("page")}</span>
              </div>

              <TocGroup
                section={intro("heading")}
                entries={[{ href: "#cc-intro" }]}
              />

              {sections.map((section, si) => (
                <TocGroup
                  key={section.id}
                  section={section.label}
                  sectionHref={`#cc-sec-${section.id}`}
                  entries={section.lessons.map((lesson, li) => ({
                    href: `#cc-lesson-${section.id}-${lesson.id}`,
                    label: `L${sectionOffsets[si] + li + 1}`,
                    title: lesson.title,
                  }))}
                />
              ))}

              <TocGroup
                section={appendix("heading")}
                entries={[{ href: "#cc-appendix" }]}
              />
              <TocGroup
                section={about("heading")}
                entries={[{ href: "#cc-about" }]}
              />
              <TocGroup
                section={t("appendixReferences")}
                entries={[{ href: "#cc-references" }]}
              />
            </div>
          </nav>

          {/* ---- Introduction: mirrors /intro ---- */}
          <article id="cc-intro" className="cc-chapter">
            <span className="cc-run cc-run-section">/ {intro("heading")}</span>
            <h1 className="cc-site-title">{site("title")}</h1>
            <PrintTabs
              activeId="intro"
              introLabel={nav("intro")}
              sections={sections}
            />
            <h2 className="cc-heading">{intro("heading")}</h2>
            <p className="cc-print-p">{intro("p1")}</p>
            <p className="cc-print-p">{intro("p2")}</p>
            <p className="cc-print-p">
              {intro("p3Intro")}{" "}
              <span className="cc-pill">{intro("p3PillBeloved")}</span>{" "}
              {intro("p3MidBeloved")}{" "}
              <span className="cc-pill">{intro("p3PillRestorative")}</span>{" "}
              {intro("p3MidRestorative")}{" "}
              <span className="cc-pill">{intro("p3PillMedia")}</span>{" "}
              {intro("p3MidMedia")}
            </p>
            <p className="cc-print-p">{intro("p4")}</p>
            <p className="cc-print-p">{intro("p5")}</p>
          </article>

          {/* ---- Curriculum sections ---- */}
          {sections.map((section, si) => (
            <div key={section.id}>
              {/* Section index page: masthead, tabs, intro, curriculum table */}
              <article id={`cc-sec-${section.id}`} className="cc-section-opener">
                <span className="cc-run cc-run-section">
                  / {section.label}
                </span>
                <h1 className="cc-site-title">{site("title")}</h1>
                <PrintTabs
                  activeId={section.id}
                  introLabel={nav("intro")}
                  sections={sections}
                />
                <h2 className="cc-heading">{sectionT("introduction")}</h2>
                <p className="cc-print-p">{section.overview}</p>
                <h2 className="cc-heading">{sectionT("curriculum")}</h2>
                <PrintCurriculumTable
                  lessons={section.lessons}
                  offset={sectionOffsets[si]}
                  headers={tableHeaders}
                />
              </article>

              {/* Lesson pages: breadcrumb, big title, hero, activities */}
              {section.lessons.map((lesson) => (
                <article
                  key={lesson.id}
                  id={`cc-lesson-${section.id}-${lesson.id}`}
                  className="cc-lesson"
                >
                  {/* Running head in the site's breadcrumb form; lesson
                      label (not title) keeps it short enough for the
                      top margin. */}
                  <span className="cc-run cc-run-section">
                    / {section.label} / {lesson.label}
                  </span>
                  <p className="cc-breadcrumb">
                    / {section.title}{" "}
                    <span className="cc-breadcrumb-dim">/ {lesson.label}</span>
                  </p>
                  <h1 className="cc-lesson-title">{lesson.title}</h1>

                  {lesson.heroImage ? (
                    <figure className="cc-hero-figure">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={lesson.heroImage}
                        alt={`${lesson.title} hero image`}
                      />
                    </figure>
                  ) : null}

                  {/* Static mirror of the ActivityTabs row */}
                  <div className="cc-tabs cc-activity-tabs">
                    <span className="cc-pill cc-pill-active">
                      {activityTabsT("overview")}
                    </span>
                    {lesson.activities.map((a) => (
                      <span key={a.id} className="cc-pill">
                        {a.label}
                      </span>
                    ))}
                  </div>

                  <PrintActivity
                    heading={activityT("forFacilitators")}
                    pill={activityT("intro")}
                    blocks={lesson.facilitatorBlocks}
                  />

                  {lesson.activities.map((activity) => (
                    <PrintActivity
                      key={activity.id}
                      heading={activity.title}
                      pill={activity.label}
                      blocks={activity.blocks}
                    />
                  ))}
                </article>
              ))}
            </div>
          ))}

          {/* ---- Appendix: mirrors /appendix ---- */}
          <article id="cc-appendix" className="cc-chapter">
            <span className="cc-run cc-run-section">
              / {appendix("heading")}
            </span>
            <h1 className="cc-site-title">{appendix("heading")}</h1>
            <h2 className="cc-heading">{appendix("iceBreakersHeading")}</h2>
            <p className="cc-print-p">{ICE_BREAKERS_INTRO}</p>
            <ol className="cc-icebreaker-list">
              {ICE_BREAKERS.map((ib, i) => (
                <li key={i}>
                  <h3 className="cc-icebreaker-title">
                    {i + 1}. {ib.title}
                  </h3>
                  {ib.blocks.map((b, j) => (
                    <p key={j} className="cc-print-p cc-print-small">
                      {b.heading ? <strong>{b.heading}: </strong> : null}
                      {b.text}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
          </article>

          {/* ---- About & acknowledgements: mirrors /about ---- */}
          <article id="cc-about" className="cc-chapter">
            <span className="cc-run cc-run-section">/ {about("heading")}</span>
            <h1 className="cc-site-title">{about("heading")}</h1>
            <p className="cc-print-p">{about("p1")}</p>
            <p className="cc-print-p">{about("p2")}</p>
            <h2 className="cc-heading">{about("acknowledgementsHeading")}</h2>
            <p className="cc-print-p">{about("ack1")}</p>
            <p className="cc-print-p">{about("ack2")}</p>
            <p className="cc-print-p">{about("ack3")}</p>
          </article>

          {/* ---- References: the /about table (Section/Lesson/Source) ---- */}
          <article id="cc-references" className="cc-chapter">
            <span className="cc-run cc-run-section">
              / {t("appendixReferences")}
            </span>
            <h1 className="cc-site-title">{t("appendixReferences")}</h1>
            <p className="cc-print-p cc-references-intro">
              {about("referencesIntro")}
            </p>
            <div className="cc-ref-table">
              <div className="cc-ref-header">
                <span>{about("referencesColSection")}</span>
                <span>{about("referencesColLesson")}</span>
                <span>{about("referencesColSource")}</span>
              </div>
              {REFERENCE_SECTIONS.map((refSection) =>
                refSection.lessons.map((lesson, li) => (
                  <div
                    key={`${refSection.section}-${lesson.lessonLabel}`}
                    className="cc-ref-row"
                  >
                    <span className="cc-ref-section-name">
                      {li === 0 ? refSection.section : ""}
                    </span>
                    <span className="cc-ref-lesson-name">
                      <strong>{lesson.lessonLabel}</strong> {lesson.lessonTitle}
                    </span>
                    <ul className="cc-ref-sources">
                      {lesson.sources.map((source, sj) => (
                        <li key={sj}>{source}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </div>

      {/* Paged.js renders the paginated book here. */}
      <div id="cc-book-pages" />
    </div>
  );
}
