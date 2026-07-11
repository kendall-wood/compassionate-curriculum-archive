import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { loadAllSections } from "@/data/curriculum";

// Server component. Loads section labels for the current locale at render
// time so /es shows "I. Comunidad Amada" instead of falling back to the
// English title. The list of sections (and their order) is locale-
// independent — only the visible labels differ.
export async function SectionTabs({
  activeId,
  locale,
}: {
  activeId: string;
  locale: string;
}) {
  const t = await getTranslations({ locale });
  const sections = await loadAllSections(locale);
  const base =
    "inline-flex items-center justify-center px-[0.625rem] py-[0.375rem] border text-[1.25rem] tracking-[-0.02em] leading-[1.2] transition-colors";

  const tabStyle = (id: string) => {
    const isActive = id === activeId;
    return {
      className: `${base} ${isActive ? "border-fg text-accent-fg" : "border-fg text-fg bg-bg hover:bg-accent hover:text-accent-fg"}`,
      style: isActive ? { background: "var(--color-accent)" } : undefined,
    };
  };

  return (
    <div
      className="cc-section-tabs flex gap-[0.5rem] items-center w-full flex-wrap"
      role="tablist"
      aria-label={t("nav.sectionsLabel")}
    >
      <Link
        href="/intro"
        role="tab"
        aria-selected={activeId === "intro"}
        {...tabStyle("intro")}
      >
        {t("nav.intro")}
      </Link>
      {sections.map((s) => (
        <Link
          key={s.id}
          href={`/${s.id}`}
          role="tab"
          aria-selected={s.id === activeId}
          {...tabStyle(s.id)}
        >
          {s.label}
        </Link>
      ))}
    </div>
  );
}
