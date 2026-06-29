import type { ContentBlock } from "@/data/types";

// Matches either [label](url) or a bare https?:// URL
const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s)]+)/g;

function renderText(text: string) {
  const parts = text.split(tokenRegex);
  return parts.map((part, i) => {
    const mdLink = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (mdLink) {
      return (
        <a
          key={i}
          href={mdLink[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-fg underline-offset-2 hover:text-accent hover:decoration-accent transition-colors"
        >
          {mdLink[1]}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-fg underline-offset-2 hover:text-accent hover:decoration-accent transition-colors"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-[1.5rem] text-fg">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "p":
            return (
              <p
                key={i}
                className={`text-[2rem] leading-[1.25] tracking-[-0.02em] ${
                  block.bold ? "font-bold" : "font-normal"
                }`}
              >
                {renderText(block.text)}
              </p>
            );
          case "ul":
            return (
              <ul
                key={i}
                className="list-disc ps-[1.5em] flex flex-col gap-[0.75rem]"
              >
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-[2rem] leading-[1.4] tracking-[-0.02em]"
                  >
                    {renderText(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={i}
                className="list-decimal ps-[1.5em] flex flex-col gap-[0.75rem]"
              >
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-[2rem] leading-[1.4] tracking-[-0.02em]"
                  >
                    {renderText(item)}
                  </li>
                ))}
              </ol>
            );
          case "h":
            return (
              <h3
                key={i}
                className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em]"
              >
                {block.text}
              </h3>
            );
          case "label":
            // Static pill, styled like a filled (selected) A1/Overview tab but
            // not interactive
            return (
              <span
                key={i}
                className="inline-flex items-center justify-center self-start px-[0.625rem] py-[0.375rem] border border-fg text-accent-fg text-[2rem] font-normal leading-[1.25] tracking-[-0.02em]"
                style={{ background: "var(--color-accent)" }}
              >
                {block.text}
              </span>
            );
          case "image": {
            const w = block.width ?? 672;
            const h = block.height ?? 376;
            return (
              // aspect-ratio + max-w-full keeps the image fitted to its
              // natural ratio even when the viewport shrinks below the
              // configured rem width.
              <figure key={i} className="flex flex-col gap-[0.5rem] max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.src}
                  alt={block.alt}
                  width={w}
                  height={h}
                  className="object-cover max-w-full h-auto"
                  style={{
                    width: `${w / 16}rem`,
                    aspectRatio: `${w} / ${h}`,
                  }}
                />
                {block.caption ? (
                  <figcaption className="text-[1.25rem] leading-[1.3] tracking-[-0.02em] opacity-70 max-w-full">
                    {renderText(block.caption)}
                  </figcaption>
                ) : null}
              </figure>
            );
          }
          case "download":
            return (
              <a
                key={i}
                href={block.href}
                download
                className="inline-flex items-center gap-[0.5rem] self-start px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-[1.2] hover:bg-accent hover:text-accent-fg transition-colors"
              >
                <span>{block.label}</span>
                <span aria-hidden="true">↓</span>
              </a>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
