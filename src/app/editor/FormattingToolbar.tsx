"use client";

import {
  FormattingToolbar as BNFormattingToolbar,
  FormattingToolbarController,
  BlockTypeSelect,
  useBlockNoteEditor,
  useSelectedBlocks,
  type BlockTypeSelectItem,
  type IconType,
} from "@blocknote/react";

// Google Docs' top toolbar, chopped down to exactly the levers our type
// system exposes: which of the 4 text-flow kinds a block is, plus the one
// block-level Bold (pull-quote) toggle. BlockNote's default toolbar ships
// Bold/Italic/Underline/Strike/Colors/Link/Align — none of that applies
// here since blockSchema.ts registers zero style specs, so this replaces
// the whole toolbar rather than trimming it.

const iconProps = { width: "1em", height: "1em", viewBox: "0 0 16 16", fill: "none" } as const;

export const ParagraphIcon: IconType = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 3h10M3 7.5h10M3 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
export const HeadingIcon: IconType = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 3v10M11 3v10M3 8h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
export const BulletIcon: IconType = (props) => (
  <svg {...iconProps} {...props}>
    <circle cx="3" cy="4" r="1.1" fill="currentColor" />
    <circle cx="3" cy="8" r="1.1" fill="currentColor" />
    <circle cx="3" cy="12" r="1.1" fill="currentColor" />
    <path d="M6.5 4h6.5M6.5 8h6.5M6.5 12h6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
export const NumberIcon: IconType = (props) => (
  <svg {...iconProps} {...props}>
    <text x="0.5" y="5.5" fontSize="4.5" fill="currentColor">1</text>
    <text x="0.5" y="9.5" fontSize="4.5" fill="currentColor">2</text>
    <text x="0.5" y="13.5" fontSize="4.5" fill="currentColor">3</text>
    <path d="M6.5 4h6.5M6.5 8h6.5M6.5 12h6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const blockTypeItems: BlockTypeSelectItem[] = [
  { name: "Paragraph", type: "paragraph", icon: ParagraphIcon },
  { name: "Heading", type: "heading", icon: HeadingIcon },
  { name: "Bulleted list", type: "bulletListItem", icon: BulletIcon },
  { name: "Numbered list", type: "numberedListItem", icon: NumberIcon },
];

function BoldToggleButton() {
  const editor = useBlockNoteEditor();
  const selected = useSelectedBlocks(editor);
  const block = selected.length === 1 ? selected[0] : undefined;

  if (!block || block.type !== "paragraph") return null;
  const isBold = Boolean(block.props.bold);

  return (
    <button
      type="button"
      title="Bold (pull-quote style)"
      // Keep the editor's selection/focus intact — otherwise clicking the
      // button blurs the editor before onClick's updateBlock ever runs.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => editor.updateBlock(block.id, { props: { bold: !isBold } })}
      className={`mx-1 flex h-8 min-w-8 items-center justify-center rounded px-2 text-xs font-bold ${
        isBold
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
      }`}
    >
      B
    </button>
  );
}

function CustomFormattingToolbar() {
  return (
    <BNFormattingToolbar>
      <BlockTypeSelect key="blockTypeSelect" items={blockTypeItems} />
      <BoldToggleButton key="bold" />
    </BNFormattingToolbar>
  );
}

export function AppFormattingToolbarController() {
  return <FormattingToolbarController formattingToolbar={CustomFormattingToolbar} />;
}
