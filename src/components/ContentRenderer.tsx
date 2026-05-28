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
                className="list-disc pl-[1.5em] flex flex-col gap-[0.75rem]"
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
                className="list-decimal pl-[1.5em] flex flex-col gap-[0.75rem]"
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
          case "image": {
            const w = block.width ?? 672;
            const h = block.height ?? 376;
            return (
              // aspect-ratio + max-w-full keeps the image fitted to its
              // natural ratio even when the viewport shrinks below the
              // configured rem width.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
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
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
