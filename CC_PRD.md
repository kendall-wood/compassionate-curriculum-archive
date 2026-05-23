# Compassionate Curriculum Archive — Product Requirements Document

## Overview

A multi-page educational website for the **Compassionate Curriculum (CC)** — a participatory framework for learning, reflection, and collective growth designed for people with lived experience of trauma or structural harm. The site functions as an interactive, accessible archive of the full curriculum across three sections.

**Figma source:** `https://www.figma.com/design/JEwoQNQG3EqoELP4HjWA1u/CC_2`
- Node `1:2` → Light mode index page
- Node `1:135` → Dark mode index page
- Node `1:269` → Lesson detail page

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Font | Helvetica (system stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`) |
| Deployment | Vercel (recommended) |

---

## Design System

### Colors

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#ffffff` (light) / `#000000` (dark) | Page background |
| `--color-fg` | `#000000` (light) / `#ffffff` (dark) | Text, borders |
| `--color-accent` | `#fff75d` | Active tab highlight (yellow) |
| `--color-active` | `#5dff8d` | Toolbar active state (green) |
| `--color-swatch-1` | `#FF6B6B` | Accent option 1 |
| `--color-swatch-2` | `#FFD93D` | Accent option 2 |
| `--color-swatch-3` | `#6BCB77` | Accent option 3 |
| `--color-swatch-4` | `#4D96FF` | Accent option 4 |
| `--color-swatch-5` | `#C77DFF` | Accent option 5 |
| `--color-swatch-6` | `#FF9F1C` | Accent option 6 |

The active accent color is stored in a CSS custom property (`--color-accent`) and applied globally to: active/selected tab backgrounds, hover states on nav buttons, and any highlighted UI elements.

### Typography

| Usage | Size | Weight | Tracking |
|---|---|---|---|
| Site title | 72px | Regular | -2.16px |
| Lesson hero title | 72px | Regular | -2.16px |
| Section intro body | 32px | Regular | -0.64px |
| Lesson body content | 32px | Regular | -0.64px |
| Lesson body bold (quotes, headers) | 32px | Bold | -0.64px |
| Subheadings (For Facilitators, etc.) | 24px | Bold | -0.48px |
| Nav & toolbar buttons | 20px | Regular | -0.4px |
| Lesson/activity labels (L1, A1) | 20px | Bold | -0.4px |

### Borders & Spacing

- All buttons and tab elements: `1px solid` border, **no border-radius** (sharp corners)
- Button padding: `px-[10px] py-[6px]`
- Page padding: `32px` left/right, `27px` top
- Column gap in toolbar: `8px`
- Section gap between nav groups: `12px`
- Curriculum table row padding: `33px` vertical between rows

---

## Global Layout

### Persistent Toolbar (top, full width)

The toolbar appears on every page and has two rows:

**Row 1 — Primary Nav**
- Left: `Home` button (links to `/`)
- Right (grouped, gap-12): `About` | `Print` | `Contact` | `Settings & Accessibility`

**Row 2 — Utility Bar** (right-aligned)
- 🌙/☀️ Dark/Light mode toggle icon button
- 🌿 Active color indicator (shows current accent, green = active)
- Zoom controls: `[-]` `[100%]` `[+]` — functional, scale page content via CSS `zoom` or `font-size` multiplier on root. Range: 75%–150%, step 25%.
- Color swatches panel: 6 circular swatch buttons that set the active `--color-accent` CSS variable globally. Persist to `localStorage`.

**Dark/Light Toggle behavior:**
- Clicking the toggle switches between light and dark themes
- Light: white background, black text/borders
- Dark: black background, white text/borders
- Active tab accent (`#fff75d` or chosen swatch color) remains consistent across both modes
- Persist preference to `localStorage`

---

## Pages & Routes

### 1. Index Page — `/`

Redirects to `/beloved-community` by default.

---

### 2. Section Index — `/[section]`

**Routes:**
- `/beloved-community`
- `/restorative-practices`
- `/media-narrative-futuring`

**Layout (pixel-faithful to Figma nodes 1:2 / 1:135):**

```
[Toolbar — Row 1]
[Toolbar — Row 2]

Compassionate Curriculum Archive          ← 72px title

[I. Beloved Community] [II. Restorative Practices] [III. Media, Narrative, & Futuring]
                                                      ← section tab row; active = yellow accent bg

Introduction                             ← 24px bold label
[Section overview paragraph]             ← 32px body, max-width ~1264px

Curriculum                               ← 24px bold label

[Curriculum Table]
  Lesson | Title | Activities | Links & Images
  ─────────────────────────────────────────────
  L1     | Title | A1  Activity name         | [thumbnail]
         |       | A2  Activity name         |
  ─────────────────────────────────────────────
  L2     | ...
```

**Curriculum Table spec:**
- Full-width table, no background color on rows
- 4 columns with fixed left offsets (matching Figma): Lesson (0px), Title (234px), Activities (704px), Links & Images (1173px)
- Each row divided by 1px horizontal rule (`border-bottom`)
- Lesson labels bold (`L1`, `L2`…)
- Activity list: `A1 / Activity name` pairs, gap-26 between rows
- Thumbnail image in Links & Images column: 201×112px, `object-cover`
- Clicking any row (lesson title or activity) navigates to the lesson detail route

**Section tabs behavior:**
- Active section tab has the current accent color as background, black text
- Inactive tabs: transparent background, current fg color border + text
- Clicking a tab navigates to that section's route

---

### 3. Lesson Detail — `/[section]/[lesson]`

**Routes (all lessons):**

**Beloved Community:**
- `/beloved-community/identity`
- `/beloved-community/finding-your-people`
- `/beloved-community/developing-your-language`
- `/beloved-community/understanding-historical-trauma`

**Restorative Practices:**
- `/restorative-practices/entering-the-circle`
- `/restorative-practices/reauthoring-circles`
- `/restorative-practices/sharing-our-stories`
- `/restorative-practices/land-ancestor-acknowledgement`
- `/restorative-practices/circle-questions`
- `/restorative-practices/grounding-activities`

**Media, Narrative & Futuring:**
- `/media-narrative-futuring/individual-reflection`
- `/media-narrative-futuring/embodied-storytelling`
- `/media-narrative-futuring/media-analysis`
- `/media-narrative-futuring/participatory-futuring`

**Layout (pixel-faithful to Figma node 1:269):**

```
[Toolbar — Row 1, with Back + Home on left]
[Toolbar — Row 2]

[Hero Image — 1140×634px, object-cover]
Identity: Helping to know ourselves       ← 86px Regular, full width

[Overview] [A1] [A2] [A3] [A4]           ← activity tab row; active = yellow accent bg

For Facilitators                          ← 24px bold subheading
──────────────────────────────────────
  [Facilitator note content — 32px body]

Developing intersectional mindfulness     ← 24px bold subheading (first activity)
──────────────────────────────────────
  [Activity image if applicable]
  [Activity content — 32px body with bullet lists]

[Repeat for each activity]
```

**Detail page nav additions:**
- Row 1 left side adds: `[Back]` (goes to section index) + `[Home]` (goes to `/`)
- Activity sub-tabs: `Overview`, then one tab per activity (`A1`, `A2`, etc.)
  - Clicking a tab smooth-scrolls to that activity's section anchor
  - Active tab = current accent color bg

**Content anchors:**
Each `For Facilitators` block and each `Activity N:` heading should have an `id` attribute for scroll targeting.

---

## Content Data Structure

All curriculum content should be stored in a typed data file (`/src/data/curriculum.ts`) rather than hardcoded in components. Structure:

```typescript
type Activity = {
  id: string;           // "a1", "a2", etc.
  title: string;
  content: string;      // markdown or HTML string
  videoLinks?: string[];
  discussionPrompts?: string[];
  image?: string;       // path to activity image if applicable
}

type Lesson = {
  id: string;           // slug, e.g. "identity"
  label: string;        // "L1", "L2", etc.
  title: string;
  sectionId: string;    // "beloved-community" etc.
  heroImage?: string;
  thumbnail?: string;
  overview: string;     // facilitator overview paragraph
  activities: Activity[];
}

type Section = {
  id: string;           // slug
  label: string;        // "I. Beloved Community"
  title: string;
  overview: string;     // section intro paragraph
  lessons: Lesson[];
}
```

All content from the PDF (`CC_editorial_draft.pdf`) should be transcribed into this data structure. Content is already fully available from the source document.

---

## Functional Requirements

### Dark / Light Mode
- Toggle button in Row 2 of toolbar
- Switches CSS class on `<html>` element (`dark` / `light`)
- Tailwind `darkMode: 'class'` config
- Persists to `localStorage` key `cc-theme`
- Default: light

### Zoom Control
- `-` / `+` buttons adjust zoom level: 75, 100, 125, 150 (%)
- Display current level in the `[100%]` button
- Apply zoom via CSS `font-size` on `:root` (scales `rem`-based layout) OR `zoom` property on `.page-wrapper`
- Persists to `localStorage` key `cc-zoom`

### Accent Color Swatches
- 6 circular swatch buttons in toolbar
- Clicking a swatch sets `--color-accent` CSS variable on `:root`
- Active swatch has a `ring` or `border` indicator
- Persists to `localStorage` key `cc-accent`
- Applied to: active tabs, hover states, any highlighted UI

### Print
- `Print` nav button triggers `window.print()`
- Add a print stylesheet that removes toolbar, resets zoom, shows full content expanded (no collapsed tabs)

---

## Component Breakdown

```
src/
├── app/
│   ├── layout.tsx                    # Root layout, toolbar, theme provider
│   ├── page.tsx                      # Redirects to /beloved-community
│   ├── [section]/
│   │   ├── page.tsx                  # Section index page
│   │   └── [lesson]/
│   │       └── page.tsx              # Lesson detail page
├── components/
│   ├── Toolbar.tsx                   # Full 2-row toolbar (nav + utilities)
│   ├── SectionTabs.tsx               # I / II / III section tab row
│   ├── CurriculumTable.tsx           # Lesson/activity table on index
│   ├── ActivityTabs.tsx              # Overview / A1 / A2 tabs on detail page
│   ├── LessonHero.tsx                # Hero image + large title
│   ├── ActivityBlock.tsx             # Single activity section with content
│   └── ThemeProvider.tsx             # Context for theme, zoom, accent
├── data/
│   └── curriculum.ts                 # All content as typed data
├── styles/
│   └── globals.css                   # CSS variables, dark mode, print styles
└── lib/
    └── hooks/
        └── useTheme.ts               # Hook for theme/zoom/accent state
```

---

## Accessibility Requirements

- All nav buttons are `<button>` or `<a>` with visible focus states
- Color contrast ratio ≥ 4.5:1 in both light and dark mode
- Active accent color swatches must also meet contrast requirements when used as tab backgrounds
- Zoom level changes must not break layout at any supported level (75%–150%)
- `Settings & Accessibility` nav item: placeholder page at `/accessibility` that explains the toolbar controls
- All images have `alt` text
- Keyboard navigable: tab order follows visual reading order

---

## Not In Scope (v1)

- About, Contact pages (nav links present but pages can be placeholders)
- User accounts or saved progress
- CMS integration (content is static in `/src/data/curriculum.ts`)
- Mobile responsive layout (desktop-first per Figma; 1440px design width)
- Appendix and References pages (can be linked as PDF download)

---

## Assets Needed from Figma

The following image assets should be exported from the Figma file before build:

| Asset | Usage | Node |
|---|---|---|
| L1 thumbnail | Curriculum table row 1 | `AFrame_horizontal.2 1` |
| L2 thumbnail | Curriculum table row 2 | `AFrame_horizontal.2 2` |
| L3 thumbnail | Curriculum table row 3 | `AFrame_horizontal.2 3` |
| L4 thumbnail | Curriculum table row 4 | `AFrame_horizontal.2 4` |
| L1 hero image | `/beloved-community/identity` hero | `AFrame_horizontal.2 1` (large) |
| Activity image (A1) | Intersectional mindfulness activity | `AFrame_horizontal.2 2` (detail) |
| Dark/light toggle icons | Toolbar Row 2 | `Vector` (node 1:152, 1:154) |

Export all images as `.webp` at 2x for retina. Place in `/public/images/`.

---

## Key Implementation Notes for Cursor

1. **Tailwind `darkMode`:** Set to `'class'` in `tailwind.config.ts`. The `ThemeProvider` adds/removes the `dark` class on `<html>`.

2. **CSS variables for theming:** Define `--color-fg`, `--color-bg`, `--color-accent` on `:root` and override under `.dark`. Swatches write `--color-accent` directly via `document.documentElement.style.setProperty`.

3. **Font:** Helvetica is a system font. Use `font-family: "Helvetica Neue", Helvetica, Arial, sans-serif` in `globals.css`. No Google Fonts import needed.

4. **Sharp corners everywhere:** Set `borderRadius: 0` globally in Tailwind config or use `rounded-none` as default. No component should have rounded corners per the design.

5. **Curriculum table layout:** The Figma uses absolute pixel offsets for columns. Implement as a CSS Grid with fixed column widths: `grid-cols-[235px_1fr_383px_203px]` (approx), or use a `<table>` with fixed column widths.

6. **Scroll-to-activity:** On lesson detail, activity tabs use `scrollIntoView({ behavior: 'smooth' })` targeting section `id` anchors. No router navigation needed for tab switching within a lesson.

7. **Zoom implementation:** Prefer `font-size` scaling on `:root` (e.g., `font-size: 125%`) combined with `rem`-based sizing in components. This scales text and spacing proportionally without breaking absolute-positioned elements in the toolbar.

8. **Print styles:** In `globals.css` under `@media print`: hide `.toolbar`, `.section-tabs`, `.activity-tabs`; expand all content; reset zoom; ensure text is black on white.
