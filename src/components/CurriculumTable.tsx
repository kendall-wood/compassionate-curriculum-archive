"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState, useCallback } from "react";
import type { Activity, Lesson } from "@/data/types";
import { sections } from "@/data/curriculum";

const headerCell =
  "text-[1.25rem] tracking-[-0.02em] leading-none ps-[0.375rem]";

// PRD column offsets at 1440 design width: Lesson 0 / Title 234 / Activities 704 / Links 1173.
// Title column flexes (1fr) so the table fills the available width on screens wider
// than the 1440 design, while Lesson, Activities, and Image columns keep their pixel
// widths. Title is floored at 470px (its design width) so the table never collapses
// below the intended layout; on narrower viewports the page is allowed to scroll
// horizontally (the design is desktop-first per PRD).
//
// IMPORTANT: these columns are kept in absolute pixels even though the rest of the
// UI is rem-based. When the type-scale slider grows the type, titles re-wrap inside
// the fixed columns instead of pushing the table sideways – that's the explicit
// "wrap" overflow behavior the design wants for this table.
const GRID_COLS = "234px minmax(560px, 1fr) 469px 203px";
const SUB_ROW_COLS = "234px minmax(560px, 1fr) 469px";

// Lessons are numbered cumulatively across the whole curriculum (L1–L14)
// so a reader scanning Section II sees L5/L6/… continuing from where
// Section I left off, instead of every section restarting at L1.
function lessonNumberOffset(sectionId: string): number {
  let offset = 0;
  for (const s of sections) {
    if (s.id === sectionId) return offset;
    offset += s.lessons.length;
  }
  return offset;
}

