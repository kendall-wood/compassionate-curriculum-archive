import type { Section } from "./types";
import { belovedLessons } from "./sections/beloved-community";
import { restorativeLessons } from "./sections/restorative-practices";
import { mediaLessons } from "./sections/media-narrative-futuring";

const beloved: Section = {
  id: "beloved-community",
  label: "I. Beloved Community",
  title: "Beloved Community",
  overview:
    "This section explores how people come to know themselves, find community, develop language for pain and healing, and better understand the historical trauma carried by others and by themselves. It is grounded in the idea that personal well being and collective liberation are deeply connected. The section begins with self reflection, then moves outward toward relationships, emotional fluency, and historical understanding.",
  lessons: belovedLessons,
};

const restorative: Section = {
  id: "restorative-practices",
  label: "II. Restorative Practices",
  title: "Restorative Practices",
  overview:
    "This section introduces restorative practice as a participatory and relational mode of learning. It centers oral storytelling, listening, shared authorship, and collective responsibility. The practices in this section help participants build trust, reflect on experience, and develop more compassionate ways of being together.",
  lessons: restorativeLessons,
};

const media: Section = {
  id: "media-narrative-futuring",
  label: "III. Media, Narrative, & Futuring",
  title: "Media, Narrative & Futuring",
  overview:
    "This section supports participants in telling fuller stories about themselves, analyzing the stories told by the media, and building imaginative capacity for future making. It begins with individual reflection, moves through embodied storytelling and visual analysis, and ends with participatory futuring.",
  lessons: mediaLessons,
};

export const sections: Section[] = [beloved, restorative, media];

export function getSection(id: string): Section | undefined {
  return sections.find((s) => s.id === id);
}

export function getLesson(sectionId: string, lessonId: string) {
  const s = getSection(sectionId);
  return s?.lessons.find((l) => l.id === lessonId);
}
