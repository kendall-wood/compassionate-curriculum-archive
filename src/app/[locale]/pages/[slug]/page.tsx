import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { loadPage, pageSlugs } from "@/data/pages";
import { routing } from "@/i18n/routing";
import { Toolbar } from "@/components/Toolbar";
import { ContentRenderer } from "@/components/ContentRenderer";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    pageSlugs().map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const page = await loadPage(slug, locale);
  return { title: page?.title ?? "Compassionate Curriculum Archive" };
}

export default async function StandalonePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await loadPage(slug, locale);
  if (!page) return notFound();

  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <Toolbar />
        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          {page.title}
        </h1>
        <ContentRenderer blocks={page.blocks} />
      </div>
    </div>
  );
}
