import Link from "next/link";
import { notFound } from "next/navigation";
import { sections, getSection, getLesson, getActivity } from "@/data/curriculum";
import { Toolbar } from "@/components/Toolbar";
import { ActivityTabs } from "@/components/ActivityTabs";
import {
  ActivityBlock,
  ActivityWithImage,
} from "@/components/ActivityBlock";

export function generateStaticParams() {
  return sections.flatMap((s) =>
    s.lessons.flatMap((l) =>
      l.activities.map((a) => ({
        section: s.id,
        lesson: l.id,
        activity: a.id,
      }))
    )
  );
}

export function generateMetadata({
  params,
}: {
  params: { section: string; lesson: string; activity: string };
}) {
  const activity = getActivity(params.section, params.lesson, params.activity);
  const lesson = getLesson(params.section, params.lesson);
  if (!activity || !lesson)
    return { title: "Activity — Compassionate Curriculum Archive" };
  return {
    title: `${activity.title} — ${lesson.title} — Compassionate Curriculum Archive`,
  };
}

export default function ActivityPage({
  params,
}: {
  params: { section: string; lesson: string; activity: string };
}) {
  const section = getSection(params.section);
  const lesson = getLesson(params.section, params.lesson);
  const activity = getActivity(params.section, params.lesson, params.activity);
  if (!section || !lesson || !activity) return notFound();

  const hasImage = activity.blocks.some((b) => b.kind === "image");
  const Block = hasImage ? ActivityWithImage : ActivityBlock;

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar showBack backHref={`/${section.id}/${lesson.id}`} />

        <div className="flex flex-col gap-[1.5rem]">
          <p className="text-[1.25rem] tracking-[-0.02em] leading-none text-fg">
            <Link href={`/${section.id}`} className="hover:text-accent transition-colors">
              /{section.title}
            </Link>
          </p>
          <h1 className="text-[5.375rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
            {lesson.title}
          </h1>
        </div>

        <ActivityTabs
          sectionId={section.id}
          lessonId={lesson.id}
          activities={lesson.activities}
          activeActivityId={activity.id}
        />

        <Block
          id={activity.id}
          pillLabel={activity.label}
          heading={activity.title}
          blocks={activity.blocks}
        />
      </div>
    </div>
  );
}
