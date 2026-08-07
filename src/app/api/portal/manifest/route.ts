import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const MANIFEST_PATH = path.join(process.cwd(), "portal-data", "manifest.json");

export async function GET() {
  try {
    const raw = readFileSync(MANIFEST_PATH, "utf8");
    return new NextResponse(raw, {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "portal-data/manifest.json not found. Run: python3 scripts/portal-extract.py",
      },
      { status: 404 }
    );
  }
}