export function CurriculumTable({
  sectionId,
  lessons,
}: {
  sectionId: string;
  lessons: Lesson[];
}) {
  const offset = lessonNumberOffset(sectionId);
  const t = useTranslations("table");

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="grid items-start"
        style={{ gridTemplateColumns: GRID_COLS, rowGap: 0 }}
        role="table"
        aria-label={t("label")}
      >
        <div className="contents" role="row">
          <div role="columnheader">
            <span className={headerCell}>{t("lesson")}</span>
          </div>
          <div role="columnheader">
            <span className={headerCell}>{t("title")}</span>
          </div>
          <div role="columnheader">
            <span className={headerCell}>{t("activities")}</span>
          </div>
          {/* Flush with the left edge of the 203px column so the header
              starts where the thumbnails directly below it start (the
              images fill the column edge-to-edge). No inner span; the
              text styles sit on the columnheader cell itself. */}
          <div
            role="columnheader"
            className="text-[1.25rem] tracking-[-0.02em] leading-none"
          >
            {t("linksAndImages")}
          </div>
        </div>

        <div className="col-span-4 mt-[0.8125rem] border-t border-fg" />

        {lessons.map((lesson, i) => (
          <LessonRow
            key={lesson.id}
            sectionId={sectionId}
            lesson={lesson}
            lessonLabel={`L${offset + i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function LessonRow({
  sectionId,
  lesson,
  lessonLabel,
}: {
  sectionId: string;
  lesson: Lesson;
  lessonLabel: string;
}) {
  const lessonHref = `/${sectionId}/${lesson.id}`;
  const [anyHover, setAnyHover] = useState(false);
  const onEnter = useCallback(() => setAnyHover(true), []);
  const onLeave = useCallback(() => setAnyHover(false), []);

  return (
    <>
      {/* Activities content occupies columns 1–3 (Lesson, Title, Activities)
          of the outer grid. Because the inner SUB_ROW_COLS use the same
          widths (234 / 1fr / 469) as the outer first three columns, the
          inner activity lines line up exactly with the headers above. */}
      <div className="col-span-3 pt-[1.25rem] pb-[1.25rem]" role="row">
        <div
          className="flex flex-col gap-[1.25rem]"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          {lesson.activities.map((activity, i) => (
            <ActivityLine
              key={activity.id}
              sectionId={sectionId}
              lessonHref={lessonHref}
              lesson={lesson}
              lessonLabel={lessonLabel}
              activity={activity}
              isFirst={i === 0}
              lActive={anyHover}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail lives in the Links & Images column as a real grid cell, so
          the lesson row's height naturally expands to contain it instead of
          being absolutely positioned over the next row. Empty cell when the
          lesson has no thumbnail to keep grid auto-placement aligned. */}
      <div className="pt-[1.25rem] pb-[1.25rem]" role="cell">
        {lesson.thumbnail ? (
          <div className="w-[203px] aspect-[201/112]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lesson.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="col-span-4 border-b border-fg" />
    </>
  );
}

function ActivityLine({
  sectionId,
  lessonHref,
  lesson,
  lessonLabel,
  activity,
  isFirst,
  lActive,
}: {
  sectionId: string;
  lessonHref: string;
  lesson: Lesson;
  lessonLabel: string;
  activity: Activity;
  isFirst: boolean;
  lActive: boolean;
}) {
  const t = useTranslations("table");
  const [ltHover, setLtHover] = useState(false);
  const [actHover, setActHover] = useState(false);

  const ltActive = isFirst && (ltHover || lActive);

  const onLtEnter = isFirst ? () => setLtHover(true) : undefined;
  const onLtLeave = isFirst ? () => setLtHover(false) : undefined;

  const TYPE = "text-[1.25rem] tracking-[-0.02em] leading-[1.3]";
  const activityHref = `/${sectionId}/${lesson.id}/${activity.id}`;

  return (
    <div
      className="grid items-baseline text-fg"
      style={{ gridTemplateColumns: SUB_ROW_COLS }}
    >
      {/* L# — links to lesson overview */}
      <div onMouseEnter={onLtEnter} onMouseLeave={onLtLeave}>
        {isFirst ? (
          <Link href={lessonHref} tabIndex={-1} aria-hidden="true">
            <p
              className={`font-bold ${TYPE} inline-block px-[0.375rem] py-[0.125rem] transition-colors duration-100 ${
                lActive ? "bg-accent text-accent-fg" : ""
              }`}
            >
              {lessonLabel}
            </p>
          </Link>
        ) : null}
      </div>

      {/* Title — links to lesson overview */}
      <div onMouseEnter={onLtEnter} onMouseLeave={onLtLeave}>
        {isFirst ? (
          <Link
            href={lessonHref}
            aria-label={t("openLesson", { title: lesson.title })}
          >
            <p className={`${TYPE} py-[0.125rem] max-w-[528px]`}>
              <span
                className={`${ltActive ? "bg-accent text-accent-fg" : ""} px-[0.375rem] py-[0.125rem] transition-colors duration-100`}
                style={{
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                }}
              >
                {lesson.title}
              </span>
            </p>
          </Link>
        ) : null}
      </div>

      {/* Activity — links directly to the activity page.
          Uses a 2-col flex layout (A# label + title) so wrapped title lines
          hang-indent under the title's first line and the hover highlight
          hugs just the title text. The previous implementation used
          `text-indent: -2.25rem` on the wrapping <p>, which inherited into
          the inline-block A# label and rendered "A1" 36px to the left of
          its own box. */}
      <div
        onMouseEnter={() => setActHover(true)}
        onMouseLeave={() => setActHover(false)}
      >
        <Link
          href={activityHref}
          aria-label={t("activityAria", {
            label: activity.label,
            title: activity.title,
          })}
        >
          <div className="flex items-baseline gap-x-[0.75rem] max-w-[383px] ps-[0.375rem]">
            <span className={`${TYPE} shrink-0 w-[1.5rem] py-[0.125rem]`}>
              {activity.label}
            </span>
            <p className={`${TYPE} py-[0.125rem] min-w-0`}>
              <span
                className={`${actHover ? "bg-accent text-accent-fg" : ""} px-[0.375rem] py-[0.125rem] transition-colors duration-100`}
                style={{
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                }}
              >
                {activity.title}
              </span>
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
