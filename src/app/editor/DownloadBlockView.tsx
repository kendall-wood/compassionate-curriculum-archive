"use client";

import type { BlockNoteEditor } from "@blocknote/core";

const chromeInput =
  "rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900";

// The label input sits inside ContentRenderer's actual chip styling
// (border-fg/bg-bg/text-fg pill with the same ↓ glyph) so it reads as the
// real live block; href is edited via a small "chrome" field below since it
// has no visible live-site styling of its own to match.
export function DownloadBlockView({
  block,
  editor,
}: {
  block: { id: string; props: { href: string; label: string } };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>;
}) {
  const { href, label } = block.props;

  function update(patch: Partial<{ href: string; label: string }>) {
    editor.updateBlock(block.id, { props: { ...block.props, ...patch } });
  }

  return (
    <div contentEditable={false} className="flex w-full flex-col gap-1.5 py-1">
      <div className="inline-flex w-fit items-center gap-[0.5rem] border border-fg bg-bg px-[0.625rem] py-[0.375rem] text-[1.25rem] tracking-[-0.02em] leading-[1.2] text-fg">
        <input
          className="min-w-[6ch] bg-transparent outline-none"
          value={label}
          onChange={(e) => update({ label: e.target.value })}
          placeholder="Download link"
          style={{ width: `${Math.max(10, label.length + 2)}ch` }}
        />
        <span aria-hidden="true">↓</span>
      </div>
      <input
        className={`${chromeInput} w-full max-w-md`}
        value={href}
        onChange={(e) => update({ href: e.target.value })}
        placeholder="File path (e.g. /downloads/handout.pdf)"
      />
    </div>
  );
}
