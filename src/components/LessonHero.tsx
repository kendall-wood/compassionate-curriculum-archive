import { Link } from "@/i18n/routing";

type LessonHeroProps = {
  title: string;
  image?: string;
  imageAlt?: string;
  sectionHref?: string;
  sectionLabel?: string;
  lessonLabel?: string;
};

export function LessonHero({
  title,
  image,
  imageAlt = "",
  sectionHref,
  sectionLabel,
  lessonLabel,
}: LessonHeroProps) {
  return (
    <div className="flex flex-col gap-[1.5rem] w-full">
      {image ? (
        // aspect-ratio preserves the 1140×634 design ratio when the viewport
        // is narrower than the hero's natural width, so the image always
        // fits its frame instead of stretching tall.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={imageAlt}
          className="w-[71.25rem] max-w-full aspect-[1140/634] object-cover"
        />
      ) : null}
      {sectionLabel ? (
        <p className="text-[1.25rem] tracking-[-0.02em] leading-none text-fg">
          {sectionHref ? (
            <Link href={sectionHref} className="hover:text-accent transition-colors">
              / {sectionLabel}
            </Link>
          ) : (
            `/ ${sectionLabel}`
          )}
          {lessonLabel ? <span className="opacity-70"> / {lessonLabel}</span> : null}
        </p>
      ) : null}
      <h1 className="text-[5.375rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
        {title}
      </h1>
    </div>
  );
}
