import Link from "next/link";

type LessonHeroProps = {
  title: string;
  image?: string;
  imageAlt?: string;
  sectionHref?: string;
  sectionLabel?: string;
};

export function LessonHero({
  title,
  image,
  imageAlt = "",
  sectionHref,
  sectionLabel,
}: LessonHeroProps) {
  return (
    <div className="flex flex-col gap-[1.5rem] w-full">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={imageAlt}
          className="w-[71.25rem] max-w-full h-[39.625rem] object-cover"
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
        </p>
      ) : null}
      <h1 className="text-[5.375rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
        {title}
      </h1>
    </div>
  );
}
