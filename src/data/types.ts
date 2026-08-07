export type ContentBlock =
  | { kind: "p"; text: string; bold?: boolean }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "h"; text: string }
  | { kind: "label"; text: string }
  | {
      kind: "image";
      src: string;
      alt: string;
      width?: number;
      height?: number;
      caption?: string;
    }
  | { kind: "download"; href: string; label: string };

export type Activity = {
  id: string;
  label: string;
  title: string;
  blocks: ContentBlock[];
};

export type Lesson = {
  id: string;
  label: string;
  title: string;
  sectionId: string;
  heroImage?: string;
  thumbnail?: string;
  facilitatorBlocks: ContentBlock[];
  activities: Activity[];
};

export type Section = {
  id: string;
  label: string;
  title: string;
  overview: string;
  facilitatorBlocks?: ContentBlock[];
  lessons: Lesson[];
};

// Freeform standalone page (e.g. client-authored content outside the
// curriculum structure), rendered at /[locale]/pages/[slug] through the
// same ContentRenderer as everything else.
export type StandalonePage = {
  id: string;
  slug: string;
  title: string;
  blocks: ContentBlock[];
};
