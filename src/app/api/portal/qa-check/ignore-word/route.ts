// Appends a word to scripts/qa-spellcheck-allowlist.json so future QA runs
// stop flagging it. A local filesystem write to a committed repo file —
// fine here (unlike the client editor's save path) since /portal only ever
// runs on a developer's own machine, never in production.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const ALLOWLIST_PATH = path.join(
  process.cwd(),
  "scripts",
  "qa-spellcheck-allowlist.json"
);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  // Curly and straight apostrophes mean the same thing here (e.g. "Hawai'i"
  // vs "Hawai'i") — normalized the same way scripts/portal-qa-extract.py
  // does, so an entry written from either form matches at check time.
  const word =
    typeof body?.word === "string" ? body.word.trim().toLowerCase().replace(/’/g, "'") : "";
  if (!word) {
    return NextResponse.json({ error: "missing word" }, { status: 400 });
  }

  let list: string[] = [];
  try {
    list = JSON.parse(await readFile(ALLOWLIST_PATH, "utf-8"));
  } catch {
    list = [];
  }

  if (!list.includes(word)) {
    list.push(word);
    list.sort();
    await writeFile(ALLOWLIST_PATH, JSON.stringify(list, null, 2) + "\n", "utf-8");
  }

  return NextResponse.json({ ok: true, allowlistSize: list.length });
}
