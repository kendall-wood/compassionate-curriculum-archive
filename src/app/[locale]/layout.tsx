import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import "../../styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { VoiceoverManager } from "@/components/VoiceoverManager";
import { routing } from "@/i18n/routing";
import { getLocaleConfig } from "@/i18n/locales";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Compassionate Curriculum Archive",
  description:
    "An interactive, accessible archive of the Compassionate Curriculum — a participatory framework for learning, reflection, and collective growth.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Required so server components down the tree can call useTranslations /
  // getTranslations during static generation.
  setRequestLocale(locale);

  const messages = await getMessages();
  const { dir } = getLocaleConfig(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('cc-theme');if(t==='dark'){document.documentElement.classList.add('dark');}var z=localStorage.getItem('cc-zoom');if(z){document.documentElement.style.setProperty('--zoom',z);}var a=localStorage.getItem('cc-accent');if(a){document.documentElement.style.setProperty('--color-accent',a);}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <VoiceoverManager />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
