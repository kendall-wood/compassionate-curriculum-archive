import { Toolbar } from "@/components/Toolbar";

export const metadata = {
  title: "Contact — Compassionate Curriculum Archive",
};

export default function ContactPage() {
  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[32px] pr-[32px] pt-[27px] pb-[80px]">
      <div className="flex flex-col gap-[36px] w-full">
        <Toolbar />
        <h1 className="text-[72px] leading-[1.05] tracking-[-2.16px] text-fg font-normal">
          Contact
        </h1>
        <p className="text-[32px] leading-[1.25] tracking-[-0.64px] text-fg max-w-[1264px]">
          For questions, collaborations, or to share how you have used the curriculum,
          please get in touch with the project team.
        </p>
      </div>
    </div>
  );
}
