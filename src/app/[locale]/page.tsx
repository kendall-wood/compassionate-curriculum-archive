import { redirect } from "@/i18n/routing";

export default async function LocaleRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Use next-intl's locale-aware redirect so /es → /es/intro instead of /intro.
  redirect({ href: "/intro", locale });
}
