import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { LIBRARY_ROOTS, type LibraryRootId } from "@/lib/portal/library";

const PORTAL_DATA = path.join(process.cwd(), "portal-data");
const KIND_BASE: Record<string, string> = {
  page: path.join(PORTAL_DATA, "pages"),
  embedded: path.join(PORTAL_DATA, "embedded"),
};

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  psd: "image/vnd.adobe.photoshop",
  pdf: "application/pdf",
};

// Resolves `file` under `base` and refuses anything that escapes it
// (rejects `..` segments, absolute paths, symlink-style traversal).
function safeResolve(base: string, file: string): string | null {
  const resolved = path.resolve(base, file);
  const baseWithSep = base.endsWith(path.sep) ? base : base + path.sep;
  if (!resolved.startsWith(baseWithSep)) return null;
  return resolved;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const file = searchParams.get("file");
  const download = searchParams.get("download") === "1";

  if (!kind || !file) {
    return NextResponse.json({ error: "missing kind or file" }, { status: 400 });
  }

  let base: string | undefined;
  if (kind === "library") {
    const rootId = searchParams.get("root") as LibraryRootId | null;
    const root = LIBRARY_ROOTS.find((r) => r.id === rootId);
    if (!root) return NextResponse.json({ error: "unknown root" }, { status: 400 });
    base = root.absPath;
  } else {
    base = KIND_BASE[kind];
  }
  if (!base) return NextResponse.json({ error: "unknown kind" }, { status: 400 });

  const resolved = safeResolve(base, file);
  if (!resolved) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  let stat;
  try {
    stat = statSync(resolved);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!stat.isFile()) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const ext = path.extname(resolved).slice(1).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  const data = readFileSync(resolved);
  const headers: Record<string, string> = {
    "content-type": contentType,
    "content-length": String(stat.size),
    // Safe to cache forever: the frontend appends manifest.generatedAt as a
    // cache-busting query param, so a regenerated file gets a new URL rather
    // than relying on this response ever being revalidated.
    "cache-control": "private, max-age=31536000, immutable",
  };
  if (download) {
    headers["content-disposition"] = `attachment; filename="${path.basename(resolved)}"`;
  }
  return new NextResponse(data, { headers });
}
