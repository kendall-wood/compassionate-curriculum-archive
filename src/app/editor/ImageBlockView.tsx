"use client";

import { useState } from "react";
import type { BlockNoteEditor } from "@blocknote/core";
import { ImagePicker } from "./ImagePicker";

const chromeInput =
  "rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900";
const dimInput =
  "w-14 rounded border border-neutral-300 bg-white px-1.5 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900";

// Renders the image at ContentRenderer's own live-site scale (default
// 672x376, or block.props.width/height when set — same fallback
// ContentRenderer itself uses) instead of a fixed thumbnail, so this is an
// accurate preview of what ships, not a generic form. Editing affordances
// (src/alt/Browse, width/height, caption) stay visually distinct "chrome"
// so they're never mistaken for live content — except the caption, which is
// deliberately styled at the same live scale/opacity as ContentRenderer's
// figcaption since it IS live content, just made editable in place.
export function ImageBlockView({
  block,
  editor,
}: {
  block: {
    id: string;
    props: { src: string; alt: string; width: number; height: number; caption: string };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { src, alt, width, height, caption } = block.props;
  const w = width || 672;
  const h = height || 376;

  function update(patch: Partial<{ src: string; alt: string; width: number; height: number; caption: string }>) {
    editor.updateBlock(block.id, { props: { ...block.props, ...patch } });
  }

  return (
    <div contentEditable={false} className="flex w-full flex-col gap-2 py-1">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${chromeInput} min-w-0 flex-1`}
          value={src}
          onChange={(e) => update({ src: e.target.value })}
          placeholder="Image path (e.g. /images/photo.jpg)"
        />
        <input
          className={`${chromeInput} min-w-0 flex-1`}
          value={alt}
          onChange={(e) => update({ alt: e.target.value })}
          placeholder="Alt text (describes the image)"
        />
        <button
          onClick={() => setPickerOpen(true)}
          className="shrink-0 rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Browse…
        </button>
        <label className="flex shrink-0 items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          W
          <input
            type="number"
            className={dimInput}
            value={width || ""}
            placeholder="672"
            onChange={(e) => update({ width: e.target.value ? Number(e.target.value) : 0 })}
          />
        </label>
        <label className="flex shrink-0 items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          H
          <input
            type="number"
            className={dimInput}
            value={height || ""}
            placeholder="376"
            onChange={(e) => update({ height: e.target.value ? Number(e.target.value) : 0 })}
          />
        </label>
      </div>

      {src ? (
        <figure className="flex flex-col gap-[0.5rem] max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            width={w}
            height={h}
            className="object-cover max-w-full h-auto border border-neutral-200 dark:border-neutral-800"
            style={{ width: `${w / 16}rem`, aspectRatio: `${w} / ${h}` }}
          />
          <input
            className="w-full max-w-full bg-transparent text-[1.25rem] leading-[1.3] tracking-[-0.02em] opacity-70 outline-none focus:ring-1 focus:ring-emerald-400 rounded px-1 -mx-1"
            value={caption}
            onChange={(e) => update({ caption: e.target.value })}
            placeholder="Caption (optional)"
          />
        </figure>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-neutral-300 text-[9px] text-neutral-400 dark:border-neutral-700">
          no image
        </div>
      )}

      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(newSrc) => update({ src: newSrc })}
      />
    </div>
  );
}
