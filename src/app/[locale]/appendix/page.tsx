import { setRequestLocale, getTranslations } from "next-intl/server";
import { Toolbar } from "@/components/Toolbar";
import { SectionTabs } from "@/components/SectionTabs";
import { ICE_BREAKERS, ICE_BREAKERS_INTRO } from "@/data/appendix";

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

  const TYPE = "text-[1.25rem] tracking-[-0.02em] leading-[1.3]";
  // # column matches CurriculumTable; directions wide to hold paragraph-length content
  const COLS = "234px minmax(300px, 1fr) 750px";

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
            {t("iceBreakersHeading")}
          </h2>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg">
            {ICE_BREAKERS_INTRO}
          </p>

          <div className="w-full overflow-x-auto">
            <div>
              {/* Header */}
              <div className="grid" style={{ gridTemplateColumns: COLS }}>
                <span className={`${TYPE} ps-[0.375rem] leading-none`}>
                  {t("numberCol")}
                </span>
                <span className={`${TYPE} ps-[0.375rem] leading-none`}>
                  {t("titleCol")}
                </span>
                <span className={`${TYPE} ps-[0.375rem] leading-none`}>
                  {t("directionsCol")}
                </span>
              </div>

              <div className="mt-[0.8125rem] border-t border-fg" />

              {ICE_BREAKERS.map((ib, i) => (
                <div key={i}>
                  <div
                    className="grid py-[1.25rem] transition-colors duration-100 hover:bg-accent hover:text-accent-fg"
                    style={{ gridTemplateColumns: COLS }}
                  >
                    <span className={`${TYPE} font-bold ps-[0.375rem]`}>
                      {i + 1}
                    </span>
                    <p className={`${TYPE} font-bold ps-[0.375rem]`}>
                      {ib.title}
                    </p>
                    <div className="flex flex-col gap-[0.75rem] ps-[0.375rem]">
                      {ib.blocks.map((b, j) => (
                        <p key={j} className={`${TYPE} leading-[1.4]`}>
                          {b.heading ? (
                            <span className="font-bold">{b.heading}: </span>
                          ) : null}
                          {b.text}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="border-b border-fg" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
