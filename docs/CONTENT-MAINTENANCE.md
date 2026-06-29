# Content Maintenance — how future content can be added & maintained

_For Emma and the project team. This documents (1) how content works **today**, and (2) an exploration of two future options for making content easier to maintain: a **Google Doc backend** vs. an **admin mode**._

---

## Part 1 — How it works today (the current workflow)

### Where content lives
All curriculum text lives in structured **JSON files**, one per section + language:

```
src/data/sections/
  beloved-community/en.json        ← English source (the "master")
  beloved-community/es.json        ← Spanish (auto-generated)
  beloved-community/fr.json        ← French (auto-generated)
  ...
  restorative-practices/en.json
  media-narrative-futuring/en.json
src/messages/en.json               ← UI labels (buttons, nav)
src/data/references.ts             ← Bibliography (About page)
```

Each lesson is made of **content blocks**. The available block types and their styling are fixed by the design system:

| Block | Purpose |
|---|---|
| `p` | Paragraph (optionally `bold`) |
| `ul` / `ol` | Bulleted / numbered list |
| `h` | Sub-heading |
| `label` | The accent-coloured pill (e.g. "For Facilitators:") |
| `image` | Image with optional `caption` |
| `download` | A downloadable file button (PDF worksheets) |

YouTube links inside any text automatically render as a video chip **and** an embedded player.

### The edit → publish loop (today)
1. **Edit** the English `en.json` (and `src/messages/en.json` for UI text).
2. **Translate** (only if content changed and you want other languages updated):
   ```bash
   ANTHROPIC_API_KEY=sk-... npm run translate
   ```
   Only changed files are re-translated (there's a hash cache), so this is fast and cheap.
3. **Publish:** commit + push to GitHub. Vercel rebuilds and goes live automatically.

### Honest assessment
- **Pros:** dead-simple to host, free, fast, version-controlled (every change is tracked and reversible), translations are automated.
- **Cons:** editing JSON requires care (a missing comma breaks the file) and is **not friendly for a non-technical editor**. Adding a brand-new lesson means editing JSON by hand and matching the existing shape.

This is fine for the developer and for occasional small edits, but it's the main thing the two options below aim to improve.

---

## Part 2 — Option A: Google Doc backend (pull content from the Doc)

**Idea:** keep authoring in the existing Google Doc (already the source of truth for text), and have a script convert the Doc into the site's JSON automatically.

### How it would work
- The Doc can be exported programmatically as **HTML/zip** (this is already how we pulled the embedded images, e.g. the Sensory Triptych).
- A converter script would parse the Doc's headings/lists/images into the block structure above, then write the `en.json` files. Then the normal translate + deploy steps run.
- Could be run on a button/scheduled job ("Sync from Doc").

### Pros
- Authors stay in **Google Docs** — comfortable, collaborative, no JSON.
- The Doc is already the agreed source of truth.

### Cons / risks
- **Mapping is fragile.** Google Docs has no concept of "this is an activity" vs "this is a facilitator note." We'd have to enforce **strict authoring conventions** in the Doc (specific heading styles for Section / Lesson / Activity, a marker for `label` pills, a naming convention for images and downloads). If an author deviates, the import breaks or mis-categorises content.
- **Images come out unpredictably named** (`image1.png`, `image2.png`…) and must be matched to placements — manual or convention-driven.
- **Round-trip loss:** captions, alt text, download labels, and citation links don't exist cleanly in a Doc, so they'd need a side-channel (e.g. a conventions table) or manual cleanup after each import.
- It's a **one-way** sync (Doc → site). Edits made anywhere else get overwritten.

### Effort & verdict
- **Medium build** (a robust parser + a documented authoring style guide). Realistic for the 110-hour window only if scoped to a strict template.
- **Best when:** the team strongly prefers Google Docs and is willing to follow a rigid formatting guide.

---

## Part 3 — Option B: Admin mode (a guided editor in the site)

**Idea:** a password-protected admin area where someone can add/edit **sections, lessons, and activities** through forms, choosing from the fixed block types — no JSON, no Google Doc conventions.

There are two realistic ways to build this:

### B1. Built-in admin that commits to GitHub
- A `/admin` area (login required) with forms: "Add lesson", "Add activity", "Add block". Each block picker only offers the **approved block types**, so styling stays on-system by construction.
- On save, it writes the JSON and commits to GitHub → Vercel redeploys. (Optionally triggers translation.)
- **Pros:** fully owned by the project, no third-party CMS bill, enforces the design system, keeps git history.
- **Cons:** the most **development effort** of all options; needs auth, careful validation, and an image-upload path.

### B2. A headless CMS (e.g. Decap/TinaCMS/Sanity)
- Plug in an existing editing tool that provides the admin UI for us and writes to GitHub (Decap/Tina) or its own store (Sanity).
- **Pros:** much less to build; polished editing UI; media uploads handled.
- **Cons:** another account/service to manage (some have their own free tiers + paid tiers); content may move out of plain git (Sanity), and matching the exact block model takes configuration.

### Concrete styling rules the admin would enforce
Whatever we build, the editor would be constrained to the design system so new pages always look right:

- **Only** the approved blocks (`p`, `ul`, `ol`, `h`, `label`, `image`, `download`) — no free-form HTML/fonts/colours.
- **Type & colour come from tokens**, not the editor: body text is fixed at the site's base size; the only "colour" choice is the global accent swatch (already a user setting).
- **Images:** required `alt` text; auto-optimised to WebP and width-capped on upload; optional caption rendered in the standard caption style.
- **Labels:** the pill ("For Facilitators:") is a block type, not a styling toggle — so it always matches the tabs.
- **Downloads:** a label + file; rendered as the standard bordered button.
- **Lessons/activities** get IDs and an `L#`/`A#` label automatically, so breadcrumbs and prev/next navigation keep working.

### Effort & verdict
- **B2 (headless CMS)** is the fastest path to a non-technical editing experience.
- **B1 (built-in)** is the most controlled and dependency-free, but the largest build.

---

## Recommendation

1. **Now (V1.0):** keep the **current JSON + translate workflow**. It's reliable and free, and the developer can make edits quickly. This is documented above so it's not a black box.
2. **Next, if non-technical editing is a priority:** pursue **Option B2 (a headless CMS like Decap/Tina)** — it gives Emma and the team a real editor with the least build effort, while still publishing through GitHub + Vercel (so hosting and costs stay exactly as in `HOSTING.md`).
3. **Google Doc sync (Option A)** is worth it **only** if the team is committed to authoring in Docs under a strict template; otherwise the mapping fragility outweighs the comfort of staying in Docs.

> **Decision needed from the team:** for V1.0, do we (a) stay on the current JSON workflow, (b) invest in an admin/CMS, or (c) build the Google Doc sync? This choice determines what "maintenance" looks like day-to-day and how the remaining hours are spent.

---

_Last updated: see git history for this file._
