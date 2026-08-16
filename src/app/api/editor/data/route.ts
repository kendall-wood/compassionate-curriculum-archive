// Returns every editable document in one shot — same idea as
// api/portal/site/route.ts (which builds its read-only "Website" view by
// importing the site's own content modules directly), but for the editor:
// full Section objects (not just labels) and standalone pages, so the
// editor can render its whole scrollable document in one pass the same way
// the portal's Website view does.
import { NextResponse } from "next/server";
import { allSectionIds, loadSection } from "@/data/curriculum";
import { loadAllPages } from "@/data/pages";

export async function GET() {
  const ids = allSectionIds();
  const sections = (await Promise.all(ids.map((id) => loadSection(id)))).filter(
    (s): s is NonNullable<typeof s> => Boolean(s)
  );
  const pages = await loadAllPages();
  return NextResponse.json({ sections, pages });
}
