// Runs the /portal QA Check tab: takes an uploaded PDF, extracts its text
// (scripts/portal-qa-extract.py — fast, text-only, no page rendering),
// spellchecks it, and diffs its section/lesson order against the live
// site's own curriculum data. Local dev tool only, same as the rest of
// /portal — not meant to run against untrusted input in production.
import { randomUUID } from "node:crypto";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";
import { loadAllSections } from "@/data/curriculum";
import { checkOrder, buildPageMap } from "@/lib/portal/qa-order-check";
import { buildLessonContentReport } from "@/lib/portal/content-check";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();

interface ExtractResult {
  pageCount: number;
  pages: { page: number; text: string }[];
  spellcheck: { word: string; count: number; pages: number[] }[];
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
  }

  const tmpPath = path.join(tmpdir(), `portal-qa-${randomUUID()}.pdf`);
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(tmpPath, bytes);

    let stdout: string;
    try {
      const result = await execFileAsync(
        "python3",
        [path.join(ROOT, "scripts", "portal-qa-extract.py"), tmpPath],
        { maxBuffer: 1024 * 1024 * 64 }
      );
      stdout = result.stdout;
    } catch (err) {
      const stderr = (err as { stderr?: string }).stderr ?? String(err);
      return NextResponse.json(
        { error: "PDF extraction failed.", detail: stderr },
        { status: 500 }
      );
    }

    let extracted: ExtractResult;
    try {
      extracted = JSON.parse(stdout);
    } catch {
      return NextResponse.json(
        { error: "Extraction script returned invalid output.", detail: stdout.slice(0, 2000) },
        { status: 500 }
      );
    }

    const sections = await loadAllSections();
    const orderFindings = checkOrder(extracted.pages, sections);
    const pageMap = buildPageMap(extracted.pages, sections);
    const contentReport = buildLessonContentReport(extracted.pages, sections);

    return NextResponse.json({
      pageCount: extracted.pageCount,
      orderFindings,
      spellcheck: extracted.spellcheck,
      pageMap,
      contentReport,
    });
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
}
