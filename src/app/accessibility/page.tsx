import { Toolbar } from "@/components/Toolbar";

export const metadata = {
  title: "Settings & Accessibility — Compassionate Curriculum Archive",
};

export default function AccessibilityPage() {
  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[32px] pr-[32px] pt-[27px] pb-[80px]">
      <div className="flex flex-col gap-[36px] w-full">
        <Toolbar />
        <h1 className="text-[72px] leading-[1.05] tracking-[-2.16px] text-fg font-normal">
          Settings &amp; Accessibility
        </h1>

        <div className="flex flex-col gap-[24px] max-w-[1264px]">
          <h2 className="text-[24px] font-bold tracking-[-0.48px] text-fg">
            Theme
          </h2>
          <p className="text-[32px] leading-[1.25] tracking-[-0.64px] text-fg">
            Use the sun / moon button at the top of every page to switch between light and
            dark mode. Your choice is remembered for future visits.
          </p>

          <h2 className="text-[24px] font-bold tracking-[-0.48px] text-fg mt-[24px]">
            Accent color
          </h2>
          <p className="text-[32px] leading-[1.25] tracking-[-0.64px] text-fg">
            Pick from the seven swatches in the toolbar to change the highlight color
            used for active tabs and hover states across the archive.
          </p>

          <h2 className="text-[24px] font-bold tracking-[-0.48px] text-fg mt-[24px]">
            Zoom
          </h2>
          <p className="text-[32px] leading-[1.25] tracking-[-0.64px] text-fg">
            Use the - and + buttons to scale the page between 75% and 150% in 25%
            increments.
          </p>

          <h2 className="text-[24px] font-bold tracking-[-0.48px] text-fg mt-[24px]">
            Print
          </h2>
          <p className="text-[32px] leading-[1.25] tracking-[-0.64px] text-fg">
            The Print button prepares a clean, full-content version of the current page
            for printing or saving to PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
