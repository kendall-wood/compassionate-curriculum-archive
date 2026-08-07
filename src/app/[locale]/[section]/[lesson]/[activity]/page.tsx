import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  loadSectionsWithAppendix,
  loadSection,
  loadLesson,
  loadActivity,
  loadLessonNeighbors,
  buildGlobalLessonIndex,
} from "@/data/curriculum";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { LessonHero } from "@/components/LessonHero";
import { LessonNav, type NavItem } from "@/components/LessonNav";
import { ActivityTabs } from "@/components/ActivityTabs";
import { ActivityBlock } from "@/components/ActivityBlock";

export async function generateStaticParams() {
  const sectionsWithAppendix = await loadSectionsWithAppendix();
  return routing.locales.flatMap((locale) =>
    sectionsWithAppendix.flatMap((s) =>
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

  const [{ next: nextLesson }, globalMap] = await Promise.all([
    loadLessonNeighbors(sectionId, lessonId, locale),
    buildGlobalLessonIndex(locale),
  ]);

  const globalIndex = globalMap.get(`${sectionId}/${lessonId}`) ?? 0;
  const activityIndex = lesson.activities.findIndex((a) => a.id === activityId);
  const prevActivity = lesson.activities[activityIndex - 1];
  const nextActivity = lesson.activities[activityIndex + 1];

  const prevNav: NavItem | undefined = prevActivity
    ? {
        href: `/${sectionId}/${lessonId}/${prevActivity.id}`,
        label: prevActivity.label,
        title: prevActivity.title,
      }
    : undefined;

  const nextNav: NavItem | undefined = nextActivity
    ? {
        href: `/${sectionId}/${lessonId}/${nextActivity.id}`,
        label: nextActivity.label,
        title: nextActivity.title,
      }
    : nextLesson
    ? {
        href: `/${nextLesson.sectionId}/${nextLesson.lessonId}`,
        label: `L${globalMap.get(`${nextLesson.sectionId}/${nextLesson.lessonId}`) ?? ""}`,
        title: nextLesson.title,
      }
    : undefined;

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar showBack backHref={`/${section.id}/${lesson.id}`} />

        <LessonHero
          title={lesson.title}
          image={lesson.heroImage}
          imageAlt={`${lesson.title} hero image`}
        />

        <p className="text-[1.25rem] tracking-[-0.02em] leading-none text-fg">
          <Link href={`/${section.id}`} className="hover:text-accent transition-colors">
            / {section.title}
          </Link>
          <span className="opacity-70"> / L{globalIndex}</span>
        </p>

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

        <LessonNav prev={prevNav} next={nextNav} />
      </div>
    </div>
  );
}
