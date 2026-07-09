import type { Lesson } from "@/data/types";

// Print mirror of CurriculumTable.tsx: the same 4-column layout
// (Lesson / Title / Activities / Links & Images) with hairline rules.
// Column widths reproduce the web's 234 / 1fr / 469 / 203 proportions at
// print scale (see --cc-col-* in book.css). Lessons are numbered
// cumulatively across the curriculum (L1–L14), exactly like the site.

export type TableHeaders = {
  lesson: string;
  title: string;
  activities: string;
  linksAndImages: string;
};

export function PrintCurriculumTable({
  lessons,
  offset,
  headers,
}: {
  lessons: Lesson[];
  offset: number;
  headers: TableHeaders;
}) {
  return (
    <div className="cc-table">
      <div className="cc-table-header">
        <span>{headers.lesson}</span>
        <span>{headers.title}</span>
        <span>{headers.activities}</span>
        <span className="cc-table-header-img">{headers.linksAndImages}</span>
      </div>

      {lessons.map((lesson, i) => (
        <div key={lesson.id} className="cc-table-row">
          <div className="cc-table-main">
            {lesson.activities.map((activity, j) => (
              <div key={activity.id} className="cc-table-line">
                <span className="cc-table-lnum">
                  {j === 0 ? `L${offset + i + 1}` : ""}
                </span>
                <span className="cc-table-title">
                  {j === 0 ? lesson.title : ""}
                </span>
                <span className="cc-table-activity">
                  <span className="cc-table-alabel">{activity.label}</span>
                  <span>{activity.title}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="cc-table-thumb">
            {lesson.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lesson.thumbnail} alt="" />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
