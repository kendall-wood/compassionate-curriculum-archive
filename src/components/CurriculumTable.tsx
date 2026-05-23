import Link from "next/link";
import type { Lesson } from "@/data/types";

const headerCell =
  "inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-[20px] tracking-[-0.4px] leading-none";

const GRID_COLS = "234px 470px 469px 203px";

export function CurriculumTable({
  sectionId,
  lessons,
}: {
  sectionId: string;
  lessons: Lesson[];
}) {
  return (
    <div className="w-full max-w-[1376px]">
      <div
        className="grid items-start"
        style={{
          gridTemplateColumns: GRID_COLS,
          rowGap: 0,
        }}
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
          className="grid items-start hover:[&_p]:underline pt-[33px] pb-[33px]"
          style={{ gridTemplateColumns: GRID_COLS }}
          aria-label={`Open lesson ${lesson.label}: ${lesson.title}`}
        >
          <p className="font-bold text-[20px] tracking-[-0.4px] leading-none text-fg">
            {lesson.label}
          </p>

          <div className="pr-4 w-[438px]">
            <p className="text-[20px] tracking-[-0.4px] leading-[1.4] text-fg">
              {lesson.title}
            </p>
          </div>

          <div className="flex flex-col gap-[26px] w-[383px]">
            {lesson.activities.map((a) => (
              <div key={a.id} className="flex gap-[36px] items-start">
                <p className="text-[20px] tracking-[-0.4px] leading-none text-fg w-[24px] shrink-0">
                  {a.label}
                </p>
                <p className="text-[20px] tracking-[-0.4px] leading-[1.3] text-fg">
                  {a.title}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-start">
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
