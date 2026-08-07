"use client";

import { useState } from "react";
import type { ContentBlock } from "@/data/types";
import { ImagePicker } from "./ImagePicker";

const BLOCK_KIND_LABELS: Record<ContentBlock["kind"], string> = {
  p: "Paragraph",
  ul: "Bulleted list",
  ol: "Numbered list",
  h: "Heading",
  label: "Label pill",
  image: "Image",
  download: "Download link",
};

const NEW_BLOCK: Record<ContentBlock["kind"], () => ContentBlock> = {
  p: () => ({ kind: "p", text: "" }),
  ul: () => ({ kind: "ul", items: [""] }),
  ol: () => ({ kind: "ol", items: [""] }),
  h: () => ({ kind: "h", text: "" }),
  label: () => ({ kind: "label", text: "" }),
  image: () => ({ kind: "image", src: "", alt: "" }),
  download: () => ({ kind: "download", href: "", label: "" }),
};

const inputClass =
  "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";
const textareaClass = `${inputClass} min-h-[4rem] resize-y`;
const smallButton =
  "rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-30 disabled:hover:border-neutral-300 disabled:hover:text-neutral-600";

export function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const [addKind, setAddKind] = useState<ContentBlock["kind"]>("p");

  function update(i: number, next: ContentBlock) {
    const copy = blocks.slice();
    copy[i] = next;
    onChange(copy);
  }
  function remove(i: number) {
    onChange(blocks.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const copy = blocks.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  }
  function add() {
    onChange([...blocks, NEW_BLOCK[addKind]()]);
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => (
        <div key={i} className="rounded border border-neutral-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {BLOCK_KIND_LABELS[block.kind]}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                className={smallButton}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className={smallButton}
                disabled={i === blocks.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className={`${smallButton} text-red-600 hover:border-red-600 hover:text-red-600`}
                onClick={() => remove(i)}
              >
                Remove
              </button>
            </div>
          </div>
          <BlockFields block={block} onChange={(b) => update(i, b)} />
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1">
        <select
          value={addKind}
          onChange={(e) => setAddKind(e.target.value as ContentBlock["kind"])}
          className={`${inputClass} w-auto`}
        >
          {Object.entries(BLOCK_KIND_LABELS).map(([kind, label]) => (
            <option key={kind} value={kind}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
        >
          + Add block
        </button>
      </div>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
}) {
  switch (block.kind) {
    case "p":
      return (
        <div className="flex flex-col gap-2">
          <textarea
            className={textareaClass}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Paragraph text"
          />
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={block.bold ?? false}
              onChange={(e) => onChange({ ...block, bold: e.target.checked })}
            />
            Bold (pull-quote style)
          </label>
        </div>
      );
    case "ul":
    case "ol":
      return (
        <textarea
          className={textareaClass}
          value={block.items.join("\n")}
          onChange={(e) => onChange({ ...block, items: e.target.value.split("\n") })}
          placeholder={"One item per line"}
        />
      );
    case "h":
    case "label":
      return (
        <input
          className={inputClass}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder={block.kind === "h" ? "Heading text" : "Label text"}
        />
      );
    case "image":
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={block.src}
              onChange={(e) => onChange({ ...block, src: e.target.value })}
              placeholder="Image path (e.g. /images/photo.jpg)"
            />
            <ImagePicker onPick={(src) => onChange({ ...block, src })} />
          </div>
          <input
            className={inputClass}
            value={block.alt}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Alt text (describes the image)"
          />
          <input
            className={inputClass}
            value={block.caption ?? ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value || undefined })}
            placeholder="Caption (optional)"
          />
        </div>
      );
    case "download":
      return (
        <div className="flex flex-col gap-2">
          <input
            className={inputClass}
            value={block.href}
            onChange={(e) => onChange({ ...block, href: e.target.value })}
            placeholder="File path (e.g. /downloads/handout.pdf)"
          />
          <input
            className={inputClass}
            value={block.label}
            onChange={(e) => onChange({ ...block, label: e.target.value })}
            placeholder="Button label (e.g. Download handout)"
          />
        </div>
      );
    default:
      return null;
  }
}
