import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  sections,
  loadSection,
  loadLesson,
  loadActivity,
  loadLessonNeighbors,
} from "@/data/curriculum";
import { routing } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { LessonHero } from "@/components/LessonHero";
import { LessonNav } from "@/components/LessonNav";
import { ActivityTabs } from "@/components/ActivityTabs";
import { ActivityBlock } from "@/components/ActivityBlock";

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
  const { locale, section, lesson, activity: activityId } = await params;
  const a = await loadActivity(section, lesson, activityId, locale);
  const l = await loadLesson(section, lesson, locale);
  const t = await getTranslations({ locale, namespace: "site" });
  if (!a || !l) return { title: t("title") };
  return {
    title: `${a.title} — ${l.title} — ${t("title")}`,
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

  const section = await loadSection(sectionId, locale);
  const lesson = await loadLesson(sectionId, lessonId, locale);
  const activity = await loadActivity(sectionId, lessonId, activityId, locale);
  if (!section || !lesson || !activity) return notFound();

  const { prev, next } = await loadLessonNeighbors(sectionId, lessonId, locale);

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar showBack backHref={`/${section.id}/${lesson.id}`} />

        <LessonHero
          title={lesson.title}
          image={lesson.heroImage}
          imageAlt={`${lesson.title} hero image`}
          sectionHref={`/${section.id}`}
          sectionLabel={section.title}
          lessonLabel={lesson.label}
        />

        <ActivityTabs
          sectionId={section.id}
          lessonId={lesson.id}
          activities={lesson.activities}
          activeActivityId={activity.id}
        />

        <ActivityBlock
          id={activity.id}
          pillLabel={activity.label}
          heading={activity.title}
          blocks={activity.blocks}
        />

        <LessonNav prev={prev} next={next} />
      </div>
    </div>
  );
}
