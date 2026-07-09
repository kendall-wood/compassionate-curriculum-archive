import { Link } from "@/i18n/routing";

export type NavItem = {
  href: string;
  label: string; // "L7", "A2", etc.
  title: string;
};

type LessonNavProps = {
  prev?: NavItem;
  next?: NavItem;
};

export function LessonNav({ prev, next }: LessonNavProps) {
  if (!prev && !next) return null;

  const navBtn =
    "inline-flex items-center gap-[0.5rem] px-[0.625rem] py-[0.375rem] border border-fg text-fg text-[1.25rem] tracking-[-0.02em] leading-[1.2] hover:bg-accent hover:text-accent-fg transition-colors";

  return (
    <nav
      aria-label="Lesson navigation"
      className="flex justify-between items-center gap-[1rem] w-full border-t border-fg pt-[1.5rem]"
    >
      {prev ? (
        <Link href={prev.href} className={navBtn} aria-label={`Previous: ${prev.label} ${prev.title}`}>
          <span aria-hidden="true">←</span>
          <span>
            <span className="font-bold">{prev.label}</span> {prev.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      {next ? (
        <Link href={next.href} className={navBtn} aria-label={`Next: ${next.label} ${next.title}`}>
          <span>
            <span className="font-bold">{next.label}</span> {next.title}
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
