// Single source of truth for every locale the site knows about.
// Each `nativeName` is shown in the language picker in the locale's own
// script so users recognise their language without speaking English.
//
// `ready` controls whether a locale is publicly exposed (shown in the
// language picker, routable as /<code>/..., included in static
// generation). Set to `false` for locales that haven't been fully
// translated yet — keeping the row around makes it a one-line change
// to re-enable a locale after `npm run translate` finishes its files.

export type LocaleConfig = {
  code: string;
  englishName: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  ready: boolean;
};

export const LOCALES = [
  { code: "en", englishName: "English", nativeName: "English", dir: "ltr", ready: true },
  { code: "es", englishName: "Spanish", nativeName: "Español", dir: "ltr", ready: true },
  { code: "zh", englishName: "Chinese (Simplified)", nativeName: "简体中文", dir: "ltr", ready: true },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", dir: "ltr", ready: true },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", dir: "rtl", ready: true },
  { code: "bn", englishName: "Bengali", nativeName: "বাংলা", dir: "ltr", ready: false },
  { code: "pt", englishName: "Portuguese (Brazil)", nativeName: "Português", dir: "ltr", ready: true },
  { code: "ru", englishName: "Russian", nativeName: "Русский", dir: "ltr", ready: true },
  { code: "fr", englishName: "French", nativeName: "Français", dir: "ltr", ready: true },
  { code: "de", englishName: "German", nativeName: "Deutsch", dir: "ltr", ready: true },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", dir: "ltr", ready: true },
  { code: "ko", englishName: "Korean", nativeName: "한국어", dir: "ltr", ready: true },
  { code: "vi", englishName: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr", ready: true },
  { code: "tr", englishName: "Turkish", nativeName: "Türkçe", dir: "ltr", ready: true },
  { code: "it", englishName: "Italian", nativeName: "Italiano", dir: "ltr", ready: true },
  { code: "pl", englishName: "Polish", nativeName: "Polski", dir: "ltr", ready: true },
  { code: "uk", englishName: "Ukrainian", nativeName: "Українська", dir: "ltr", ready: true },
  { code: "nl", englishName: "Dutch", nativeName: "Nederlands", dir: "ltr", ready: false },
  { code: "tl", englishName: "Tagalog", nativeName: "Tagalog", dir: "ltr", ready: false },
  { code: "ht", englishName: "Haitian Creole", nativeName: "Kreyòl Ayisyen", dir: "ltr", ready: false },
  { code: "sw", englishName: "Swahili", nativeName: "Kiswahili", dir: "ltr", ready: false },
  { code: "am", englishName: "Amharic", nativeName: "አማርኛ", dir: "ltr", ready: false },
  { code: "so", englishName: "Somali", nativeName: "Soomaali", dir: "ltr", ready: false },
  { code: "yo", englishName: "Yoruba", nativeName: "Yorùbá", dir: "ltr", ready: false },
  { code: "pa", englishName: "Punjabi", nativeName: "ਪੰਜਾਬੀ", dir: "ltr", ready: false },
  { code: "ur", englishName: "Urdu", nativeName: "اردو", dir: "rtl", ready: false },
  { code: "fa", englishName: "Persian (Farsi)", nativeName: "فارسی", dir: "rtl", ready: false },
  { code: "th", englishName: "Thai", nativeName: "ไทย", dir: "ltr", ready: false },
  { code: "id", englishName: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr", ready: false },
  { code: "he", englishName: "Hebrew", nativeName: "עברית", dir: "rtl", ready: false },
  { code: "el", englishName: "Greek", nativeName: "Ελληνικά", dir: "ltr", ready: false },
] as const satisfies readonly LocaleConfig[];

// Locales that are publicly exposed. The translation script still
// operates on the full LOCALES list so stub locales get filled in
// over time without code changes — flip `ready: true` once content
// is verified to ship them.
export const READY_LOCALES = LOCALES.filter((l) => l.ready);
export const LOCALE_CODES = READY_LOCALES.map((l) => l.code);
export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

export function getLocaleConfig(code: string): LocaleConfig {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function isRtl(code: string): boolean {
  return getLocaleConfig(code).dir === "rtl";
}
