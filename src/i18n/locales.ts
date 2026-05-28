// Single source of truth for every locale the site ships.
// Adding a new locale: append here, run `npm run translate`, redeploy.
// Each `nativeName` is shown in the language picker in the locale's own
// script so users recognise their language without speaking English.

export type LocaleConfig = {
  code: string;
  englishName: string;
  nativeName: string;
  dir: "ltr" | "rtl";
};

export const LOCALES = [
  { code: "en", englishName: "English", nativeName: "English", dir: "ltr" },
  { code: "es", englishName: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "zh", englishName: "Chinese (Simplified)", nativeName: "简体中文", dir: "ltr" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "bn", englishName: "Bengali", nativeName: "বাংলা", dir: "ltr" },
  { code: "pt", englishName: "Portuguese (Brazil)", nativeName: "Português", dir: "ltr" },
  { code: "ru", englishName: "Russian", nativeName: "Русский", dir: "ltr" },
  { code: "fr", englishName: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", englishName: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "ko", englishName: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "vi", englishName: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr" },
  { code: "tr", englishName: "Turkish", nativeName: "Türkçe", dir: "ltr" },
  { code: "it", englishName: "Italian", nativeName: "Italiano", dir: "ltr" },
  { code: "pl", englishName: "Polish", nativeName: "Polski", dir: "ltr" },
  { code: "uk", englishName: "Ukrainian", nativeName: "Українська", dir: "ltr" },
  { code: "nl", englishName: "Dutch", nativeName: "Nederlands", dir: "ltr" },
  { code: "tl", englishName: "Tagalog", nativeName: "Tagalog", dir: "ltr" },
  { code: "ht", englishName: "Haitian Creole", nativeName: "Kreyòl Ayisyen", dir: "ltr" },
  { code: "sw", englishName: "Swahili", nativeName: "Kiswahili", dir: "ltr" },
  { code: "am", englishName: "Amharic", nativeName: "አማርኛ", dir: "ltr" },
  { code: "so", englishName: "Somali", nativeName: "Soomaali", dir: "ltr" },
  { code: "yo", englishName: "Yoruba", nativeName: "Yorùbá", dir: "ltr" },
  { code: "pa", englishName: "Punjabi", nativeName: "ਪੰਜਾਬੀ", dir: "ltr" },
  { code: "ur", englishName: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "fa", englishName: "Persian (Farsi)", nativeName: "فارسی", dir: "rtl" },
  { code: "th", englishName: "Thai", nativeName: "ไทย", dir: "ltr" },
  { code: "id", englishName: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr" },
  { code: "he", englishName: "Hebrew", nativeName: "עברית", dir: "rtl" },
  { code: "el", englishName: "Greek", nativeName: "Ελληνικά", dir: "ltr" },
] as const satisfies readonly LocaleConfig[];

export const LOCALE_CODES = LOCALES.map((l) => l.code);
export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

export function getLocaleConfig(code: string): LocaleConfig {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function isRtl(code: string): boolean {
  return getLocaleConfig(code).dir === "rtl";
}
