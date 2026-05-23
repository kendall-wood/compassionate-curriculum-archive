import type { ContentBlock } from "@/data/types";

const linkRegex = /(https?:\/\/[^\s)]+)/g;

function renderText(text: string) {
  const parts = text.split(linkRegex);
  return parts.map((part, i) => {
    if (linkRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-fg underline-offset-2 hover:opacity-80"
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
    <div className="flex flex-col gap-[24px] text-fg">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "p":
            return (
              <p
                key={i}
                className={`text-[32px] leading-[1.25] tracking-[-0.64px] ${
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
                className="list-disc pl-[1.5em] flex flex-col gap-[12px]"
              >
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-[32px] leading-[1.4] tracking-[-0.64px]"
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
                className="list-decimal pl-[1.5em] flex flex-col gap-[12px]"
              >
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-[32px] leading-[1.4] tracking-[-0.64px]"
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
                className="text-[24px] font-bold leading-[1.2] tracking-[-0.48px]"
              >
                {block.text}
              </h3>
            );
          case "image":
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={block.src}
                alt={block.alt}
                width={block.width ?? 672}
                height={block.height ?? 376}
                className="object-cover max-w-full"
                style={{ width: block.width ?? 672, height: block.height ?? 376 }}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
