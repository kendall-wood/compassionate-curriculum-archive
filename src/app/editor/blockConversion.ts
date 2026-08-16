import type { ContentBlock } from "@/data/types";
import { blockSchema } from "./blockSchema";

// `schema.Block`/`schema.PartialBlock` are type-only phantom fields BlockNote
// exposes purely so consumers can pull out the exact discriminated-union
// type for a given schema via `typeof` — see CustomBlockNoteSchema in
// @blocknote/core. No runtime meaning, never read at runtime.
type AppBlock = typeof blockSchema.Block;
type AppPartialBlock = typeof blockSchema.PartialBlock;

// A "link" run can't be excluded from the schema (BlockNote requires "text"
// and "link" together — see blockSchema.ts), so a real hyperlink mark is
// always creatable via the native link toolbar or typed `[text](url)`
// auto-conversion. Flattening it back to the literal bracket syntax means
// both ways of authoring a link round-trip to what ContentRenderer.tsx /
// PrintBlocks.tsx already hand-parse.
function textOf(content: AppBlock["content"]): string {
  if (!Array.isArray(content)) return "";
  return content
    .map((run) => {
      if (run.type === "link") {
        const inner = run.content.map((t) => t.text).join("");
        return `[${inner}](${run.href})`;
      }
      return "text" in run ? run.text : "";
    })
    .join("");
}

// ContentBlock[] -> BlockNote doc. The only non-mechanical step: a `ul`/`ol`
// block's `items[]` expands into N sibling BlockNote list-item blocks
// (BlockNote has no array-of-strings block — each item is its own block,
// which is also what makes Enter-for-a-new-bullet work for free).
export function blocksToBlockNote(blocks: ContentBlock[]): AppPartialBlock[] {
  const out: AppPartialBlock[] = [];
  for (const block of blocks) {
    switch (block.kind) {
      case "p":
        out.push({
          type: "paragraph",
          props: { bold: block.bold ?? false },
          content: block.text,
        });
        break;
      case "h":
        out.push({ type: "heading", content: block.text });
        break;
      case "label":
        out.push({ type: "label", props: { text: block.text } });
        break;
      case "ul":
        for (const item of block.items) {
          out.push({ type: "bulletListItem", content: item });
        }
        break;
      case "ol":
        for (const item of block.items) {
          out.push({ type: "numberedListItem", content: item });
        }
        break;
      case "image":
        out.push({
          type: "image",
          props: {
            src: block.src,
            alt: block.alt,
            width: block.width ?? 0,
            height: block.height ?? 0,
            caption: block.caption ?? "",
          },
        });
        break;
      case "download":
        out.push({
          type: "download",
          props: { href: block.href, label: block.label },
        });
        break;
    }
  }
  // A BlockNote doc can never be empty — matches loading a lesson/activity
  // that has no content yet.
  if (out.length === 0) out.push({ type: "paragraph" });
  return out;
}

// BlockNote doc -> ContentBlock[]. Mirror of the above: consecutive sibling
// bulletListItem/numberedListItem blocks of the SAME kind get grouped back
// into one `{kind:"ul"|"ol", items:[...]}` block; a bullet list immediately
// followed by a numbered list must stay two separate ContentBlocks, not
// merge, since a "kind" switch in between breaks the run.
export function blockNoteToBlocks(doc: AppBlock[]): ContentBlock[] {
  if (
    doc.length === 1 &&
    doc[0].type === "paragraph" &&
    !doc[0].props.bold &&
    textOf(doc[0].content) === ""
  ) {
    // The single empty paragraph BlockNote falls back to when everything is
    // deleted — treat it the same as "no content" rather than saving a
    // stray empty paragraph block.
    return [];
  }

  const out: ContentBlock[] = [];
  for (const block of doc) {
    switch (block.type) {
      case "paragraph": {
        const text = textOf(block.content);
        out.push(
          block.props.bold ? { kind: "p", text, bold: true } : { kind: "p", text }
        );
        break;
      }
      case "heading":
        out.push({ kind: "h", text: textOf(block.content) });
        break;
      case "label":
        out.push({ kind: "label", text: block.props.text });
        break;
      case "bulletListItem":
      case "numberedListItem": {
        const kind = block.type === "bulletListItem" ? "ul" : "ol";
        const text = textOf(block.content);
        const last = out[out.length - 1];
        if (last && last.kind === kind) {
          last.items.push(text);
        } else {
          out.push({ kind, items: [text] });
        }
        break;
      }
      case "image": {
        const { src, alt, width, height, caption } = block.props;
        out.push({
          kind: "image",
          src,
          alt,
          ...(width ? { width } : {}),
          ...(height ? { height } : {}),
          ...(caption ? { caption } : {}),
        });
        break;
      }
      case "download":
        out.push({
          kind: "download",
          href: block.props.href,
          label: block.props.label,
        });
        break;
    }
  }
  return out;
}
