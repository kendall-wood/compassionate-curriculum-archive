import { setRequestLocale, getTranslations } from "next-intl/server";
import { Toolbar } from "@/components/Toolbar";
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

  const TYPE = "text-[1.25rem] tracking-[-0.02em] leading-[1.3]";

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />
        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {t("heading")}
        </h1>

        <section className="flex flex-col gap-[1.5rem]">
          <h2 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg">
            {t("iceBreakersHeading")}
          </h2>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg">
            {ICE_BREAKERS_INTRO}
          </p>

          <div className="w-full overflow-x-auto">
            <div style={{ minWidth: "640px" }}>
              {/* Header */}
              <div
                className="grid"
                style={{ gridTemplateColumns: "234px 1fr" }}
              >
                <span className={`${TYPE} ps-[0.375rem] leading-none`}>
                  {t("numberCol")}
                </span>
                <span className={`${TYPE} ps-[0.375rem] leading-none`}>
                  {t("iceBreakersHeading")}
                </span>
              </div>

              <div className="mt-[0.8125rem] border-t border-fg" />

              {ICE_BREAKERS.map((ib, i) => (
                <div key={i}>
                  <div
                    className="grid py-[1.25rem] transition-colors duration-100 hover:bg-accent hover:text-accent-fg"
                    style={{ gridTemplateColumns: "234px 1fr" }}
                  >
                    <span className={`${TYPE} font-bold ps-[0.375rem]`}>
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-[0.75rem] ps-[0.375rem]">
                      <p className={`${TYPE} font-bold`}>{ib.title}</p>
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
