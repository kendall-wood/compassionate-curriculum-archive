import { Fragment } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Toolbar } from "@/components/Toolbar";
import { Link } from "@/i18n/routing";
import { ReferenceSource } from "@/components/ReferenceSource";
import { REFERENCE_SECTIONS } from "@/data/references";

// Section / Lesson / Source — mirrors the section-page curriculum table widths
// (a fixed label column + flexible content columns).
const REFERENCE_COLS = "234px minmax(280px, 0.9fr) minmax(440px, 1.7fr)";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const about = await getTranslations({ locale, namespace: "about" });
  const appendix = await getTranslations({ locale, namespace: "appendix" });
  return { title: `${about("referencesHeading")} — ${appendix("metaTitle")}` };
}

export default async function ReferencesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const appendix = await getTranslations("appendix");

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar showBack backHref="/appendix" />

        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {t("referencesHeading")}
        </h1>

        <p className="text-[1.25rem] tracking-[-0.02em] leading-none text-fg">
          <Link href="/appendix" className="hover:text-accent transition-colors">
            / {appendix("heading")}
          </Link>
        </p>

        <section className="flex flex-col gap-[1.5rem]">
          <p className="text-[1.5rem] leading-[1.3] tracking-[-0.02em] opacity-70 max-w-[79rem]">
            {t("referencesIntro")}
          </p>

          <div className="w-full overflow-x-auto">
            <div
              className="grid items-start"
              style={{ gridTemplateColumns: REFERENCE_COLS, rowGap: 0 }}
              role="table"
              aria-label={t("referencesHeading")}
            >
              <div className="contents" role="row">
                <div role="columnheader">
                  <span className="text-[1.25rem] tracking-[-0.02em] leading-none ps-[0.375rem]">
                    {t("referencesColSection")}
                  </span>
                </div>
                <div role="columnheader">
                  <span className="text-[1.25rem] tracking-[-0.02em] leading-none ps-[0.375rem]">
                    {t("referencesColLesson")}
                  </span>
                </div>
                <div role="columnheader">
                  <span className="text-[1.25rem] tracking-[-0.02em] leading-none ps-[0.375rem]">
                    {t("referencesColSource")}
                  </span>
                </div>
              </div>

              <div className="col-span-3 mt-[0.8125rem] border-t border-fg" />

              {REFERENCE_SECTIONS.map((section) =>
                section.lessons.map((lesson, li) => (
                  <Fragment key={`${section.section}-${lesson.lessonLabel}`}>
                    <div className="pt-[1.25rem] pb-[1.25rem]" role="cell">
                      {li === 0 ? (
                        <span
                          className="text-[1.25rem] font-bold leading-[1.3] tracking-[-0.02em] text-fg px-[0.375rem] py-[0.125rem] hover:bg-accent hover:text-accent-fg transition-colors duration-100"
                          style={{
                            boxDecorationBreak: "clone",
                            WebkitBoxDecorationBreak: "clone",
                          }}
                        >
                          {section.section}
                        </span>
                      ) : null}
                    </div>
                    <div className="pt-[1.25rem] pb-[1.25rem]" role="cell">
                      <span
                        className="text-[1.25rem] leading-[1.3] tracking-[-0.02em] text-fg px-[0.375rem] py-[0.125rem] hover:bg-accent hover:text-accent-fg transition-colors duration-100"
                        style={{
                          boxDecorationBreak: "clone",
                          WebkitBoxDecorationBreak: "clone",
                        }}
                      >
                        <span className="font-bold">{lesson.lessonLabel}</span>{" "}
                        {lesson.lessonTitle}
                      </span>
                    </div>
                    <div className="pt-[1.25rem] pb-[1.25rem]" role="cell">
                      <ul className="flex flex-col gap-[0.625rem]">
                        {lesson.sources.map((source, si) => (
                          <ReferenceSource key={si} text={source} />
                        ))}
                      </ul>
                    </div>
                    <div className="col-span-3 border-b border-fg" />
                  </Fragment>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
