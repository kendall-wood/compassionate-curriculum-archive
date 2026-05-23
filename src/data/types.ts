export type ContentBlock =
  | { kind: "p"; text: string; bold?: boolean }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "h"; text: string }
  | { kind: "image"; src: string; alt: string; width?: number; height?: number };

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
  lessons: Lesson[];
};
