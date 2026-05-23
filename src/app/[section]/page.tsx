import { notFound } from "next/navigation";
import { sections, getSection } from "@/data/curriculum";
import { Toolbar } from "@/components/Toolbar";
import { SectionTabs } from "@/components/SectionTabs";
import { CurriculumTable } from "@/components/CurriculumTable";

export function generateStaticParams() {
  return sections.map((s) => ({ section: s.id }));
}

export function generateMetadata({ params }: { params: { section: string } }) {
  const section = getSection(params.section);
  if (!section) return { title: "Compassionate Curriculum Archive" };
  return {
    title: `${section.label} — Compassionate Curriculum Archive`,
    description: section.overview,
  };
}

export default function SectionPage({
  params,
}: {
  params: { section: string };
}) {
  const section = getSection(params.section);
  if (!section) return notFound();

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />

        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          Compassionate Curriculum Archive
        </h1>

        <SectionTabs activeId={section.id} />

        <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] leading-none text-fg">
          Introduction
        </h2>

        <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
          {section.overview}
        </p>

        <div className="flex flex-col gap-[3rem] w-full">
          <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] leading-none text-fg">
            Curriculum
          </h2>
          <CurriculumTable sectionId={section.id} lessons={section.lessons} />
        </div>
      </div>
    </div>
  );
}
