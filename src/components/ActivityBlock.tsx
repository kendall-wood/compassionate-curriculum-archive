import { getTranslations } from "next-intl/server";
import type { ContentBlock } from "@/data/types";
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
      className="flex flex-col gap-[1.5rem] w-full scroll-mt-[7.5rem]"
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex flex-col">
        <h2
          id={`${id}-heading`}
          className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg"
        >
          {heading}
        </h2>
        <div className="mt-[1.25rem] border-t border-fg w-full" />
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

export async function FacilitatorBlock({ blocks }: { blocks: ContentBlock[] }) {
  const t = await getTranslations("activityBlock");
  return (
    <section
      id="overview"
      className="flex flex-col gap-[1.5rem] w-full scroll-mt-[7.5rem]"
      aria-labelledby="overview-heading"
    >
      <div className="flex flex-col">
        <h2
          id="overview-heading"
          className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg"
        >
          {t("forFacilitators")}
        </h2>
        <div className="mt-[1.25rem] border-t border-fg w-full" />
      </div>

      <div
        className="grid items-start"
        style={{ gridTemplateColumns: "14.625rem 1fr" }}
      >
        <div className="flex flex-col items-start gap-[1.25rem] pt-[1.25rem]">
          <span className="inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2]">
            {t("intro")}
          </span>
        </div>
        <div className="pt-[1.25rem] max-w-[71.375rem]">
          <ContentRenderer blocks={blocks} />
        </div>
      </div>
    </section>
  );
}

