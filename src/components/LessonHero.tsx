type LessonHeroProps = {
  title: string;
  image?: string;
  imageAlt?: string;
};

export function LessonHero({ title, image, imageAlt = "" }: LessonHeroProps) {
  return (
    <div className="flex flex-col gap-[24px] w-full">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={imageAlt}
          className="w-[1140px] max-w-full h-[634px] object-cover"
        />
      ) : null}
      <h1 className="text-[86px] leading-[1.05] tracking-[-2.58px] text-fg font-normal">
        {title}
      </h1>
    </div>
  );
}
