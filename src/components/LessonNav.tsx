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

  const navBtn =
    "inline-flex items-center px-[0.875rem] py-[0.5rem] border border-fg text-fg text-[1.25rem] tracking-[-0.02em] leading-[1.2] hover:bg-accent hover:text-accent-fg transition-colors";

  return (
    <nav
      aria-label="Lesson navigation"
      className="flex justify-between items-center gap-[1rem] w-full border-t border-fg pt-[1.5rem]"
    >
      {prev ? (
        <Link href={`/${prev.sectionId}/${prev.lessonId}`} className={navBtn}>
          ← {t("previous")}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      {next ? (
        <Link href={`/${next.sectionId}/${next.lessonId}`} className={navBtn}>
          {t("next")} →
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
