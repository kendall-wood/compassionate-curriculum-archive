type LessonHeroProps = {
  title: string;
  image?: string;
  imageAlt?: string;
};

export function LessonHero({ title, image, imageAlt = "" }: LessonHeroProps) {
  return (
    <div className="flex flex-col gap-[1.5rem] w-full">
      <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
        {title}
      </h1>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={imageAlt}
          className="w-[71.25rem] max-w-full aspect-[1140/634] object-cover"
        />
      ) : null}
    </div>
  );
}
