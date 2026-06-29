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

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />
        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {t("heading")}
        </h1>

        <section className="flex flex-col gap-[1.5rem]">
          <h2 className="text-[2.25rem] leading-[1.1] tracking-[-0.02em] text-fg font-normal">
            {t("iceBreakersHeading")}
          </h2>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {ICE_BREAKERS_INTRO}
          </p>

          <ol className="flex flex-col gap-[2rem]">
            {ICE_BREAKERS.map((ib, i) => (
              <li key={i} className="flex flex-col gap-[0.75rem] max-w-[79rem]">
                <h3 className="text-[1.75rem] leading-[1.2] tracking-[-0.02em] text-fg font-bold">
                  {i + 1}. {ib.title}
                </h3>
                {ib.blocks.map((b, j) => (
                  <p
                    key={j}
                    className="text-[1.5rem] leading-[1.4] tracking-[-0.02em] text-fg"
                  >
                    {b.heading ? (
                      <span className="font-bold">{b.heading}: </span>
                    ) : null}
                    {b.text}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
