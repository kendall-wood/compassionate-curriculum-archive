import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { sections, loadSection } from "@/data/curriculum";
import { routing } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { SectionTabs } from "@/components/SectionTabs";
import { CurriculumTable } from "@/components/CurriculumTable";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    sections.map((s) => ({ locale, section: s.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section: sectionId } = await params;
  const section = await loadSection(sectionId, locale);
  if (!section) return { title: "Compassionate Curriculum Archive" };
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: `${section.label} — ${t("title")}`,
    description: section.overview,
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section: sectionId } = await params;
  setRequestLocale(locale);

  const section = await loadSection(sectionId, locale);
  if (!section) return notFound();

  const t = await getTranslations("section");
  const site = await getTranslations("site");

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />

        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {site("title")}
        </h1>

        <SectionTabs activeId={section.id} locale={locale} />

        <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] leading-[1.2] text-fg">
          {t("introduction")}
        </h2>

        <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal max-w-[79rem]">
          {section.overview}
        </p>

        <div className="flex flex-col gap-[3rem] w-full">
          <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] leading-[1.2] text-fg">
            {t("curriculum")}
          </h2>
          <CurriculumTable sectionId={section.id} lessons={section.lessons} />
        </div>
      </div>
    </div>
  );
}
