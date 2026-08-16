import { BlockNoteSchema, createExtension } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { ImageBlockView } from "./ImageBlockView";
import { DownloadBlockView } from "./DownloadBlockView";

// Every block type the editor can ever produce, one-to-one with the 7
// ContentBlock kinds in src/data/types.ts. Deliberately built from nothing
// (no `...defaultBlockSpecs`, no `defaultProps`) rather than "defaults minus
// some" — that's what keeps every block free of a font size, color,
// background, or alignment lever ContentRenderer.tsx/PrintBlocks.tsx/
// validate.ts don't know about. If a new kind is ever needed, it has to be
// added here AND to ContentBlock AND to validate.ts — never just here.

const paragraphBlock = createReactBlockSpec(
  {
    type: "paragraph",
    propSchema: { bold: { default: false } },
    content: "inline",
  },
  {
    // Sizing/tracking/leading track ContentRenderer's "p" block, scaled
    // down ~12% (2rem -> 1.75rem) from the exact live size for on-screen
    // legibility while editing — everything else (leading/tracking/weight)
    // stays proportionally correct since those are unitless/em-based.
    // font-size has to be inline: BlockNote's own stylesheet ships
    // ".bn-default-styles p, h1-h6, li { font-size: inherit }", a
    // class+tag selector that beats a single Tailwind arbitrary-value
    // class on specificity alone, silently discarding it otherwise.
    render: (props) => (
      <p
        ref={props.contentRef}
        style={{ fontSize: "1.75rem" }}
        className={`leading-[1.25] tracking-[-0.02em] ${
          props.block.props.bold ? "font-bold" : "font-normal"
        }`}
      />
    ),
  }
);

const headingBlock = createReactBlockSpec(
  {
    type: "heading",
    propSchema: {},
    content: "inline",
  },
  {
    // Always renders as ContentRenderer's fixed <h3> — no level prop, so
    // there's no choice here that doesn't exist downstream. Sizing matches
    // that h3 exactly.
    render: (props) => (
      <h3
        ref={props.contentRef}
        style={{ fontSize: "1.3125rem" }}
        className="font-bold leading-[1.2] tracking-[-0.02em]"
      />
    ),
  }
);

const labelBlock = createReactBlockSpec(
  {
    type: "label",
    propSchema: { text: { default: "" } },
    content: "none",
  },
  {
    // Styled as ContentRenderer's actual label pill (border-fg, accent
    // background, text-accent-fg) — editable in place instead of static.
    render: (props) => (
      <input
        contentEditable={false}
        value={props.block.props.text}
        onChange={(e) =>
          props.editor.updateBlock(props.block.id, {
            props: { text: e.target.value },
          })
        }
        placeholder="Label…"
        className="inline-flex w-fit items-center justify-center border border-fg px-[0.625rem] py-[0.375rem] text-[1.25rem] tracking-[-0.02em] leading-[1.2] text-accent-fg outline-none"
        style={{
          background: "var(--color-accent)",
          width: `${Math.max(4, props.block.props.text.length + 2)}ch`,
        }}
      />
    ),
  }
);

