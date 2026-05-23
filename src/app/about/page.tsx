import { Toolbar } from "@/components/Toolbar";

export const metadata = {
  title: "About — Compassionate Curriculum Archive",
};

export default function AboutPage() {
  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[32px] pr-[32px] pt-[27px] pb-[80px]">
      <div className="flex flex-col gap-[36px] w-full max-w-[1376px]">
        <Toolbar />
        <h1 className="text-[72px] leading-[1.05] tracking-[-2.16px] text-fg font-normal">
          About
        </h1>
        <p className="text-[32px] leading-[1.25] tracking-[-0.64px] text-fg max-w-[1264px]">
          The Compassionate Curriculum is a participatory framework for learning,
          reflection, and collective growth, designed with and for people with lived
          experience of trauma or any form of structural harm. It draws on the idea that
          lived experience is a form of knowledge, and that healing, critical
          understanding, and imagination are all necessary for building more just futures.
        </p>
        <p className="text-[32px] leading-[1.25] tracking-[-0.64px] text-fg max-w-[1264px]">
          Rather than asking participants simply to receive information, the curriculum
          invites them to shape meaning together. It is grounded in shared authorship,
          mutual aid, and an ethic of accountability.
        </p>
      </div>
    </div>
  );
}
