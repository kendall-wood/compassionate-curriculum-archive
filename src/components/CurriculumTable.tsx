import Link from "next/link";
import type { Lesson } from "@/data/types";

const headerCell =
  "inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-[20px] tracking-[-0.4px] leading-none";

// PRD column offsets at 1440 design width: Lesson 0 / Title 234 / Activities 704 / Links 1173.
// Title column flexes upward (1fr) so the table fills the available width on screens
// wider than the 1440px design, while Lesson / Activities / Image columns keep their
// pixel widths. Title is floored at its design width (470px) so the table never
// collapses below the intended layout; on narrower viewports the page is allowed to
// scroll horizontally (the design is desktop-first per PRD).
const GRID_COLS = "234px minmax(470px, 1fr) 469px 203px";

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
      <div className="col-span-4" role="row">
        <Link
          href={href}
          className="group grid items-start pt-[33px] pb-[33px]"
          style={{ gridTemplateColumns: GRID_COLS }}
          aria-label={`Open lesson ${lesson.label}: ${lesson.title}`}
        >
          {/* Type columns (Lesson + Title + Activities) share one continuous accent bar
              on hover. The Links & Images column is intentionally left out so the
              highlight does not extend into the image / right-side whitespace. */}
          <TypeCell>
            <p className="font-bold text-[20px] tracking-[-0.4px] leading-none">
              {lesson.label}
            </p>
          </TypeCell>

          <TypeCell>
            <div className="w-[438px] max-w-full">
              <p className="text-[20px] tracking-[-0.4px] leading-[1.4]">
                {lesson.title}
              </p>
            </div>
          </TypeCell>

          <TypeCell>
            <div className="flex flex-col gap-[26px] w-[383px] max-w-full">
              {lesson.activities.map((a) => (
                <div key={a.id} className="flex gap-[36px] items-start">
                  <p className="text-[20px] tracking-[-0.4px] leading-none w-[24px] shrink-0">
                    {a.label}
                  </p>
                  <p className="text-[20px] tracking-[-0.4px] leading-[1.3]">
                    {a.title}
                  </p>
                </div>
              ))}
            </div>
          </TypeCell>

          <div className="self-stretch flex items-start">
            {lesson.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lesson.thumbnail}
                alt=""
                className="w-[201px] h-[112px] object-cover"
              />
            ) : (
              <span className="w-[201px] h-[112px] block" aria-hidden="true" />
            )}
          </div>
        </Link>
      </div>
      <div className="col-span-4 border-b border-fg" />
    </>
  );
}

/**
 * A type column inside a row link. Each type cell paints the accent color when its
 * parent <Link> is hovered. Because the three type cells sit edge-to-edge in the grid
 * and each fills its column (`self-stretch` + `w-full`), the result is one continuous
 * bar that runs from the left edge of "Lesson" through the right edge of "Activities"
 * and then stops, leaving the Links & Images column and the page margin untouched.
 */
function TypeCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-fg self-stretch w-full flex items-start group-hover:bg-accent group-hover:text-black transition-colors duration-100">
      {children}
    </div>
  );
}
