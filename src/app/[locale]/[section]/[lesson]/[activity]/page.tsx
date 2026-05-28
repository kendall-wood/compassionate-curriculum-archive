import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { sections, getSection, getLesson, getActivity } from "@/data/curriculum";
import { Link, routing } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { ActivityTabs } from "@/components/ActivityTabs";
import {
  ActivityBlock,
  ActivityWithImage,
} from "@/components/ActivityBlock";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    sections.flatMap((s) =>
      s.lessons.flatMap((l) =>
        l.activities.map((a) => ({
          locale,
          section: s.id,
          lesson: l.id,
          activity: a.id,
        }))
      )
    )
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
    section: string;
    lesson: string;
    activity: string;
  }>;
}) {
  const { section, lesson, activity: activityId } = await params;
  const a = getActivity(section, lesson, activityId);
  const l = getLesson(section, lesson);
  if (!a || !l)
    return { title: "Activity — Compassionate Curriculum Archive" };
  return {
    title: `${a.title} — ${l.title} — Compassionate Curriculum Archive`,
  };
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{
    locale: string;
    section: string;
    lesson: string;
    activity: string;
  }>;
}) {
  const { locale, section: sectionId, lesson: lessonId, activity: activityId } =
    await params;
  setRequestLocale(locale);

  const section = getSection(sectionId);
  const lesson = getLesson(sectionId, lessonId);
  const activity = getActivity(sectionId, lessonId, activityId);
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
              / {section.title}
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
