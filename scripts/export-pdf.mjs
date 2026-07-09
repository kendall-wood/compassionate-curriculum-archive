// Export the print edition (/[locale]/print) to a press-ready PDF.
//
// Usage:
//   npm run export-pdf              # English
//   npm run export-pdf -- es fr     # one PDF per listed locale
//
// Requires the site to be running (npm run dev or npm start). Override the
// defaults with BASE_URL, CHROME_PATH, or OUT_DIR environment variables.
//
// The page paginates itself with Paged.js in the browser; this script waits
// for the `window.__ccBookReady` signal (set by PagedPreview once all pages
// are laid out) before asking Chrome for the PDF, so the output always
// contains the complete book.

import { mkdir } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = process.env.OUT_DIR ?? "print-output";
const CHROME_PATH =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEFAULT_LOCALE = "en";

const locales = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [DEFAULT_LOCALE];

// localePrefix "as-needed": English lives at the unprefixed URL.
function printUrl(locale) {
  return locale === DEFAULT_LOCALE
    ? `${BASE_URL}/print`
    : `${BASE_URL}/${locale}/print`;
}

await mkdir(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
});

try {
  for (const locale of locales) {
    const url = printUrl(locale);
    const outFile = path.join(
      OUT_DIR,
      `compassionate-curriculum-${locale}.pdf`
    );
    process.stdout.write(`Rendering ${url} … `);

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120_000 });
    const pageCount = await page.waitForFunction(
      () => window.__ccBookReady,
      { timeout: 300_000 }
    );

    await page.pdf({
      path: outFile,
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      timeout: 300_000,
    });
    await page.close();

    console.log(`${await pageCount.jsonValue()} pages → ${outFile}`);
  }
} finally {
  await browser.close();
}
