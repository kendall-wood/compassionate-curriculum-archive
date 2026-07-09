import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { SectionTabs } from "@/components/SectionTabs";

const sectionPill =
  "inline-flex items-baseline gap-[0.375rem] px-[0.625rem] py-[0.25rem] border border-fg text-fg hover:bg-accent hover:text-accent-fg transition-colors align-baseline text-[1.875rem] leading-snug";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "intro" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function IntroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("intro");
  const site = await getTranslations("site");

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />

        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {site("title")}
        </h1>

        <SectionTabs activeId="intro" locale={locale} />

        <div className="flex flex-col gap-[1.5rem]">
          <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] leading-[1.2] text-fg">
            {t("heading")}
          </h2>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            {t("p1")}
          </p>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            {t("p2")}
          </p>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            {t("p3Intro")}{" "}
            <Link href="/beloved-community" className={sectionPill}>
              {t("p3PillBeloved")} <span aria-hidden="true">↗</span>
            </Link>{" "}
            {t("p3MidBeloved")}{" "}
            <Link href="/restorative-practices" className={sectionPill}>
              {t("p3PillRestorative")} <span aria-hidden="true">↗</span>
            </Link>{" "}
            {t("p3MidRestorative")}{" "}
            <Link href="/media-narrative-futuring" className={sectionPill}>
              {t("p3PillMedia")} <span aria-hidden="true">↗</span>
            </Link>{" "}
            {t("p3MidMedia")}
          </p>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            {t("p4")}
          </p>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            {t("p5")}
          </p>
        </div>
      </div>
    </div>
  );
}
