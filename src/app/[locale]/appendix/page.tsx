import { Fragment } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Toolbar } from "@/components/Toolbar";
import { ICE_BREAKERS, ICE_BREAKERS_INTRO } from "@/data/appendix";

const ICE_BREAKER_COLS = "96px minmax(320px, 1fr) minmax(440px, 1.7fr)";

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
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {ICE_BREAKERS_INTRO}
          </p>

          <div className="w-full overflow-x-auto">
            <div
              className="grid items-start"
              style={{ gridTemplateColumns: ICE_BREAKER_COLS, rowGap: 0 }}
              role="table"
              aria-label={t("iceBreakersHeading")}
            >
              <div className="contents" role="row">
                <div role="columnheader">
                  <span className="text-[1.25rem] tracking-[-0.02em] leading-none ps-[0.375rem]">
                    {t("colNumber")}
                  </span>
                </div>
                <div role="columnheader">
                  <span className="text-[1.25rem] tracking-[-0.02em] leading-none ps-[0.375rem]">
                    {t("colTitle")}
                  </span>
                </div>
                <div role="columnheader">
                  <span className="text-[1.25rem] tracking-[-0.02em] leading-none ps-[0.375rem]">
                    {t("colInstructions")}
                  </span>
                </div>
              </div>

              <div className="col-span-3 mt-[0.8125rem] border-t border-fg" />

              {ICE_BREAKERS.map((ib, i) => (
                <Fragment key={i}>
                  <div className="pt-[1.25rem] pb-[1.25rem]" role="cell">
                    <span className="text-[1.25rem] font-bold leading-[1.3] tracking-[-0.02em] text-fg ps-[0.375rem]">
                      {i + 1}
                    </span>
                  </div>
                  <div className="pt-[1.25rem] pb-[1.25rem]" role="cell">
                    <span className="text-[1.25rem] leading-[1.3] tracking-[-0.02em] text-fg ps-[0.375rem]">
                      {ib.title}
                    </span>
                  </div>
                  <div className="pt-[1.25rem] pb-[1.25rem]" role="cell">
                    {ib.blocks.length > 0 ? (
                      <ul className="flex flex-col gap-[0.625rem]">
                        {ib.blocks.map((b, j) => (
                          <li
                            key={j}
                            className="text-[1.25rem] leading-[1.4] tracking-[-0.02em] text-fg ps-[0.375rem]"
                          >
                            {b.heading ? (
                              <span className="font-bold">{b.heading}: </span>
                            ) : null}
                            {b.text}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="col-span-3 border-b border-fg" />
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
