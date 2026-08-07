// Scans the raw image folders (CC_images, public/images) on every request so
// newly-dropped files show up in the /portal tool without a rebuild step.
// This is a local working tool, not part of the deployed site.
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

export type LibraryRootId = "cc_images" | "public_images";

export interface LibraryRoot {
  id: LibraryRootId;
  label: string;
  absPath: string;
  // public/images is already served statically by Next; cc_images is
  // gitignored and outside public/, so it needs the asset API route.
  directBase: string | null;
}

export const LIBRARY_ROOTS: LibraryRoot[] = [
  {
    id: "cc_images",
    label: "CC_images (workshop photos + pub refs)",
    absPath: path.join(process.cwd(), "CC_images"),
    directBase: null,
  },
  {
    id: "public_images",
    label: "public/images (site-assigned lesson images)",
    absPath: path.join(process.cwd(), "public", "images"),
    directBase: "/images",
  },
];

const PREVIEWABLE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif"]);
const SKIP_NAMES = new Set([".DS_Store", "node_modules"]);

// Matches filenames like BC_L1_A2_..., MNF_L11_A4_..., RP_L5_A1_...
const CODE_RE = /\b([A-Z]{2,5})_L(\d+)_A(\d+)/;

export interface LibraryImage {
  rootId: LibraryRootId;
  relPath: string; // relative to that root, used as the asset lookup key
  name: string;
  ext: string;
  previewable: boolean;
  size: number;
  code: { section: string; lesson: string; activity: string } | null;
  url: string; // ready-to-use src/href for this asset
}

function walk(dir: string, root: LibraryRoot, out: LibraryImage[]) {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP_NAMES.has(entry)) continue;
    const abs = path.join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) {
      walk(abs, root, out);
      continue;
    }
    const ext = path.extname(entry).slice(1).toLowerCase();
    if (!ext) continue;
    const relPath = path.relative(root.absPath, abs);
    const match = entry.match(CODE_RE);
    out.push({
      rootId: root.id,
      relPath,
      name: entry,
      ext,
      previewable: PREVIEWABLE_EXTS.has(ext),
      size: st.size,
      code: match
        ? { section: match[1], lesson: match[2], activity: match[3] }
        : null,
      url: root.directBase
        ? `${root.directBase}/${relPath.split(path.sep).join("/")}`
        : `/api/portal/asset?kind=library&root=${root.id}&file=${encodeURIComponent(relPath)}`,
    });
  }
}

export function scanLibrary(): LibraryImage[] {
  const out: LibraryImage[] = [];
  for (const root of LIBRARY_ROOTS) {
    walk(root.absPath, root, out);
  }
  return out;
}
