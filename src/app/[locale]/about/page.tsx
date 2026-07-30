import { setRequestLocale, getTranslations } from "next-intl/server";
import { Toolbar } from "@/components/Toolbar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />
        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {t("heading")}
        </h1>
        <div className="flex flex-col gap-[1.5rem]">
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("p1")}
          </p>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("p2")}
          </p>
        </div>

        <section className="flex flex-col gap-[1.5rem]">
          <h2 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg">
            {t("storyHeading")}
          </h2>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("story1")}
          </p>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("story2")}
          </p>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("story3")}
          </p>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("story4")}
          </p>
        </section>

        <section className="flex flex-col gap-[1.5rem]">
          <h2 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg">
            {t("acknowledgementsHeading")}
          </h2>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("ack1")}
          </p>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("ack2")}
          </p>
          <ul className="flex flex-col gap-[0.75rem] list-disc pl-[2rem] max-w-[79rem]">
            {t.raw("ackThanks").map((item: string, i: number) => (
              <li
                key={i}
                className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("ack3")}
          </p>
        </section>
      </div>
    </div>
  );
}
