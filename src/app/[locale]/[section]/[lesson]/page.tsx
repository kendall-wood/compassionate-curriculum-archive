import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { sections, loadSection, loadLesson } from "@/data/curriculum";
import { routing } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { LessonHero } from "@/components/LessonHero";
import { ActivityTabs } from "@/components/ActivityTabs";
import { FacilitatorBlock } from "@/components/ActivityBlock";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    sections.flatMap((s) =>
      s.lessons.map((l) => ({ locale, section: s.id, lesson: l.id }))
    )
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; section: string; lesson: string }>;
}) {
  const { locale, section, lesson: lessonId } = await params;
  const lesson = await loadLesson(section, lessonId, locale);
  const t = await getTranslations({ locale, namespace: "site" });
  if (!lesson) return { title: t("title") };
  return {
    title: `${lesson.title} — ${t("title")}`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; section: string; lesson: string }>;
}) {
  const { locale, section: sectionId, lesson: lessonId } = await params;
  setRequestLocale(locale);

  const section = await loadSection(sectionId, locale);
  const lesson = await loadLesson(sectionId, lessonId, locale);
  if (!section || !lesson) return notFound();

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar showBack backHref={`/${section.id}`} />

        <LessonHero
          title={lesson.title}
          image={lesson.heroImage}
          imageAlt={`${lesson.title} hero image`}
          sectionHref={`/${section.id}`}
          sectionLabel={section.title}
        />

        <ActivityTabs
          sectionId={section.id}
          lessonId={lesson.id}
          activities={lesson.activities}
        />

        <FacilitatorBlock blocks={lesson.facilitatorBlocks} />
      </div>
    </div>
  );
}
