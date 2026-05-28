import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Lazy-load the per-locale catalog. The translation script writes to this
  // same path so server and script stay in sync. Each catalog is a single
  // JSON file flattened with dot-paths (e.g. "toolbar.print"); next-intl
  // hands them back via `t("toolbar.print")`.
  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
});
