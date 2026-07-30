import { setRequestLocale, getTranslations } from "next-intl/server";
import { Toolbar } from "@/components/Toolbar";
import { SectionTabs } from "@/components/SectionTabs";
import { IntroAccordion } from "@/components/IntroAccordion";
import { loadLesson } from "@/data/curriculum";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appendix" });
  return { title: t("metaTitle") };
}

export default async function AppendixPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("appendix");
  const site = await getTranslations("site");

  const groundingActivities = await loadLesson(
    "appendix",
    "grounding-activities",
    locale
  );
  const afterCare = await loadLesson("appendix", "after-care", locale);

  const resources = [
    {
      href: "/appendix/ice-breakers",
      label: t("iceBreakersLink"),
      description: t("iceBreakersDescription"),
    },
    groundingActivities
      ? {
          href: `/appendix/${groundingActivities.id}`,
          label: groundingActivities.title,
          description: t("groundingActivitiesDescription"),
        }
      : null,
    afterCare
      ? {
          href: `/appendix/${afterCare.id}`,
          label: afterCare.title,
          description: t("afterCareDescription"),
        }
      : null,
    {
      href: "/appendix/references",
      label: t("referencesLink"),
      description: t("referencesDescription"),
    },
  ].filter((r): r is { href: string; label: string; description: string } => r !== null);

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />

        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {site("title")}
        </h1>

        <SectionTabs activeId="appendix" locale={locale} />

        <section className="flex flex-col gap-[1.5rem]">
          <h2 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg">
            {t("resourcesHeading")}
          </h2>
          <p className="text-[1.5rem] leading-[1.3] tracking-[-0.02em] opacity-70 max-w-[79rem]">
            {t("resourcesIntro")}
          </p>

          <IntroAccordion items={resources} />
        </section>
      </div>
    </div>
  );
}
