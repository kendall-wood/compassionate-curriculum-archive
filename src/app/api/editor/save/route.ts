import { NextRequest, NextResponse } from "next/server";
import { commitFiles, GitHubCommitError, type FileWrite } from "@/lib/editor/github";
import { validateSection, validatePage, isSafeId } from "@/lib/editor/validate";
import sectionsIndexData from "@/data/sections-index.json";
import pagesIndexData from "@/data/pages-index.json";
import type { Section, StandalonePage } from "@/data/types";

interface SectionSaveRequest {
  kind: "section";
  sectionId: string;
  section: Section;
  isNew?: boolean;
}

interface PageSaveRequest {
  kind: "page";
  slug: string;
  page: StandalonePage;
  isNew?: boolean;
}

type SaveRequest = SectionSaveRequest | PageSaveRequest;

export async function POST(req: NextRequest) {
  let body: SaveRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const files: FileWrite[] = [];
  let message: string;

  if (body.kind === "section") {
    const { sectionId, section, isNew } = body;
    if (!isSafeId(sectionId) || sectionId !== section.id) {
      return NextResponse.json({ error: "invalid section id" }, { status: 400 });
    }
    if (!validateSection(section)) {
      return NextResponse.json({ error: "invalid section content" }, { status: 400 });
    }
    files.push({
      path: `src/data/sections/${sectionId}/en.json`,
      content: JSON.stringify(section, null, 2) + "\n",
    });
    if (isNew) {
      const index = sectionsIndexData as { id: string; inCurriculum: boolean }[];
      if (index.some((s) => s.id === sectionId)) {
        return NextResponse.json({ error: "section already exists" }, { status: 409 });
      }
      const nextIndex = [...index, { id: sectionId, inCurriculum: true }];
      files.push({
        path: "src/data/sections-index.json",
        content: JSON.stringify(nextIndex, null, 2) + "\n",
      });
    }
    message = isNew
      ? `Editor: add section "${sectionId}"`
      : `Editor: update section "${sectionId}"`;
  } else if (body.kind === "page") {
    const { slug, page, isNew } = body;
    if (!isSafeId(slug) || slug !== page.slug) {
      return NextResponse.json({ error: "invalid page slug" }, { status: 400 });
    }
    if (!validatePage(page)) {
      return NextResponse.json({ error: "invalid page content" }, { status: 400 });
    }
    files.push({
      path: `src/data/pages/${slug}/en.json`,
      content: JSON.stringify(page, null, 2) + "\n",
    });
    if (isNew) {
      const index = pagesIndexData as string[];
      if (index.includes(slug)) {
        return NextResponse.json({ error: "page already exists" }, { status: 409 });
      }
      const nextIndex = [...index, slug];
      files.push({
        path: "src/data/pages-index.json",
        content: JSON.stringify(nextIndex, null, 2) + "\n",
      });
    }
    message = isNew ? `Editor: add page "${slug}"` : `Editor: update page "${slug}"`;
  } else {
    return NextResponse.json({ error: "unknown save kind" }, { status: 400 });
  }

  try {
    const commitSha = await commitFiles(files, message);
    return NextResponse.json({ ok: true, commitSha });
  } catch (err) {
    const detail = err instanceof GitHubCommitError ? err.message : "unknown error";
    return NextResponse.json(
      { error: "publish failed, nothing was changed", detail },
      { status: 502 }
    );
  }
}
