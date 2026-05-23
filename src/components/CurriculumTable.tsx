import Link from "next/link";
import type { Activity, Lesson } from "@/data/types";

const headerCell =
  "inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-[20px] tracking-[-0.4px] leading-none";

// PRD column offsets at 1440 design width: Lesson 0 / Title 234 / Activities 704 / Links 1173.
// Title column flexes (1fr) so the table fills the available width on screens wider
// than the 1440 design, while Lesson, Activities, and Image columns keep their pixel
// widths. Title is floored at 470px (its design width) so the table never collapses
// below the intended layout; on narrower viewports the page is allowed to scroll
// horizontally (the design is desktop-first per PRD).
const GRID_COLS = "234px minmax(470px, 1fr) 469px 203px";

// Sub-row grid for each activity line inside a lesson. Three columns matching the
// outer grid's first three (Lesson / Title / Activities). The Image column is left
// out so the hover bar never paints over the image or the right whitespace.
const SUB_ROW_COLS = "234px minmax(470px, 1fr) 469px";

export function CurriculumTable({
  sectionId,
  lessons,
}: {
  sectionId: string;
  lessons: Lesson[];
}) {
  return (
    <div className="w-full">
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

        <div className="col-span-4 mt-[13px] border-t border-fg" />

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
        {/* Image floats on the right side, vertically aligned with the first
            activity sub-row. It sits outside the hover system so the highlight
            bar never paints over the image. */}
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
          className="block pt-[33px] pb-[33px]"
          aria-label={`Open lesson ${lesson.label}: ${lesson.title}`}
        >
          {/* Reserve room for the image on the right (203px = image col width).
              Each activity becomes its own sub-row whose hover paints a single
              continuous accent bar across Lesson, Title, and Activities only. */}
          <div
            className="flex flex-col gap-[26px]"
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
  // The first activity line owns the lesson label and title cells, so hovering
  // anywhere on that line paints one continuous bar across Lesson / Title /
  // Activities. Subsequent lines (A2, A3, ...) have no lesson or title content,
  // so the bar only covers the activity column itself — starting at A# and
  // running through the right edge of the column.
  if (isFirst) {
    return (
      <div
        className="grid items-start text-fg hover:bg-accent hover:text-black transition-colors duration-100"
        style={{ gridTemplateColumns: SUB_ROW_COLS }}
      >
        <div className="self-stretch">
          <p className="font-bold text-[20px] tracking-[-0.4px] leading-none">
            {lesson.label}
          </p>
        </div>
        <div className="self-stretch">
          <div className="w-[438px] max-w-full">
            <p className="text-[20px] tracking-[-0.4px] leading-[1.4]">
              {lesson.title}
            </p>
          </div>
        </div>
        <div className="self-stretch">
          <ActivityCell activity={activity} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid items-start"
      style={{ gridTemplateColumns: SUB_ROW_COLS }}
    >
      <div className="self-stretch" aria-hidden="true" />
      <div className="self-stretch" aria-hidden="true" />
      <div className="self-stretch text-fg hover:bg-accent hover:text-black transition-colors duration-100">
        <ActivityCell activity={activity} />
      </div>
    </div>
  );
}

function ActivityCell({ activity }: { activity: Activity }) {
  return (
    <div className="flex gap-[36px] items-start w-[383px] max-w-full">
      <p className="text-[20px] tracking-[-0.4px] leading-none w-[24px] shrink-0">
        {activity.label}
      </p>
      <p className="text-[20px] tracking-[-0.4px] leading-[1.3]">
        {activity.title}
      </p>
    </div>
  );
}
