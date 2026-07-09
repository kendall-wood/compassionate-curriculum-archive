import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  sections,
  loadSection,
  loadLesson,
  loadLessonNeighbors,
  buildGlobalLessonIndex,
} from "@/data/curriculum";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { LessonHero } from "@/components/LessonHero";
import { LessonNav } from "@/components/LessonNav";
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

  const [{ prev, next }, globalMap] = await Promise.all([
    loadLessonNeighbors(sectionId, lessonId, locale),
    buildGlobalLessonIndex(locale),
  ]);
  const globalIndex = globalMap.get(`${sectionId}/${lessonId}`) ?? 0;
  const prevNav = prev
    ? {
        href: `/${prev.sectionId}/${prev.lessonId}`,
        label: `L${globalMap.get(`${prev.sectionId}/${prev.lessonId}`) ?? ""}`,
        title: prev.title,
      }
    : undefined;
  const nextNav = next
    ? {
        href: `/${next.sectionId}/${next.lessonId}`,
        label: `L${globalMap.get(`${next.sectionId}/${next.lessonId}`) ?? ""}`,
        title: next.title,
      }
    : undefined;

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar showBack backHref={`/${section.id}`} />

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
        />

        <FacilitatorBlock blocks={lesson.facilitatorBlocks} />

        <LessonNav prev={prevNav} next={nextNav} />
      </div>
    </div>
  );
}
