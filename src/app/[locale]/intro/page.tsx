import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { SectionTabs } from "@/components/SectionTabs";
import { loadAllSections } from "@/data/curriculum";

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

const listItem =
  "flex items-center justify-between px-[0.625rem] py-[1rem] border-t border-fg text-fg text-[2rem] leading-[1.25] tracking-[-0.02em] hover:bg-accent hover:text-accent-fg transition-colors";

export default async function IntroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("intro");
  const site = await getTranslations("site");
  const appendixT = await getTranslations("appendix");
  const sections = await loadAllSections(locale);

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

          <nav aria-label="Curriculum sections" className="flex flex-col border-b border-fg w-full">
            {sections.map((s) => (
              <Link key={s.id} href={`/${s.id}`} className={listItem}>
                <span>{s.label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
            <Link href="/appendix" className={listItem}>
              <span>{appendixT("heading")}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </nav>

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
