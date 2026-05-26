"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import type { Activity, Lesson } from "@/data/types";

const headerCell =
  "text-[1.25rem] tracking-[-0.02em] leading-none pl-[0.375rem]";

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
          <div role="columnheader">
            <span className={headerCell}>Lesson</span>
          </div>
          <div role="columnheader">
            <span className={headerCell}>Title</span>
          </div>
          <div role="columnheader">
            <span className={headerCell}>Activities</span>
          </div>
          <div role="columnheader">
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
  const lessonHref = `/${sectionId}/${lesson.id}`;
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

        {/* No outer link — L#/title and each activity have their own links */}
        <div
          className="pt-[1.25rem] pb-[1.25rem]"
        >
          <div
            className="flex flex-col gap-[1.25rem]"
            style={{ paddingRight: "203px" }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {lesson.activities.map((activity, i) => (
              <ActivityLine
                key={activity.id}
                sectionId={sectionId}
                lessonHref={lessonHref}
                lesson={lesson}
                activity={activity}
                isFirst={i === 0}
                lActive={anyHover}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-4 border-b border-fg" />
    </>
  );
}

function ActivityLine({
  sectionId,
  lessonHref,
  lesson,
  activity,
  isFirst,
  lActive,
}: {
  sectionId: string;
  lessonHref: string;
  lesson: Lesson;
  activity: Activity;
  isFirst: boolean;
  lActive: boolean;
}) {
  const [ltHover, setLtHover] = useState(false);
  const [actHover, setActHover] = useState(false);

  const ltActive = isFirst && (ltHover || lActive);
  const actHoverClass = actHover
    ? "bg-accent text-accent-fg px-[0.375rem] py-[0.125rem]"
    : "px-[0.375rem] py-[0.125rem]";

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
              {lesson.label}
            </p>
          </Link>
        ) : null}
      </div>

      {/* Title — links to lesson overview */}
      <div onMouseEnter={onLtEnter} onMouseLeave={onLtLeave}>
        {isFirst ? (
          <Link href={lessonHref} aria-label={`Open lesson: ${lesson.title}`}>
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

      {/* Activity — links directly to the activity page */}
      <div
        onMouseEnter={() => setActHover(true)}
        onMouseLeave={() => setActHover(false)}
      >
        <Link href={activityHref} aria-label={`${activity.label}: ${activity.title}`}>
          <p
            className={`${TYPE} py-[0.125rem] max-w-[383px]`}
            style={{ paddingLeft: "2.25rem", textIndent: "-2.25rem" }}
          >
            <span
              className={`inline ${actHoverClass} transition-colors duration-100`}
              style={{
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              <span className="inline-block w-[1.5rem] mr-[0.75rem]">{activity.label}</span>{activity.title}
            </span>
          </p>
        </Link>
      </div>
    </div>
  );
}
