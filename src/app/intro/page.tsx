import Link from "next/link";
import { Toolbar } from "@/components/Toolbar";
import { SectionTabs } from "@/components/SectionTabs";

const sectionPill =
  "inline-flex items-baseline gap-[0.375rem] px-[0.625rem] py-[0.25rem] border border-fg text-fg hover:bg-accent hover:text-black transition-colors align-baseline";

export const metadata = {
  title: "Introduction — Compassionate Curriculum Archive",
  description:
    "A Practice of Hope. The Compassionate Curriculum is a participatory framework for learning, reflection, and collective growth.",
};

export default function IntroPage() {
  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />

        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          Compassionate Curriculum Archive
        </h1>

        <SectionTabs activeId="intro" />

        <h2 className="text-[1.5rem] font-bold tracking-[-0.02em] leading-none text-fg">
          Introduction: A Practice of Hope
        </h2>

        <div className="flex flex-col gap-[1.5rem]">
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            The Compassionate Curriculum is a participatory framework for
            learning, reflection, and collective growth, designed with and for
            people with lived experience of trauma or any form of structural
            harm. It draws on the idea that lived experience is a form of
            knowledge, and that healing, critical understanding, and imagination
            are all necessary for building more just futures.
          </p>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            Rather than asking participants simply to receive information, the
            curriculum invites them to shape meaning together. It is grounded in
            shared authorship, mutual aid, and an ethic of accountability. It is
            also strengths-based. The work does not begin from what people lack,
            but from what they already know, have survived, and can build
            together. Across the curriculum, participants are encouraged to
            reflect on their own experience, listen to one another, and practice
            forms of collective learning that can support both personal
            transformation and broader social change.
          </p>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            The curriculum has three connected sections.{" "}
            <Link href="/beloved-community" className={sectionPill}>
              Beloved Community <span aria-hidden="true">↗</span>
            </Link>{" "}
            focuses on identity, belonging, emotional fluency, and historical
            trauma. It helps participants better understand themselves, their
            relationships, and the wider systems that shape how they move
            through the world.{" "}
            <Link href="/restorative-practices" className={sectionPill}>
              Restorative Practice <span aria-hidden="true">↗</span>
            </Link>{" "}
            introduces circles, active listening, reauthoring, and other tools
            that support trust, reflection, accountability, and shared
            responsibility.{" "}
            <Link href="/media-narrative-futuring" className={sectionPill}>
              Media, Narrative and Futuring <span aria-hidden="true">↗</span>
            </Link>{" "}
            explores storytelling, representation, and imagination. It invites
            participants to examine dominant narratives, tell fuller stories
            about themselves, and build imaginative capacity for creative
            problem solving and future making.
          </p>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            The Compassionate Curriculum is designed as an open and living
            framework. It can be used in universities, community organizations,
            advocacy spaces, research settings, and other group contexts where
            facilitators want to support belonging, dialogue, and collaborative
            learning. Some groups may use it as a structured series of
            workshops. Others may draw on individual sections or activities and
            adapt them to local needs.
          </p>

          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg font-normal">
            At its core, the curriculum is guided by participation, embodiment,
            storytelling, and multimodal learning. It aims to create conditions
            in which people can think critically, connect across differences, and
            imagine otherwise together. In this sense, the Compassionate
            Curriculum is not only a set of exercises, but a way of practicing
            mutual support, shared inquiry, and hope in common.
          </p>
        </div>
      </div>
    </div>
  );
}
