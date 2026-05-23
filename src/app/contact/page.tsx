import { Toolbar } from "@/components/Toolbar";

export const metadata = {
  title: "Contact — Compassionate Curriculum Archive",
};

export default function ContactPage() {
  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />
        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          Contact
        </h1>
        <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
          For questions, collaborations, or to share how you have used the curriculum,
          please get in touch with the project team.
        </p>
      </div>
    </div>
  );
}
