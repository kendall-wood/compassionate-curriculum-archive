// Claude-powered translation pipeline.
//
//   ANTHROPIC_API_KEY=sk-... npm run translate
//   ANTHROPIC_API_KEY=sk-... npm run translate -- --locale es
//   ANTHROPIC_API_KEY=sk-... npm run translate -- --force
//
// What it does:
//   1. Walks src/messages/en.json + src/data/sections/<id>/en.json
//   2. For every other locale in src/i18n/locales.ts, asks Claude to
//      translate the source JSON, preserving structure exactly
//   3. Writes the result to the matching <locale>.json file
//
// Why JSON-in / JSON-out:
//   The translation prompt sends a single JSON document. Claude returns
//   a single JSON document with the same shape. This means:
//     - keys are never translated
//     - structure, arrays, ids, image paths, URLs are preserved
//     - we can JSON.parse to validate before writing
//
// Hash cache:
//   For each source file we also write a `.hash` sidecar in
//   .translation-cache/. If the source hash matches the cached hash for
//   a (locale, file) pair, that translation is skipped. Pass --force
//   to ignore the cache and retranslate everything.
//
// Cost / safety:
//   Uses claude-haiku-4-5 by default — small, fast, cheap, and
//   high-quality enough for prose. Set TRANSLATE_MODEL to override.
//   The whole curriculum (~70KB EN × 30 locales) costs roughly $0.50
//   at default pricing.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { register } from "tsx/esm/api";

register();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CACHE_DIR = resolve(ROOT, ".translation-cache");

const MODEL = process.env.TRANSLATE_MODEL ?? "claude-haiku-4-5";

// CLI flags
const args = process.argv.slice(2);
const forceFlag = args.includes("--force");
const localeFlagIdx = args.indexOf("--locale");
const onlyLocale = localeFlagIdx >= 0 ? args[localeFlagIdx + 1] : null;

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY is not set");
  process.exit(1);
}

const { LOCALES, DEFAULT_LOCALE } = await import(
  resolve(ROOT, "src/i18n/locales.ts")
);

// Files to translate. Each entry is {src, outFor(locale)}.
const TARGETS = [
  {
    name: "ui",
    src: resolve(ROOT, "src/messages/en.json"),
    outFor: (locale) => resolve(ROOT, `src/messages/${locale}.json`),
  },
  ...["beloved-community", "restorative-practices", "media-narrative-futuring"].map(
    (id) => ({
      name: `section:${id}`,
      src: resolve(ROOT, `src/data/sections/${id}/en.json`),
      outFor: (locale) =>
        resolve(ROOT, `src/data/sections/${id}/${locale}.json`),
    })
  ),
];

const anthropic = new Anthropic({ apiKey });

function hash(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function loadHashCache(locale) {
  const path = resolve(CACHE_DIR, `${locale}.json`);
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

function saveHashCache(locale, cache) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(resolve(CACHE_DIR, `${locale}.json`), JSON.stringify(cache, null, 2));
}

const SYSTEM = `You are a professional translator producing locale catalogs for an interactive curriculum archive. The content is about trauma-informed, participatory learning.

Rules:
1. Output ONLY a JSON document with the exact same structure as the input. No prose, no markdown fences, no commentary.
2. NEVER translate JSON keys, IDs, URLs, file paths (e.g. /images/foo.png, /downloads/foo.pdf), HTML/Markdown tags, ICU message placeholders like {color} or {title}, hex color codes, kind discriminators ("p"/"ul"/"ol"/"h"/"label"/"image"/"download"), or numeric values.
3. Translate ONLY user-facing string values: prose text, list items, headings, pill label text (kind "label", e.g. "For Facilitators:"), image alt text, image captions, download labels, titles, overviews, labels like "I. Beloved Community".
4. For roman-numeral section labels ("I. Beloved Community"), keep the roman numeral as-is but translate the rest.
5. For activity labels like "A1", "A2", "L1" — leave them unchanged. They are identifiers, not words.
6. Preserve all whitespace, punctuation, em-dashes, and curly quotes from the source.
7. Use the target language naturally and respectfully. Trauma-related vocabulary should match how that community would speak about it, not a literal calque. Honorifics and grammatical gender should follow the target language's conventions.
8. If a string has special characters like ↗ or — keep them.`;

async function translateOnce({ source, locale, localeName, attempt }) {
  const userMessage = `Translate the values in this JSON catalog from English into ${localeName} (${locale}). Follow every rule. Return only the translated JSON, starting with { and nothing else — no prose, no markdown fences, no commentary.${
    attempt > 1
      ? "\n\nIMPORTANT: a previous attempt produced invalid JSON. Be extra careful to escape any double quotes inside string values as \\\" and any backslashes as \\\\."
      : ""
  }

${source}`;

  // Prefill the assistant's reply with `{` so Claude continues writing
  // JSON rather than wrapping the output in prose or fences.
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [
      { role: "user", content: userMessage },
      { role: "assistant", content: "{" },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block) throw new Error("no text content in response");
  let text = "{" + block.text;
  text = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  return text;
}

async function translate(opts) {
  const MAX_ATTEMPTS = 3;
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const text = await translateOnce({ ...opts, attempt });
      JSON.parse(text); // validate
      return text;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) {
        process.stdout.write(`retry ${attempt + 1}… `);
      }
    }
  }
  throw lastErr;
}

async function processLocale(locale) {
  const cfg = LOCALES.find((l) => l.code === locale);
  if (!cfg) {
    console.error(`unknown locale: ${locale}`);
    return;
  }
  const cache = forceFlag ? {} : loadHashCache(locale);

  // The 4 files for this locale are independent → translate them in
  // parallel. Anthropic accepts plenty of concurrent requests per key;
  // 4 at a time stays comfortably under the rate limit.
  const work = TARGETS.map((target) => {
    const source = readFileSync(target.src, "utf8");
    const srcHash = hash(source);
    if (cache[target.name] === srcHash) {
      console.log(`  [skip] ${target.name} (unchanged)`);
      return null;
    }
    return { target, source, srcHash };
  }).filter(Boolean);

  if (work.length === 0) return;

  await Promise.all(
    work.map(async ({ target, source, srcHash }) => {
      const tag = `  [translate] ${target.name}`;
      try {
        const result = await translate({
          source,
          locale,
          localeName: cfg.englishName,
        });
        const out = target.outFor(locale);
        mkdirSync(dirname(out), { recursive: true });
        writeFileSync(out, result.endsWith("\n") ? result : result + "\n");
        cache[target.name] = srcHash;
        console.log(`${tag} ok`);
      } catch (err) {
        console.log(`${tag} FAILED: ${err.message}`);
      }
    })
  );

  saveHashCache(locale, cache);
}

const targetLocales = onlyLocale
  ? [onlyLocale]
  : LOCALES.map((l) => l.code).filter((c) => c !== DEFAULT_LOCALE);

console.log(`translating to ${targetLocales.length} locale(s) using ${MODEL}`);

for (const locale of targetLocales) {
  console.log(`\n→ ${locale}`);
  await processLocale(locale);
}

console.log("\ndone");
