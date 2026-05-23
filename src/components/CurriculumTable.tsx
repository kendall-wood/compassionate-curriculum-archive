"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import type { Activity, Lesson } from "@/data/types";

const headerCell =
  "inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-[1.25rem] tracking-[-0.02em] leading-none";

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
const GRID_COLS = "234px minmax(470px, 1fr) 469px 203px";
const SUB_ROW_COLS = "234px minmax(470px, 1fr) 469px";

export function CurriculumTable({
  sectionId,
  lessons,
}: {
  sectionId: string;
  lessons: Lesson[];
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div
        className="grid items-start"
        style={{ gridTemplateColumns: GRID_COLS, rowGap: 0 }}
        role="table"
        aria-label="Curriculum"
      >
        <div className="contents" role="row">
          <div className="flex justify-start" role="columnheader">
            <span className={headerCell}>Lesson</span>
          </div>
          <div className="flex justify-start" role="columnheader">
            <span className={headerCell}>Title</span>
          </div>
          <div className="flex justify-start" role="columnheader">
            <span className={headerCell}>Activities</span>
          </div>
          <div className="flex justify-start" role="columnheader">
            <span className={headerCell}>Links &amp; Images</span>
          </div>
        </div>

        <div className="col-span-4 mt-[0.8125rem] border-t border-fg" />

        {lessons.map((lesson) => (
          <LessonRow key={lesson.id} sectionId={sectionId} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}

function LessonRow({ sectionId, lesson }: { sectionId: string; lesson: Lesson }) {
  const href = `/${sectionId}/${lesson.id}`;
  // anyHover = true whenever the cursor is anywhere over this lesson's rows.
  // Passed down so L# lights up regardless of which activity row is hovered.
  const [anyHover, setAnyHover] = useState(false);
  const onEnter = useCallback(() => setAnyHover(true), []);
  const onLeave = useCallback(() => setAnyHover(false), []);

  return (
    <>
      <div className="col-span-4 relative" role="row">
        {lesson.thumbnail ? (
          <div className="absolute right-0 top-[33px] w-[201px] h-[112px] pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lesson.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        <Link
          href={href}
          className="block pt-[2.0625rem] pb-[2.0625rem]"
          aria-label={`Open lesson ${lesson.label}: ${lesson.title}`}
        >
          <div
            className="flex flex-col gap-[1.625rem]"
            style={{ paddingRight: "203px" }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {lesson.activities.map((activity, i) => (
              <ActivityLine
                key={activity.id}
                lesson={lesson}
                activity={activity}
                isFirst={i === 0}
                lActive={anyHover}
              />
            ))}
          </div>
        </Link>
      </div>
      <div className="col-span-4 border-b border-fg" />
    </>
  );
}

function ActivityLine({
  lesson,
  activity,
  isFirst,
  lActive,
}: {
  lesson: Lesson;
  activity: Activity;
  isFirst: boolean;
  lActive: boolean; // lifted from LessonRow: true when any row in this lesson is hovered
}) {
  // ltHover  = cursor is over the Lesson or Title cell (title highlight)
  // actHover = cursor is over the Activity cell (activity highlight)
  const [ltHover, setLtHover] = useState(false);
  const [actHover, setActHover] = useState(false);

  const ltActive = isFirst && ltHover;
  const actHoverClass = actHover
    ? "bg-accent text-black px-[0.375rem] py-[0.125rem]"
    : "px-[0.375rem] py-[0.125rem]";

  const onLtEnter = isFirst ? () => setLtHover(true) : undefined;
  const onLtLeave = isFirst ? () => setLtHover(false) : undefined;

  // Shared type styles for L#, title, A#, and activity title — same font
  // size, tracking and line-height so all four pieces of type sit on the
  // exact same baseline inside the row.
  const TYPE = "text-[1.25rem] tracking-[-0.02em] leading-[1.3]";

  return (
    // `items-baseline` on the grid locks the L#, Title, A# and first line of
    // the activity title to the same text baseline regardless of the cell's
    // box height; each cell still gets its own bar via `self-start`-style
    // padding below.
    <div
      className="grid items-baseline text-fg"
      style={{ gridTemplateColumns: SUB_ROW_COLS }}
    >
      {/* Lesson cell — inline-block so the highlight hugs only the L# text,
          not the full 234 px column. Lights up whenever the cursor is over
          either the title cell or the activity cell. */}
      <div
        onMouseEnter={onLtEnter}
        onMouseLeave={onLtLeave}
      >
        {isFirst ? (
          <p
            className={`font-bold ${TYPE} inline-block px-[0.375rem] py-[0.125rem] transition-colors duration-100 ${
              lActive ? "bg-accent text-black" : ""
            }`}
          >
            {lesson.label}
          </p>
        ) : null}
      </div>

      {/* Title cell — span gets full px padding (same as activity) so the
          highlight rectangle has the same breathing room on both sides. */}
      <div
        onMouseEnter={onLtEnter}
        onMouseLeave={onLtLeave}
      >
        {isFirst ? (
          <p className={`${TYPE} py-[0.125rem] max-w-[438px]`}>
            <span
              className={`${ltActive ? "bg-accent text-black" : ""} px-[0.375rem] py-[0.125rem] transition-colors duration-100`}
              style={{
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              {lesson.title}
            </span>
          </p>
        ) : null}
      </div>

      {/* Activity cell — inline-flex span so the highlight hugs only the
          A# + title text (content-width), not the full column width. */}
      <div
        onMouseEnter={() => setActHover(true)}
        onMouseLeave={() => setActHover(false)}
      >
        <p className={`${TYPE} py-[0.125rem] max-w-[383px]`}>
          <span
            className={`inline-flex gap-[2.25rem] items-baseline ${actHoverClass} transition-colors duration-100`}
            style={{
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            <span className="w-[1.5rem] shrink-0">{activity.label}</span>
            <span>{activity.title}</span>
          </span>
        </p>
      </div>
    </div>
  );
}
