"use client";

import Link from "next/link";
import { useState } from "react";
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
          >
            {lesson.activities.map((activity, i) => (
              <ActivityLine
                key={activity.id}
                lesson={lesson}
                activity={activity}
                isFirst={i === 0}
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
}: {
  lesson: Lesson;
  activity: Activity;
  isFirst: boolean;
}) {
  // Two independent hover groups per sub-row:
  //   • LT  – Lesson + Title cells light up together as one continuous bar.
  //   • ACT – Activity cell lights up on its own as one continuous bar.
  // Hovering one group never lights up the other, so you only ever see
  // *either* the lesson/title bar *or* the activity bar – never both.
  const [ltHover, setLtHover] = useState(false);
  const [actHover, setActHover] = useState(false);

  const ltActive = isFirst && ltHover;
  // `px-[0.375rem] py-[0.125rem]` gives the bar a small breathing room around
  // the type so the highlight reads as a clean rectangle rather than
  // tight-cropped to letterforms; rem-based so it scales with type.
  const ltHoverClass = ltActive
    ? "bg-accent text-black px-[0.375rem] py-[0.125rem]"
    : "px-[0.375rem] py-[0.125rem]";
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
      {/* Lesson cell. On LT hover the bar fills the entire column so it
          touches the right edge — that lets it visually connect to the
          adjacent Title-cell bar with no gap, producing one continuous
          highlight across the two columns. */}
      <div
        onMouseEnter={onLtEnter}
        onMouseLeave={onLtLeave}
      >
        {isFirst ? (
          <p
            className={`font-bold ${TYPE} block ${ltHoverClass} transition-colors duration-100`}
          >
            {lesson.label}
          </p>
        ) : null}
      </div>

      {/* Title cell. Same vertical padding on the <p> as the L# cell so the
          line box sits at the same y-position; the inner <span> gets the
          actual hover bar so the highlight hugs the title text instead of
          spanning the whole column. box-decoration-break: clone keeps each
          wrapped line a clean rectangle. */}
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

      {/* Activity cell. Its own hover group, painted as one continuous bar
          that runs from A# through the gap to the end of the activity title. */}
      <div
        onMouseEnter={() => setActHover(true)}
        onMouseLeave={() => setActHover(false)}
      >
        <div
          className={`inline-flex gap-[2.25rem] items-baseline max-w-[383px] ${actHoverClass} transition-colors duration-100`}
        >
          <p className={`${TYPE} w-[1.5rem] shrink-0`}>{activity.label}</p>
          <p className={TYPE}>{activity.title}</p>
        </div>
      </div>
    </div>
  );
}
