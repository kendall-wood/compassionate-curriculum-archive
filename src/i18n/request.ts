import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import enMessages from "../messages/en.json";

// Deep merge: per-locale catalogs override English keys, but anything
// missing in the locale catalog falls back to English. This keeps the
// app fully functional in every locale even while the translation
// script is still populating catalogs.
function deepMerge<T extends Record<string, unknown>>(base: T, override: T): T {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      existing &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      result[key] = deepMerge(
        existing as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const localeMessages =
    locale === routing.defaultLocale
      ? enMessages
      : (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages: deepMerge(
      enMessages as Record<string, unknown>,
      localeMessages as Record<string, unknown>
    ),
  };
});
