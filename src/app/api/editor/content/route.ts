import { NextRequest, NextResponse } from "next/server";
import { loadSection } from "@/data/curriculum";
import { loadPage } from "@/data/pages";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");

  if (kind === "section") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
    const section = await loadSection(id);
    if (!section) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ section });
  }

  if (kind === "page") {
    const slug = searchParams.get("slug");
    if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });
    const page = await loadPage(slug);
    if (!page) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ page });
  }

  return NextResponse.json({ error: "unknown kind" }, { status: 400 });
}
