import type { Activity, ContentBlock, Lesson, Section } from "@/data/types";
import type { StandalonePage } from "@/data/types";

// The only lever the editor gives the client over layout: which of these 7
// kinds a block is. No block ever carries a font size, color, or spacing
// value — that's what keeps every page rendering through ContentRenderer.tsx
// with the site's locked typography no matter what gets authored here.
// Re-validated server-side (not just trusted from the browser) so a
// tampered request still can't smuggle in anything else.
const BLOCK_KINDS = new Set([
  "p",
  "ul",
  "ol",
  "h",
  "label",
  "image",
  "download",
]);

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

export function validateBlock(b: unknown): b is ContentBlock {
  if (!b || typeof b !== "object") return false;
  const block = b as Record<string, unknown>;
  if (!BLOCK_KINDS.has(block.kind as string)) return false;
  switch (block.kind) {
    case "p":
      return typeof block.text === "string";
    case "ul":
    case "ol":
      return (
        Array.isArray(block.items) &&
        block.items.every((i) => typeof i === "string")
      );
    case "h":
    case "label":
      return typeof block.text === "string";
    case "image":
      return isNonEmptyString(block.src) && typeof block.alt === "string";
    case "download":
      return isNonEmptyString(block.href) && isNonEmptyString(block.label);
    default:
      return false;
  }
}

export function validateBlocks(blocks: unknown): blocks is ContentBlock[] {
  return Array.isArray(blocks) && blocks.every(validateBlock);
}

function validateActivity(a: unknown): a is Activity {
  if (!a || typeof a !== "object") return false;
  const act = a as Record<string, unknown>;
  return (
    isNonEmptyString(act.id) &&
    isNonEmptyString(act.label) &&
    isNonEmptyString(act.title) &&
    validateBlocks(act.blocks)
  );
}

function validateLesson(l: unknown): l is Lesson {
  if (!l || typeof l !== "object") return false;
  const lesson = l as Record<string, unknown>;
  return (
    isNonEmptyString(lesson.id) &&
    isNonEmptyString(lesson.label) &&
    isNonEmptyString(lesson.title) &&
    isNonEmptyString(lesson.sectionId) &&
    validateBlocks(lesson.facilitatorBlocks) &&
    Array.isArray(lesson.activities) &&
    lesson.activities.every(validateActivity)
  );
}

export function validateSection(s: unknown): s is Section {
  if (!s || typeof s !== "object") return false;
  const section = s as Record<string, unknown>;
  if (
    !isNonEmptyString(section.id) ||
    !isNonEmptyString(section.label) ||
    !isNonEmptyString(section.title) ||
    typeof section.overview !== "string" ||
    !Array.isArray(section.lessons) ||
    !section.lessons.every(validateLesson)
  ) {
    return false;
  }
  if (
    section.facilitatorBlocks !== undefined &&
    !validateBlocks(section.facilitatorBlocks)
  ) {
    return false;
  }
  return true;
}

export function validatePage(p: unknown): p is StandalonePage {
  if (!p || typeof p !== "object") return false;
  const page = p as Record<string, unknown>;
  return (
    isNonEmptyString(page.id) &&
    isNonEmptyString(page.slug) &&
    isNonEmptyString(page.title) &&
    validateBlocks(page.blocks)
  );
}

// IDs/slugs become file path segments (src/data/sections/<id>/en.json), so
// they're restricted to a safe, predictable charset — this is what stands
// between "new section name" and a path-traversal or invalid-file-name bug.
const SAFE_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isSafeId(id: string): boolean {
  return SAFE_ID_RE.test(id) && id.length <= 80;
}
