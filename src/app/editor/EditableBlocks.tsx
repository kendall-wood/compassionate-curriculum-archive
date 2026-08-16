"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  type DefaultReactSuggestionItem,
  type IconType,
} from "@blocknote/react";
import { filterSuggestionItems, insertOrUpdateBlockForSlashMenu } from "@blocknote/core/extensions";
import { BlockNoteView } from "@blocknote/ariakit";
import "@blocknote/core/style.css";
import "@blocknote/ariakit/style.css";
import "./blocknote-overrides.css";
import type { ContentBlock } from "@/data/types";
import { blockSchema, markdownShortcuts } from "./blockSchema";
import { blocksToBlockNote, blockNoteToBlocks } from "./blockConversion";
import { AppFormattingToolbarController, ParagraphIcon, HeadingIcon, BulletIcon, NumberIcon } from "./FormattingToolbar";

// Continuous, Notion/Docs-style editing surface for a ContentBlock[] field —
// replaces the old boxed-row-per-block form. Type naturally, Enter makes a
// new block, Backspace at the start merges into the previous one (both come
// free from BlockNote/ProseMirror), "/" opens the command menu below for
// anything that isn't a markdown-shortcut (label/image/download), and the
// formatting toolbar (FormattingToolbar.tsx) exposes only the block-kind
// switch + the single Bold toggle — nothing beyond what a ContentBlock can
// actually represent. See blockSchema.ts for why the block set is built
// from nothing rather than BlockNote's defaults.

const iconProps = { width: "1em", height: "1em", viewBox: "0 0 16 16", fill: "none" } as const;

const LabelIcon: IconType = (props) => (
  <svg {...iconProps} {...props}>
    <rect x="2.5" y="6" width="11" height="4.5" rx="2.25" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);
const ImageIcon: IconType = (props) => (
  <svg {...iconProps} {...props}>
    <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="5.5" cy="6.5" r="1" fill="currentColor" />
    <path d="M2.5 11l3.5-3.5 2.5 2.5 2-2 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);
const DownloadIcon: IconType = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M8 2.5v7.5M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSlashMenuItems(editor: any): DefaultReactSuggestionItem[] {
  return [
    {
      title: "Paragraph",
      subtext: "Plain body text",
      aliases: ["p", "text", "paragraph"],
      group: "Text",
      icon: <ParagraphIcon />,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "paragraph" }),
    },
    {
      title: "Heading",
      subtext: "Section heading",
      aliases: ["h", "heading", "title"],
      group: "Text",
      icon: <HeadingIcon />,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "heading" }),
    },
    {
      title: "Bulleted list",
      subtext: "Unordered list",
      aliases: ["ul", "bullet", "list"],
      group: "Text",
      icon: <BulletIcon />,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "bulletListItem" }),
    },
    {
      title: "Numbered list",
      subtext: "Ordered list",
      aliases: ["ol", "numbered", "list"],
      group: "Text",
      icon: <NumberIcon />,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "numberedListItem" }),
    },
    {
      title: "Label",
      subtext: "Small pill tag",
      aliases: ["label", "pill", "tag"],
      group: "Other",
      icon: <LabelIcon />,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "label" }),
    },
    {
      title: "Image",
      subtext: "Upload or pick from the library",
      aliases: ["image", "img", "picture", "photo"],
      group: "Other",
      icon: <ImageIcon />,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "image" }),
    },
    {
      title: "Download link",
      subtext: "Link to a downloadable file",
      aliases: ["download", "file", "pdf", "link"],
      group: "Other",
      icon: <DownloadIcon />,
      onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: "download" }),
    },
  ];
}

function useIsDarkMode(): boolean {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => setDark(el.classList.contains("dark")));
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

// EditorApp.tsx renders every section/lesson/activity on one long page at
// once, so there can be dozens of these mounted simultaneously — each one a
// full ProseMirror editor, unlike the old plain-textarea version. Without
// memoizing, a keystroke in any single one re-renders every other instance
// too (mutateSection's setSections re-renders the whole EditorApp tree),
// which is expensive enough with this many ProseMirror instances to make
// typing feel like it's hung. `onChange` is deliberately excluded from the
// comparison: it's a fresh closure every render, but mutateSection/
// markDirty always read state via setState's functional form, so calling a
// slightly "stale" onChange closure is still correct — only `blocks`
// actually needs to trigger a re-render, and this component only reads it
// once on mount anyway (see the comment on `initialContent` below).
export const EditableBlocks = memo(EditableBlocksImpl, (prev, next) => prev.blocks === next.blocks);

function EditableBlocksImpl({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const isDark = useIsDarkMode();
  // Only read on mount — this component doesn't need to react to `blocks`
  // changing from outside afterwards (nothing else in EditorApp.tsx mutates
  // a section's blocks except this editor itself).
  const initialContent = useMemo(() => blocksToBlockNote(blocks), []); // eslint-disable-line react-hooks/exhaustive-deps
  const editor = useCreateBlockNote({
    schema: blockSchema,
    initialContent,
    extensions: [markdownShortcuts],
  });

  return (
    <div className="cc-editor text-fg">
      <BlockNoteView
        editor={editor}
        theme={isDark ? "dark" : "light"}
        formattingToolbar={false}
        slashMenu={false}
        onChange={() => onChange(blockNoteToBlocks(editor.document))}
      >
        <AppFormattingToolbarController />
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => filterSuggestionItems(getSlashMenuItems(editor), query)}
        />
      </BlockNoteView>
    </div>
  );
}
