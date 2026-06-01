// One-shot helper for filling in `thumbnail` + `heroImage` on lesson JSON
// across every locale file for the affected sections. Designed to be re-run
// each time a new batch of photos arrives in `public/images/`: edit the
// ASSIGNMENTS table below, run `node scripts/assign-lesson-photos.mjs`, and
// commit the resulting JSON diff.
//
// The English source files are the source of truth; locale-specific JSONs
// are updated in lockstep so a translated route shows the same image as the
// English one. Idempotent — running twice with the same ASSIGNMENTS does
// nothing the second time.
//
// Why a script instead of hand-editing the JSON?
//   Each section has ~18 locale JSON files. Hand-editing 18 × N lessons is
//   error-prone; a script keeps every locale in lockstep automatically.
//
// To "skip" a lesson this round, just leave it out of ASSIGNMENTS — its
// JSON entry will keep whatever (or no) image it already has.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SECTIONS_DIR = resolve(__dirname, "..", "src", "data", "sections");

// (sectionId, lessonId) → public-relative image path.
// One image per lesson; same image is used for both the table thumbnail and
// the lesson-page hero (matches how Section I's existing placeholders work).
// Spaces in filenames are URL-encoded so the path is safe in `<img src>`.
const ASSIGNMENTS = [
  // Section II — restorative-practices
  {
    section: "restorative-practices",
    lesson: "entering-the-circle",
    image: "/images/FACT_chapel_Block_HandsReach.2.jpg",
  },
  {
    section: "restorative-practices",
    lesson: "sharing-our-stories",
    image: "/images/AFrame_horizontal.3.png",
  },
  {
    section: "restorative-practices",
    lesson: "circle-questions",
    image: "/images/FACT_AltcourseChapel_080920-3.jpg",
  },
  {
    section: "restorative-practices",
    lesson: "grounding-activities",
    image: "/images/FACT_DoubleHug_2000.jpg",
  },
  // Section III — media-narrative-futuring
  {
    section: "media-narrative-futuring",
    lesson: "individual-reflection",
    image: "/images/FACT_ChapelGarage_011520-45.jpg",
  },
  {
    section: "media-narrative-futuring",
    lesson: "embodied-storytelling",
    image: "/images/FACT_chapel_Block_HandsReach.2%20copy.jpg",
  },
  {
    section: "media-narrative-futuring",
    lesson: "participatory-futuring",
    image: "/images/FACT_DoubleHug_2000%20copy.jpg",
  },
];

// Group assignments by section so we open each locale file once per section.
const bySection = new Map();
for (const a of ASSIGNMENTS) {
  if (!bySection.has(a.section)) bySection.set(a.section, []);
  bySection.get(a.section).push(a);
}

let totalUpdates = 0;
let totalUnchanged = 0;
let totalMissing = 0;

for (const [sectionId, items] of bySection) {
  const sectionDir = join(SECTIONS_DIR, sectionId);
  const localeFiles = readdirSync(sectionDir).filter((f) => f.endsWith(".json"));

  for (const file of localeFiles) {
    const path = join(sectionDir, file);
    const raw = readFileSync(path, "utf8");
    const json = JSON.parse(raw);

    let changed = false;
    for (const { lesson, image } of items) {
      const target = json.lessons?.find((l) => l.id === lesson);
      if (!target) {
        console.warn(
          `  ✗ ${sectionId}/${file}: lesson "${lesson}" not found, skipping`
        );
        totalMissing++;
        continue;
      }
      if (target.thumbnail !== image) {
        target.thumbnail = image;
        changed = true;
      }
      if (target.heroImage !== image) {
        target.heroImage = image;
        changed = true;
      }
    }

    if (changed) {
      // Match Prettier's default JSON formatting (2-space indent + trailing
      // newline) so the diff is purely the value changes, no whitespace churn.
      writeFileSync(path, JSON.stringify(json, null, 2) + "\n", "utf8");
      console.log(`  ✓ updated ${sectionId}/${file}`);
      totalUpdates++;
    } else {
      totalUnchanged++;
    }
  }
}

console.log(
  `\nDone. ${totalUpdates} files updated, ${totalUnchanged} already current, ${totalMissing} lesson lookups missed.`
);
