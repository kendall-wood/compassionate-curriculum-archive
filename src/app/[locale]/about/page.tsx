import { setRequestLocale, getTranslations } from "next-intl/server";
import { Toolbar } from "@/components/Toolbar";
import { REFERENCE_GROUPS } from "@/data/references";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle") };
}

// Splits a citation on http(s) URLs and renders the URLs as links so the
// bibliography stays clickable without a client component.
const urlRegex = /(https?:\/\/[^\s)]+)/g;

function linkifyCitation(text: string) {
  return text.split(urlRegex).map((part, i) => {
    if (!/^https?:\/\//.test(part)) return <span key={i}>{part}</span>;
    // Keep trailing sentence punctuation out of the linked URL.
    const m = part.match(/^(.*?)([.,;:]+)$/);
    const href = m ? m[1] : part;
    const trail = m ? m[2] : "";
    return (
      <span key={i}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-fg underline-offset-2 hover:text-accent hover:decoration-accent transition-colors break-words"
        >
          {href}
        </a>
        {trail}
      </span>
    );
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />
        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {t("heading")}
        </h1>
        <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
          {t("p1")}
        </p>
        <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
          {t("p2")}
        </p>

        <section className="flex flex-col gap-[1.5rem] mt-[1.5rem]">
          <h2 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg">
            {t("acknowledgementsHeading")}
          </h2>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("ack1")}
          </p>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("ack2")}
          </p>
          <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
            {t("ack3")}
          </p>
        </section>

        <section className="flex flex-col gap-[1.5rem] mt-[1.5rem]">
          <h2 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg">
            {t("referencesHeading")}
          </h2>
          <p className="text-[1.5rem] leading-[1.3] tracking-[-0.02em] opacity-70 max-w-[79rem]">
            {t("referencesIntro")}
          </p>
          {REFERENCE_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-[0.75rem]">
              <h3 className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-fg">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-[0.625rem] max-w-[79rem]">
                {group.entries.map((entry, i) => (
                  <li
                    key={i}
                    className="text-[1.25rem] leading-[1.4] tracking-[-0.02em] text-fg"
                  >
                    {linkifyCitation(entry)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
