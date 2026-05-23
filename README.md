# Compassionate Curriculum Archive

A multi-page educational website for the **Compassionate Curriculum (CC)** — a participatory framework for learning, reflection, and collective growth designed for people with lived experience of trauma or structural harm. The site is an interactive, accessible archive of the full curriculum across three sections.

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (`darkMode: 'class'`, sharp corners)
- Helvetica system stack (`"Helvetica Neue", Helvetica, Arial, sans-serif`)
- Static export friendly — every section and lesson is statically generated.

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Structure

```
src/
  app/
    layout.tsx                       # Root layout, theme bootstrap, fonts
    page.tsx                         # Redirects /  -> /beloved-community
    [section]/page.tsx               # Section index (light + dark, Figma 1:2 / 1:135)
    [section]/[lesson]/page.tsx      # Lesson detail (Figma 1:269)
    about / contact / accessibility  # Placeholder pages wired to nav
  components/
    Toolbar.tsx                      # 2-row persistent toolbar
    SectionTabs.tsx                  # I / II / III tab row
    CurriculumTable.tsx              # 4-column grid (234 / 470 / 469 / 203)
    LessonHero.tsx                   # 1140×634 hero + 86px title
    ActivityTabs.tsx                 # Overview / A1 / A2... scroll-spy tabs
    ActivityBlock.tsx                # Per-activity layout
    ContentRenderer.tsx              # p / ul / ol / image renderer
    ThemeProvider.tsx                # theme + zoom + accent color state
    icons.tsx                        # Sun / Moon / Leaf inline SVGs
  data/
    curriculum.ts                    # 3 typed sections with all lessons
    sections/                        # Per-section content from CC_editorial_draft.pdf
    types.ts
  styles/globals.css                 # CSS vars, dark mode, print styles
public/images/                        # Hero + thumbnail assets exported from Figma
```

## Design system

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#ffffff` light / `#000000` dark | Page background |
| `--color-fg` | `#000000` light / `#ffffff` dark | Text, borders |
| `--color-accent` | `#fff75d` (default, switchable via 7 swatches) | Active tab background, hover states |
| `--color-active` | `#5dff8d` | Toolbar active-state indicator |
| `--zoom` | 0.75 / 1 / 1.25 / 1.5 | Page-level zoom multiplier |

User preferences (theme, zoom, accent) persist to `localStorage` and are hydrated before paint via an inline `<script>` in `<head>` to avoid flash-of-wrong-theme.

## Routes

- `/` → 307 redirect to `/beloved-community`
- `/beloved-community`, `/restorative-practices`, `/media-narrative-futuring`
- 14 lesson detail pages, e.g. `/beloved-community/identity`
- `/about`, `/contact`, `/accessibility`

## Source artifacts

- `CC_PRD.md` — Product requirements
- `CC_editorial_draft.pdf` — Source curriculum content
- Figma: `https://www.figma.com/design/JEwoQNQG3EqoELP4HjWA1u/CC_2`
  - Node `1:2` light index, `1:135` dark index, `1:269` lesson detail
