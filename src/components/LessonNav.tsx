import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { LessonRef } from "@/data/curriculum";

type LessonNavProps = {
  prev?: LessonRef;
  next?: LessonRef;
};

export async function LessonNav({ prev, next }: LessonNavProps) {
  if (!prev && !next) return null;
  const t = await getTranslations("lessonNav");

  return (
    <nav
      aria-label="Lesson navigation"
      className="flex justify-between items-stretch gap-[1rem] w-full border-t border-fg pt-[1.5rem]"
    >
      {prev ? (
        <Link
          href={`/${prev.sectionId}/${prev.lessonId}`}
          className="group flex flex-col gap-[0.25rem] items-start text-left max-w-[28rem] px-[0.875rem] py-[0.625rem] border border-fg text-fg hover:bg-accent hover:text-accent-fg transition-colors"
        >
          <span className="text-[1.25rem] tracking-[-0.02em] leading-none opacity-70 group-hover:opacity-100">
            ← {t("previous")}
          </span>
          <span className="text-[1.5rem] tracking-[-0.02em] leading-[1.2]">
            {prev.label} · {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      {next ? (
        <Link
          href={`/${next.sectionId}/${next.lessonId}`}
          className="group flex flex-col gap-[0.25rem] items-end text-right max-w-[28rem] px-[0.875rem] py-[0.625rem] border border-fg text-fg hover:bg-accent hover:text-accent-fg transition-colors"
        >
          <span className="text-[1.25rem] tracking-[-0.02em] leading-none opacity-70 group-hover:opacity-100">
            {t("next")} →
          </span>
          <span className="text-[1.5rem] tracking-[-0.02em] leading-[1.2]">
            {next.label} · {next.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