function ordinalOf(
  block: { id: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any
): number {
  let n = 1;
  let prev = editor.getPrevBlock(block.id);
  while (prev && prev.type === "numberedListItem") {
    n++;
    prev = editor.getPrevBlock(prev.id);
  }
  return n;
}

// Row left-padding is ContentRenderer's "ps-[1.5em]" resolved at the live
// 2rem body size (1.5 * 2rem = 3rem), since this row div itself isn't at
// text-[2rem] the way the live <ul>/<ol> is.
const numberedListItemBlock = createReactBlockSpec(
  {
    type: "numberedListItem",
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => (
      <div className="flex w-full items-start gap-2 pl-[3rem]">
        <span
          contentEditable={false}
          style={{ fontSize: "1.75rem" }}
          className="mt-[0.15em] shrink-0 select-none leading-[1.4] tracking-[-0.02em] opacity-70"
        >
          {ordinalOf(props.block, props.editor)}.
        </span>
        <p
          ref={props.contentRef}
          style={{ fontSize: "1.75rem" }}
          className="flex-1 leading-[1.4] tracking-[-0.02em]"
        />
      </div>
    ),
  }
);

const bulletListItemBlock = createReactBlockSpec(
  {
    type: "bulletListItem",
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => (
      <div className="flex w-full items-start gap-2 pl-[3rem]">
        <span
          contentEditable={false}
          style={{ fontSize: "1.75rem" }}
          className="mt-[0.15em] shrink-0 select-none leading-[1.4] tracking-[-0.02em] opacity-70"
        >
          •
        </span>
        <p
          ref={props.contentRef}
          style={{ fontSize: "1.75rem" }}
          className="flex-1 leading-[1.4] tracking-[-0.02em]"
        />
      </div>
    ),
  }
);

const imageBlock = createReactBlockSpec(
  {
    type: "image",
    propSchema: {
      src: { default: "" },
      alt: { default: "" },
      width: { default: 0 },
      height: { default: 0 },
      caption: { default: "" },
    },
    content: "none",
  },
  { render: ImageBlockView }
);

const downloadBlock = createReactBlockSpec(
  {
    type: "download",
    propSchema: { href: { default: "" }, label: { default: "" } },
    content: "none",
  },
  { render: DownloadBlockView }
);

export const blockSchema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: paragraphBlock(),
    heading: headingBlock(),
    label: labelBlock(),
    bulletListItem: bulletListItemBlock(),
    numberedListItem: numberedListItemBlock(),
    image: imageBlock(),
    download: downloadBlock(),
  },
  // "link" can't actually be dropped from inlineContentSpecs — BlockNote's
  // own InlineContentSpecs type requires both "text" and "link" together,
  // so a real hyperlink mark stays creatable (native link toolbar / typed
  // `[text](url)` auto-conversion). blockConversion.ts's textOf() flattens
  // a link run back to the same `[label](url)` literal-text convention
  // ContentRenderer.tsx/PrintBlocks.tsx already hand-parse, so both ways of
  // authoring a link round-trip to the identical saved text either way.
  styleSpecs: {},
});

function textIsEmpty(content: unknown): boolean {
  if (!Array.isArray(content)) return true;
  return content.every((run) => !("text" in run) || run.text === "");
}

// Enter inside a non-empty list item should add another item of the same
// kind (that's what makes typing several bullets in a row actually work);
// Enter inside an EMPTY item exits the list back to a plain paragraph
// instead, matching Notion/Docs convention so you don't get stuck adding
// blank bullets forever. BlockNote's default list specs bundle exactly this
// (see e.g. its built-in checkListItem's "Enter" shortcut), but again only
// for its own defaultBlockSpecs — not something a from-scratch spec gets
// automatically.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function continueListOnEnter(editor: any, block: { id: string; type: string; content: unknown }): boolean {
  if (block.type !== "bulletListItem" && block.type !== "numberedListItem") return false;
  if (textIsEmpty(block.content)) {
    editor.updateBlock(block.id, { type: "paragraph", props: {} });
    return true;
  }
  const [inserted] = editor.insertBlocks([{ type: block.type }], block.id, "after");
  editor.setTextCursorPosition(inserted.id, "start");
  return true;
}

// Markdown-style shortcuts (type "## ", "- ", "1. " to switch the current
// block's type) plus list-continuation on Enter. BlockNote's own
// defaultBlockSpecs bundle both per-block, but building the schema from
// scratch (see comment at the top of this file) opts out of that too, so
// they're registered once here instead, covering exactly the block-type
// conversions our system supports.
export const markdownShortcuts = createExtension({
  key: "cc-markdown-shortcuts",
  inputRules: [
    { find: /^#{1,6}\s$/, replace: () => ({ type: "heading" }) },
    { find: /^[-*]\s$/, replace: () => ({ type: "bulletListItem" }) },
    { find: /^\d+\.\s$/, replace: () => ({ type: "numberedListItem" }) },
  ],
  keyboardShortcuts: {
    Enter: ({ editor }) => continueListOnEnter(editor, editor.getTextCursorPosition().block),
  },
});
