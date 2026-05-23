import type { Activity, ContentBlock } from "@/data/types";
import { ContentRenderer } from "./ContentRenderer";

type ActivityBlockProps = {
  id: string;
  label: string;
  pillLabel: string;
  heading: string;
  blocks: ContentBlock[];
};

export function ActivityBlock({
  id,
  label,
  pillLabel,
  heading,
  blocks,
}: ActivityBlockProps) {
  return (
    <section
      id={id}
      className="flex flex-col gap-[40px] w-full scroll-mt-[120px]"
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-col">
        <h2
          id={`${id}-heading`}
          className="text-[24px] font-bold leading-[1.2] tracking-[-0.48px] text-fg"
        >
          {heading}
        </h2>
        <div className="mt-[46px] border-t border-fg w-full" />
      </div>

      <div className="grid items-start" style={{ gridTemplateColumns: "234px 1fr" }}>
        <div className="flex flex-col items-start gap-[20px] pt-[20px]">
          <p className="text-[20px] font-bold tracking-[-0.4px] text-fg leading-none">
            {label}
          </p>
          <span className="inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-fg bg-bg text-[20px] tracking-[-0.4px] leading-none whitespace-nowrap">
            {pillLabel}
          </span>
        </div>
        <div className="pt-[20px] max-w-[1142px]">
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
      className="flex flex-col gap-[40px] w-full scroll-mt-[120px]"
      aria-labelledby="overview-heading"
    >
      <div className="flex flex-col">
        <h2
          id="overview-heading"
          className="text-[24px] font-bold leading-[1.2] tracking-[-0.48px] text-fg"
        >
          For Facilitators
        </h2>
        <div className="mt-[46px] border-t border-fg w-full" />
      </div>

      <div className="grid items-start" style={{ gridTemplateColumns: "234px 1fr" }}>
        <div className="flex flex-col items-start gap-[20px] pt-[20px]">
          <p className="text-[20px] font-bold tracking-[-0.4px] text-fg leading-none">
            L1
          </p>
          <span className="inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-fg bg-bg text-[20px] tracking-[-0.4px] leading-none whitespace-nowrap">
            Intro
          </span>
        </div>
        <div className="pt-[20px] max-w-[1142px]">
          <ContentRenderer blocks={blocks} />
        </div>
      </div>
    </section>
  );
}

export function ActivityWithImage({
  id,
  label,
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
      className="flex flex-col gap-[40px] w-full scroll-mt-[120px]"
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-col">
        <h2
          id={`${id}-heading`}
          className="text-[24px] font-bold leading-[1.2] tracking-[-0.48px] text-fg"
        >
          {heading}
        </h2>
        <div className="mt-[46px] border-t border-fg w-full" />
      </div>

      {heroImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage.src}
          alt={heroImage.alt}
          className="object-cover max-w-full"
          style={{ width: heroImage.width ?? 672, height: heroImage.height ?? 376 }}
        />
      ) : null}

      <div className="grid items-start" style={{ gridTemplateColumns: "234px 1fr" }}>
        <div className="flex flex-col items-start gap-[20px] pt-[20px]">
          <p className="text-[20px] font-bold tracking-[-0.4px] text-fg leading-none">
            {label}
          </p>
          <span className="inline-flex items-center justify-center px-[10px] py-[6px] border border-fg text-fg bg-bg text-[20px] tracking-[-0.4px] leading-none whitespace-nowrap">
            {pillLabel}
          </span>
        </div>
        <div className="pt-[20px] max-w-[1142px]">
          <ContentRenderer blocks={remaining} />
        </div>
      </div>
    </section>
  );
}
