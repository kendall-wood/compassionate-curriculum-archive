import type { ContentBlock } from "@/data/types";

// Print variant of ContentRenderer.tsx, mirroring the web layout at print
// scale (see book.css). Differences forced by paper:
// - links can't be clicked, so [label](url) prints as "label (url)" and
//   bare URLs print as visible text
// - YouTube embeds become the web's "▶ YouTube" chip followed by the URL
// - images keep their web proportions: width as a fraction of the web
//   content column (1142px), reproduced as a percentage

const tokenRegex = /(\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s)]+)/g;

// Web content column the design's px image widths are relative to
// (ActivityBlock content column, max-w-[71.375rem] = 1142px).
const WEB_CONTENT_PX = 1142;

function printUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function isYouTube(url: string): boolean {
  return /youtu\.be\/|youtube\.com|youtube-nocookie\.com/.test(url);
}

function renderPrintText(text: string) {
  const parts = text.split(tokenRegex);
  return parts.map((part, i) => {
    const mdLink = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (mdLink) {
      return (
        <span key={i}>
          <span className="cc-print-link">{mdLink[1]}</span>{" "}
          <span className="cc-print-url">({printUrl(mdLink[2])})</span>
        </span>
      );
    }
    if (/^https?:\/\//.test(part)) {
      if (isYouTube(part)) {
        return (
          <span key={i} className="cc-print-chip-wrap">
            <span className="cc-print-chip">▶ YouTube</span>{" "}
            <span className="cc-print-url">{printUrl(part)}</span>
          </span>
        );
      }
      return (
        <span key={i} className="cc-print-url">
          {printUrl(part)}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function PrintBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "p":
            return (
              <p
                key={i}
                className={block.bold ? "cc-print-p cc-print-bold" : "cc-print-p"}
              >
                {renderPrintText(block.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="cc-print-list">
                {block.items.map((item, j) => (
                  <li key={j}>{renderPrintText(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="cc-print-list">
                {block.items.map((item, j) => (
                  <li key={j}>{renderPrintText(item)}</li>
                ))}
              </ol>
            );
          case "h":
            return (
              <h4 key={i} className="cc-print-block-heading">
                {block.text}
              </h4>
            );
          case "label":
            // Web: filled accent pill (static A1/Overview-style tab).
            return (
              <p key={i} className="cc-print-p">
                <span className="cc-pill cc-pill-active">{block.text}</span>
              </p>
            );
          case "image": {
            // Snap to the 6-column document grid: the web px width becomes
            // a whole number of print columns (min 3 so images stay legible).
            const w = block.width ?? 672;
            const cols = Math.min(
              6,
              Math.max(3, Math.round((w / WEB_CONTENT_PX) * 6))
            );
            return (
              <figure key={i} className={`cc-print-figure cc-span-${cols}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src} alt={block.alt} />
                {block.caption ? (
                  <figcaption>{renderPrintText(block.caption)}</figcaption>
                ) : null}
              </figure>
            );
          }
          case "download":
            return (
              <p key={i} className="cc-print-p">
                <span className="cc-pill">{block.label} ↓</span>
              </p>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
