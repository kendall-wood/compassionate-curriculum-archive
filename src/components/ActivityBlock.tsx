import type { Activity, ContentBlock } from "@/data/types";
import { ContentRenderer } from "./ContentRenderer";

type ActivityBlockProps = {
  id: string;
  pillLabel: string;
  heading: string;
  blocks: ContentBlock[];
};

export function ActivityBlock({
  id,
  pillLabel,
  heading,
  blocks,
}: ActivityBlockProps) {
  return (
    <section
      id={id}
      className="flex flex-col gap-[2.5rem] w-full scroll-mt-[7.5rem]"
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-col">
        <h2
          id={`${id}-heading`}
          className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg"
        >
          {heading}
        </h2>
        <div className="mt-[2.875rem] border-t border-fg w-full" />
      </div>

      <div
        className="grid items-start"
        style={{ gridTemplateColumns: "14.625rem 1fr" }}
      >
        <div className="flex flex-col items-start gap-[1.25rem] pt-[1.25rem]">
          <span className="inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2]">
            {pillLabel}
          </span>
        </div>
        <div className="pt-[1.25rem] max-w-[71.375rem]">
          <ContentRenderer blocks={blocks} />
        </div>
      </div>
    </section>
  );
}

export function FacilitatorBlock({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <section
      id="overview"
      className="flex flex-col gap-[2.5rem] w-full scroll-mt-[7.5rem]"
      aria-labelledby="overview-heading"
    >
      <div className="flex flex-col">
        <h2
          id="overview-heading"
          className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg"
        >
          For Facilitators
        </h2>
        <div className="mt-[2.875rem] border-t border-fg w-full" />
      </div>

      <div
        className="grid items-start"
        style={{ gridTemplateColumns: "14.625rem 1fr" }}
      >
        <div className="flex flex-col items-start gap-[1.25rem] pt-[1.25rem]">
          <span className="inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2]">
            Intro
          </span>
        </div>
        <div className="pt-[1.25rem] max-w-[71.375rem]">
          <ContentRenderer blocks={blocks} />
        </div>
      </div>
    </section>
  );
}

export function ActivityWithImage({
  id,
  pillLabel,
  heading,
  blocks,
}: ActivityBlockProps) {
  // separates leading image (if any) into the second visual cue area, like the Figma
  const firstImageIndex = blocks.findIndex((b) => b.kind === "image");
  const heroImage =
    firstImageIndex !== -1 && blocks[firstImageIndex].kind === "image"
      ? (blocks[firstImageIndex] as Extract<ContentBlock, { kind: "image" }>)
      : null;
  const remaining = heroImage
    ? blocks.filter((_, i) => i !== firstImageIndex)
    : blocks;

  return (
    <section
      id={id}
      className="flex flex-col gap-[2.5rem] w-full scroll-mt-[7.5rem]"
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-col">
        <h2
          id={`${id}-heading`}
          className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg"
        >
          {heading}
        </h2>
        <div className="mt-[2.875rem] border-t border-fg w-full" />
      </div>

      {heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          className="object-cover max-w-full"
          style={{
            width: `${(heroImage.width ?? 672) / 16}rem`,
            height: `${(heroImage.height ?? 376) / 16}rem`,
          }}
        />
      ) : null}

      <div
        className="grid items-start"
        style={{ gridTemplateColumns: "14.625rem 1fr" }}
      >
        <div className="flex flex-col items-start gap-[1.25rem] pt-[1.25rem]">
          <span className="inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2]">
            {pillLabel}
          </span>
        </div>
        <div className="pt-[1.25rem] max-w-[71.375rem]">
          <ContentRenderer blocks={remaining} />
        </div>
      </div>
    </section>
  );
}
