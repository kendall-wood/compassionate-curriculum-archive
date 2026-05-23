import { notFound } from "next/navigation";
import { sections, getSection, getLesson } from "@/data/curriculum";
import { Toolbar } from "@/components/Toolbar";
import { LessonHero } from "@/components/LessonHero";
import { ActivityTabs } from "@/components/ActivityTabs";
import {
  ActivityBlock,
  ActivityWithImage,
  FacilitatorBlock,
} from "@/components/ActivityBlock";

export function generateStaticParams() {
  return sections.flatMap((s) =>
    s.lessons.map((l) => ({ section: s.id, lesson: l.id }))
  );
}

export function generateMetadata({
  params,
}: {
  params: { section: string; lesson: string };
}) {
  const lesson = getLesson(params.section, params.lesson);
  if (!lesson) return { title: "Lesson — Compassionate Curriculum Archive" };
  return {
    title: `${lesson.title} — Compassionate Curriculum Archive`,
  };
}

export default function LessonPage({
  params,
}: {
  params: { section: string; lesson: string };
}) {
  const section = getSection(params.section);
  const lesson = getLesson(params.section, params.lesson);
  if (!section || !lesson) return notFound();

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar showBack backHref={`/${section.id}`} />

        <LessonHero
          title={lesson.title}
          image={lesson.heroImage}
          imageAlt={`${lesson.title} hero image`}
        />

        <ActivityTabs activities={lesson.activities} />

        <FacilitatorBlock blocks={lesson.facilitatorBlocks} />

        <div className="flex flex-col gap-[5rem] w-full">
          {lesson.activities.map((activity) => {
            const hasImage = activity.blocks.some((b) => b.kind === "image");
            const Block = hasImage ? ActivityWithImage : ActivityBlock;
            return (
              <Block
                key={activity.id}
                id={activity.id}
                label="A1"
                pillLabel={activity.label}
                heading={activity.title}
                blocks={activity.blocks}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
