// Builds the editor's sidebar tree straight from the same content modules
// the live site renders (loadSection/loadAllPages) — same pattern as
// api/portal/site/route.ts — so the tree always matches what's actually
// deployed, never a stale copy.
import { NextResponse } from "next/server";
import { allSectionIds, loadSection } from "@/data/curriculum";
import { loadAllPages } from "@/data/pages";

export async function GET() {
  const ids = allSectionIds();
  const sections = (await Promise.all(ids.map((id) => loadSection(id)))).filter(
    (s): s is NonNullable<typeof s> => Boolean(s)
  );
  const pages = await loadAllPages();

  return NextResponse.json({
    sections: sections.map((s) => ({
      id: s.id,
      label: s.label,
      title: s.title,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        label: l.label,
        title: l.title,
        activities: l.activities.map((a) => ({
          id: a.id,
          label: a.label,
          title: a.title,
        })),
      })),
    })),
    pages: pages.map((p) => ({ slug: p.slug, title: p.title })),
  });
}
