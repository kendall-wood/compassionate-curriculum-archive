"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Section, Lesson, Activity, StandalonePage } from "@/data/types";
import { EditableBlocks } from "./EditableBlocks";
import { ImagePicker } from "./ImagePicker";
import { PublishStatus } from "./PublishStatus";
import { useDeployStatus } from "./useDeployStatus";
import {
  TYPE_SCALE,
  LETTER_SPACING_TOKENS,
  TRIM_SIZE,
  MARGINS,
  FONT_FAMILY,
  BODY_SIZE_PT,
} from "./typography-spec";

// This mirrors /portal's PortalApp.tsx shell and its "Website" reading view
// (SiteView) as closely as possible — same header layout, same neutral/
// emerald color language, same bordered-card-per-page structure, same
// chapter-grouped sidebar-with-jump-links pattern — but every field is
// editable instead of read-only, and cards get a Save button instead of a
// "Copy this page" button.

const smallBtn =
  "rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800";
const createBtn =
  "rounded border border-emerald-400 px-2.5 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/30";
const smallInput =
  "rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900";
const titleInput =
  "w-full bg-transparent text-2xl font-semibold tracking-tight outline-none focus:ring-1 focus:ring-emerald-400 rounded px-1 -mx-1";
const cardClass =
  "mb-8 scroll-mt-6 rounded border bg-white p-8 shadow-sm dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800";

function idSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Creating =
  | null
  | { type: "section" }
  | { type: "lesson"; sectionId: string }
  | { type: "activity"; sectionId: string; lessonId: string };

interface DirtyItem {
  key: string;
  kind: "section" | "page";
  id: string;
  label: string;
}

export function EditorApp() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[] | null>(null);
  const [pages, setPages] = useState<StandalonePage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showTypography, setShowTypography] = useState(false);
  const [showSaveReview, setShowSaveReview] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [lastCommitSha, setLastCommitSha] = useState<string | null>(null);
  const [creating, setCreating] = useState<Creating>(null);
  const deployStatus = useDeployStatus(lastCommitSha);
  const publishing = deployStatus === "publishing";

  useEffect(() => {
    const stored = localStorage.getItem("editor-theme");
    setTheme(stored === "light" ? "light" : "dark");
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("editor-theme", next);
      return next;
    });
  }, []);

  useEffect(() => {
    fetch("/api/editor/data")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load content.");
        return r.json();
      })
      .then((d: { sections: Section[]; pages: StandalonePage[] }) => {
        setSections(d.sections);
        setPages(d.pages);
      })
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  function markDirty(id: string) {
    setDirty((prev) => new Set(prev).add(id));
  }

  function mutateSection(sectionId: string, fn: (s: Section) => Section) {
    setSections((prev) => prev && prev.map((s) => (s.id === sectionId ? fn(s) : s)));
    markDirty(`section:${sectionId}`);
  }
  function mutateLesson(sectionId: string, lessonId: string, patch: Partial<Lesson>) {
    mutateSection(sectionId, (s) => ({
      ...s,
      lessons: s.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l)),
    }));
  }
  function mutateActivity(
    sectionId: string,
    lessonId: string,
    activityId: string,
    patch: Partial<Activity>
  ) {
    mutateSection(sectionId, (s) => ({
      ...s,
      lessons: s.lessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              activities: l.activities.map((a) =>
                a.id === activityId ? { ...a, ...patch } : a
              ),
            }
          : l
      ),
    }));
  }
  function mutatePage(slug: string, patch: Partial<StandalonePage>) {
    setPages((prev) => prev && prev.map((p) => (p.slug === slug ? { ...p, ...patch } : p)));
    markDirty(`page:${slug}`);
  }

  async function persistSection(sectionId: string, section: Section, isNew = false) {
    const key = `section:${sectionId}`;
    setSaving((prev) => new Set(prev).add(key));
    setSaveErrors((prev) => ({ ...prev, [key]: "" }));
    try {
      const res = await fetch("/api/editor/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "section", sectionId, section, isNew }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveErrors((prev) => ({ ...prev, [key]: data.error ?? "Save failed." }));
        return false;
      }
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setLastCommitSha(data.commitSha);
      return true;
    } catch {
      setSaveErrors((prev) => ({ ...prev, [key]: "Couldn't reach the server." }));
      return false;
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  function saveSection(sectionId: string) {
    const section = sections?.find((s) => s.id === sectionId);
    return section ? persistSection(sectionId, section) : Promise.resolve(false);
  }

  async function savePage(slug: string) {
    const page = pages?.find((p) => p.slug === slug);
    if (!page) return;
    const key = `page:${slug}`;
    setSaving((prev) => new Set(prev).add(key));
    setSaveErrors((prev) => ({ ...prev, [key]: "" }));
    try {
      const res = await fetch("/api/editor/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "page", slug, page }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveErrors((prev) => ({ ...prev, [key]: data.error ?? "Save failed." }));
        return;
      }
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setLastCommitSha(data.commitSha);
    } catch {
      setSaveErrors((prev) => ({ ...prev, [key]: "Couldn't reach the server." }));
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  // Saves every dirty section/page one at a time (not in parallel) —
  // commitFiles reads the branch's current HEAD before writing, so two
  // concurrent saves would race to update the same ref and one would 422.
  // Each save still tracks its own dirty/saving/error state, so a failure
  // partway through just leaves the remaining items dirty for a retry.
  async function saveAllDirty() {
    setSavingAll(true);
    const sectionIds = [...dirty]
      .filter((k) => k.startsWith("section:"))
      .map((k) => k.slice("section:".length));
    const pageSlugs = [...dirty]
      .filter((k) => k.startsWith("page:"))
      .map((k) => k.slice("page:".length));
    for (const id of sectionIds) {
      await saveSection(id);
    }
    for (const slug of pageSlugs) {
      await savePage(slug);
    }
    setSavingAll(false);
  }

  // "+ New …" actions persist immediately (unlike ongoing text edits, which
  // wait for a manual Save) — creating something and then losing it if you
  // forget to click Save would be a confusing way for a new item to behave.
  async function createSection(title: string, label: string, overview: string) {
    const id = idSlug(title);
    if (!id || !sections) return false;
    if (sections.some((s) => s.id === id)) {
      setSaveErrors((prev) => ({ ...prev, "section:new": "A section with that name already exists." }));
      return false;
    }
    const section: Section = { id, label: label || title, title, overview, facilitatorBlocks: [], lessons: [] };
    const ok = await persistSection(id, section, true);
    if (ok) setSections([...sections, section]);
    return ok;
  }

  async function createLesson(sectionId: string, title: string, label: string) {
    if (!sections) return false;
    const parent = sections.find((s) => s.id === sectionId);
    if (!parent) return false;
    const id = idSlug(title);
    const newLesson: Lesson = {
      id,
      label: label || `L${parent.lessons.length + 1}`,
      title,
      sectionId,
      facilitatorBlocks: [],
      activities: [],
    };
    const updated = { ...parent, lessons: [...parent.lessons, newLesson] };
    const ok = await persistSection(sectionId, updated);
    if (ok) setSections(sections.map((s) => (s.id === sectionId ? updated : s)));
    return ok;
  }

  async function createActivity(sectionId: string, lessonId: string, title: string, label: string) {
    if (!sections) return false;
    const parent = sections.find((s) => s.id === sectionId);
    const lesson = parent?.lessons.find((l) => l.id === lessonId);
    if (!parent || !lesson) return false;
    const id = idSlug(title);
    const newActivity: Activity = { id, label: label || `A${lesson.activities.length + 1}`, title, blocks: [] };
    const updatedLesson = { ...lesson, activities: [...lesson.activities, newActivity] };
    const updatedSection = {
      ...parent,
      lessons: parent.lessons.map((l) => (l.id === lessonId ? updatedLesson : l)),
    };
    const ok = await persistSection(sectionId, updatedSection);
    if (ok) setSections(sections.map((s) => (s.id === sectionId ? updatedSection : s)));
    return ok;
  }

  async function logout() {
    await fetch("/api/editor/logout", { method: "POST" });
    router.push("/editor/login");
  }

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Opens the relevant "New lesson"/"New activity" form (same as the
  // buttons already inside each section's card) and jumps to it — lets the
  // sidebar tree act as a shortcut instead of scrolling through the whole
  // document by hand. The scroll is deferred a tick so it targets the DOM
  // after `creating`'s re-render has committed.
  const startCreating = useCallback(
    (next: Creating, scrollToId: string) => {
      setCreating(next);
      setTimeout(() => scrollTo(scrollToId), 0);
    },
    [scrollTo]
  );

  if (error) {
    return <div className="p-10 text-sm text-red-500 dark:text-red-400">{error}</div>;
  }
  if (!sections || !pages) {
    return <div className="p-10 text-sm text-neutral-400 dark:text-neutral-600">Loading…</div>;
  }

  const lessonCount = sections.reduce((n, s) => n + s.lessons.length, 0);

  // What the save-review card lists — one row per dirty *document* (a whole
  // section, including all its lessons/activities, or a whole page), since
  // that's the actual save granularity: persistSection/savePage always
  // write the entire section/page object, not a single field.
  const dirtyItems: DirtyItem[] = [...dirty].flatMap((key): DirtyItem[] => {
    if (key.startsWith("section:")) {
      const id = key.slice("section:".length);
      const section = sections.find((s) => s.id === id);
      if (!section) return [];
      return [{ key, kind: "section", id, label: `${section.label} — Overview & content` }];
    }
    if (key.startsWith("page:")) {
      const slug = key.slice("page:".length);
      const page = pages.find((p) => p.slug === slug);
      if (!page) return [];
      return [{ key, kind: "page", id: slug, label: `Page — ${page.title}` }];
    }
    return [];
  });

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Content Editor</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {sections.length} sections · {lessonCount} lessons · {pages.length} pages
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <PublishStatus status={deployStatus} />
          <button onClick={() => setShowTypography(true)} className={smallBtn}>
            Typography
          </button>
          <button onClick={toggleTheme} title="Toggle light / dark" className={smallBtn}>
            {theme === "dark" ? "☀︎ Light" : "☾ Dark"}
          </button>
          <button onClick={logout} className={smallBtn}>
            Log out
          </button>
          {/* Same size as the other header buttons (smallBtn) and the same
              bordered-outline convention as every other Save button in this
              app (see SaveBar below) — outline goes emerald once something's
              dirty, same as a per-card Save button does. */}
          <button
            onClick={() => setShowSaveReview(true)}
            disabled={dirty.size === 0}
            className={
              dirty.size > 0
                ? "rounded border border-emerald-400 px-2.5 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                : smallBtn
            }
          >
            {dirty.size > 0 ? `Save (${dirty.size})` : "Save"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr]">
        <aside className="min-h-0 overflow-y-auto border-r border-neutral-200 p-3 dark:border-neutral-800">
          <button onClick={() => setCreating({ type: "section" })} className={`mb-3 w-full ${createBtn}`}>
            + New section
          </button>

          <div className="mb-4">
            <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
              Pages
            </p>
            <div className="flex flex-col gap-0.5">
              {pages.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => scrollTo(`page-${p.slug}`)}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <span className="w-3 shrink-0 text-emerald-500">
                    {dirty.has(`page:${p.slug}`) ? "●" : ""}
                  </span>
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
              {pages.length === 0 && (
                <p className="px-2 text-xs text-neutral-400 dark:text-neutral-600">None yet.</p>
              )}
            </div>
          </div>

          {sections.map((s) => (
            <div key={s.id} className="mb-4">
              <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
                {s.label}
              </p>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => scrollTo(`section-${s.id}`)}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <span className="w-3 shrink-0 text-emerald-500">
                    {dirty.has(`section:${s.id}`) ? "●" : ""}
                  </span>
                  <span className="truncate">Overview</span>
                </button>
                {s.lessons.map((l) => (
                  <div key={l.id} className="group flex items-center">
                    <button
                      onClick={() => scrollTo(`lesson-${s.id}-${l.id}`)}
                      className="flex min-w-0 flex-1 items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      <span className="w-3 shrink-0" />
                      <span className="truncate">
                        {l.label} · {l.title}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        startCreating(
                          { type: "activity", sectionId: s.id, lessonId: l.id },
                          `section-tail-${s.id}`
                        )
                      }
                      title={`Add activity to ${l.label}`}
                      className="shrink-0 rounded px-1.5 py-1 text-xs text-neutral-400 opacity-0 hover:bg-neutral-100 hover:text-emerald-600 group-hover:opacity-100 dark:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-emerald-400"
                    >
                      +
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => startCreating({ type: "lesson", sectionId: s.id }, `section-tail-${s.id}`)}
                  className="flex items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                >
                  <span className="w-3 shrink-0" />
                  <span className="truncate">+ Add lesson</span>
                </button>
              </div>
            </div>
          ))}
        </aside>

        <div className="min-h-0 overflow-y-auto px-8 py-8">
          {/* max-w-[75rem] matches ActivityBlock.tsx's live body column
              (max-w-[71.375rem]) closely enough that 2rem body text and a
              672px-wide image wrap the same way here as they do live. */}
          <div className="mx-auto max-w-[75rem]">
            <p className="mb-6 text-xs text-neutral-400 dark:text-neutral-600">
              Every section, lesson, and activity in the live curriculum, plus any standalone
              pages — edit anything below, then click Save on that card.{" "}
              {publishing
                ? "A publish is in progress; please wait for it to finish before saving again."
                : "The site rebuilds automatically, usually within about a minute."}
            </p>

            {creating?.type === "section" && (
              <NewSectionForm
                error={saveErrors["section:new"]}
                onCancel={() => setCreating(null)}
                onSubmit={async (title, label, overview) => {
                  const ok = await createSection(title, label, overview);
                  if (ok) setCreating(null);
                  return ok;
                }}
              />
            )}

            {sections.map((section) => (
              <div key={section.id}>
                <SectionCard
                  section={section}
                  dirty={dirty.has(`section:${section.id}`)}
                  saving={saving.has(`section:${section.id}`)}
                  publishing={publishing}
                  error={saveErrors[`section:${section.id}`]}
                  onChange={(patch) => mutateSection(section.id, (s) => ({ ...s, ...patch }))}
                  onSave={() => saveSection(section.id)}
                />

                {section.lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    section={section}
                    lesson={lesson}
                    dirty={dirty.has(`section:${section.id}`)}
                    saving={saving.has(`section:${section.id}`)}
                    publishing={publishing}
                    error={saveErrors[`section:${section.id}`]}
                    onChangeLesson={(patch) => mutateLesson(section.id, lesson.id, patch)}
                    onChangeActivity={(activityId, patch) =>
                      mutateActivity(section.id, lesson.id, activityId, patch)
                    }
                    onSave={() => saveSection(section.id)}
                    onNewActivity={() =>
                      setCreating({ type: "activity", sectionId: section.id, lessonId: lesson.id })
                    }
                  />
                ))}

                {/* Stable scroll target so the sidebar's per-section/per-lesson
                    "+" buttons have somewhere to jump to regardless of which
                    (if any) form below is currently open. */}
                <div id={`section-tail-${section.id}`}>
                  {creating?.type === "activity" &&
                    creating.sectionId === section.id &&
                    section.lessons.some((l) => l.id === creating.lessonId) && (
                      <NewActivityForm
                        error={saveErrors[`section:${section.id}`]}
                        onCancel={() => setCreating(null)}
                        onSubmit={async (title, label) => {
                          if (creating.type !== "activity") return false;
                          const ok = await createActivity(creating.sectionId, creating.lessonId, title, label);
                          if (ok) setCreating(null);
                          return ok;
                        }}
                      />
                    )}

                  {creating?.type === "lesson" && creating.sectionId === section.id && (
                    <NewLessonForm
                      error={saveErrors[`section:${section.id}`]}
                      onCancel={() => setCreating(null)}
                      onSubmit={async (title, label) => {
                        const ok = await createLesson(section.id, title, label);
                        if (ok) setCreating(null);
                        return ok;
                      }}
                    />
                  )}

                  <button
                    onClick={() => setCreating({ type: "lesson", sectionId: section.id })}
                    className={`mb-8 ${createBtn}`}
                  >
                    + New lesson in {section.label}
                  </button>
                </div>
              </div>
            ))}

            <p className="mb-1.5 mt-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
              Pages
            </p>
            {pages.map((page) => (
              <PageCard
                key={page.slug}
                page={page}
                dirty={dirty.has(`page:${page.slug}`)}
                saving={saving.has(`page:${page.slug}`)}
                publishing={publishing}
                error={saveErrors[`page:${page.slug}`]}
                onChange={(patch) => mutatePage(page.slug, patch)}
                onSave={() => savePage(page.slug)}
              />
            ))}
          </div>
        </div>
      </div>

      {showTypography && <TypographyModal onClose={() => setShowTypography(false)} />}
      {showSaveReview && (
        <SaveReviewModal
          items={dirtyItems}
          saving={saving}
          savingAll={savingAll}
          publishing={publishing}
          saveErrors={saveErrors}
          onSaveAll={saveAllDirty}
          onSaveItem={(item) => (item.kind === "section" ? saveSection(item.id) : savePage(item.id))}
          onClose={() => setShowSaveReview(false)}
        />
      )}
    </div>
  );
}

// Opened by the header's big Save button — lists every section/page with
// unsaved edits before anything is actually published, then either saves
// them all at once or lets you save (and see the per-item result of) just
// one at a time via the same persistSection/savePage path the individual
// card Save buttons already use.
function SaveReviewModal({
  items,
  saving,
  savingAll,
  publishing,
  saveErrors,
  onSaveAll,
  onSaveItem,
  onClose,
}: {
  items: DirtyItem[];
  saving: Set<string>;
  savingAll: boolean;
  publishing: boolean;
  saveErrors: Record<string, string>;
  onSaveAll: () => void;
  onSaveItem: (item: DirtyItem) => void;
  onClose: () => void;
}) {
  const allClean = items.length === 0;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded border border-neutral-200 bg-white text-neutral-900 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold">
            {allClean ? "All changes saved" : `${items.length} unsaved change${items.length === 1 ? "" : "s"}`}
          </h2>
          <button onClick={onClose} className={smallBtn}>
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {allClean ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Nothing left to save.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const itemSaving = saving.has(item.key);
                const itemError = saveErrors[item.key];
                return (
                  <li
                    key={item.key}
                    className="flex items-center justify-between gap-3 rounded border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm">{item.label}</p>
                      {itemError && (
                        <p className="text-xs text-red-500 dark:text-red-400">{itemError}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onSaveItem(item)}
                      disabled={itemSaving || savingAll || publishing}
                      className={`${smallBtn} shrink-0 disabled:opacity-40`}
                    >
                      {itemSaving ? "Saving…" : "Save"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            {publishing
              ? "A publish is in progress; please wait for it to finish."
              : "Each save publishes that item's changes immediately."}
          </p>
          {!allClean && (
            <button
              onClick={onSaveAll}
              disabled={savingAll || publishing}
              className="shrink-0 rounded border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
            >
              {savingAll ? "Saving all…" : `Save all (${items.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SaveBar({
  chapter,
  dirty,
  saving,
  publishing,
  error,
  onSave,
}: {
  chapter: string;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  error?: string;
  onSave: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
        {chapter}
      </span>
      <div className="flex items-center gap-2">
        {error ? <span className="text-xs text-red-500 dark:text-red-400">{error}</span> : null}
        <button
          onClick={onSave}
          disabled={!dirty || saving || publishing}
          className={
            dirty
              ? "rounded border border-emerald-400 px-2.5 py-1 text-xs text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
              : "rounded border border-neutral-300 px-2.5 py-1 text-xs text-neutral-400 dark:border-neutral-700 dark:text-neutral-600"
          }
        >
          {saving ? "Saving…" : dirty ? "Save" : "Saved"}
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  dirty,
  saving,
  publishing,
  error,
  onChange,
  onSave,
}: {
  section: Section;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  error?: string;
  onChange: (patch: Partial<Section>) => void;
  onSave: () => void;
}) {
  return (
    <section id={`section-${section.id}`} className={cardClass}>
      <SaveBar
        chapter={`${section.label} — Overview`}
        dirty={dirty}
        saving={saving}
        publishing={publishing}
        error={error}
        onSave={onSave}
      />
      <input
        className={`${titleInput} mb-4`}
        value={section.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <textarea
        rows={2}
        className="mb-6 w-full resize-none rounded bg-transparent px-1 -mx-1 text-[15px] leading-relaxed text-neutral-800 outline-none focus:ring-1 focus:ring-emerald-400 dark:text-neutral-200"
        value={section.overview}
        onChange={(e) => onChange({ overview: e.target.value })}
        placeholder="Section overview…"
      />
      <EditableBlocks
        blocks={section.facilitatorBlocks ?? []}
        onChange={(facilitatorBlocks) => onChange({ facilitatorBlocks })}
      />
    </section>
  );
}

function LessonCard({
  section,
  lesson,
  dirty,
  saving,
  publishing,
  error,
  onChangeLesson,
  onChangeActivity,
  onSave,
  onNewActivity,
}: {
  section: Section;
  lesson: Lesson;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  error?: string;
  onChangeLesson: (patch: Partial<Lesson>) => void;
  onChangeActivity: (activityId: string, patch: Partial<Activity>) => void;
  onSave: () => void;
  onNewActivity: () => void;
}) {
  const [heroPickerOpen, setHeroPickerOpen] = useState(false);

  return (
    <section id={`lesson-${section.id}-${lesson.id}`} className={cardClass}>
      <SaveBar
        chapter={section.label}
        dirty={dirty}
        saving={saving}
        publishing={publishing}
        error={error}
        onSave={onSave}
      />
      <div className="mb-4 flex items-center gap-2">
        <input
          className={`${smallInput} w-16 shrink-0`}
          value={lesson.label}
          onChange={(e) => onChangeLesson({ label: e.target.value })}
        />
        <input
          className={titleInput}
          value={lesson.title}
          onChange={(e) => onChangeLesson({ title: e.target.value })}
        />
      </div>

      <div className="mb-6 flex items-center gap-2">
        {lesson.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lesson.heroImage}
            alt=""
            className="h-14 w-14 shrink-0 rounded border border-neutral-200 object-cover dark:border-neutral-800"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-dashed border-neutral-300 text-[9px] text-neutral-400 dark:border-neutral-700">
            no image
          </div>
        )}
        <input
          className={`${smallInput} flex-1`}
          value={lesson.heroImage ?? ""}
          onChange={(e) => onChangeLesson({ heroImage: e.target.value || undefined })}
          placeholder="Hero image path"
        />
        <button onClick={() => setHeroPickerOpen(true)} className={smallBtn}>
          Browse…
        </button>
        <ImagePicker
          open={heroPickerOpen}
          onClose={() => setHeroPickerOpen(false)}
          onPick={(src) => onChangeLesson({ heroImage: src })}
        />
      </div>

      <p className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
        For Facilitators
      </p>
      <EditableBlocks
        blocks={lesson.facilitatorBlocks}
        onChange={(facilitatorBlocks) => onChangeLesson({ facilitatorBlocks })}
      />

      {lesson.activities.length > 0 && (
        <div className="mt-8 flex flex-col gap-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          {lesson.activities.map((activity) => (
            <div key={activity.id}>
              <div className="mb-3 flex items-center gap-2">
                <input
                  className={`${smallInput} w-16 shrink-0 font-semibold`}
                  value={activity.label}
                  onChange={(e) => onChangeActivity(activity.id, { label: e.target.value })}
                />
                <input
                  className="flex-1 rounded bg-transparent px-1 -mx-1 text-base font-semibold text-neutral-900 outline-none focus:ring-1 focus:ring-emerald-400 dark:text-neutral-100"
                  value={activity.title}
                  onChange={(e) => onChangeActivity(activity.id, { title: e.target.value })}
                />
              </div>
              <EditableBlocks
                blocks={activity.blocks}
                onChange={(blocks) => onChangeActivity(activity.id, { blocks })}
              />
            </div>
          ))}
        </div>
      )}
      <button onClick={onNewActivity} className={`mt-6 ${createBtn}`}>
        + New activity
      </button>
    </section>
  );
}

function PageCard({
  page,
  dirty,
  saving,
  publishing,
  error,
  onChange,
  onSave,
}: {
  page: StandalonePage;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  error?: string;
  onChange: (patch: Partial<StandalonePage>) => void;
  onSave: () => void;
}) {
  return (
    <section id={`page-${page.slug}`} className={cardClass}>
      <SaveBar
        chapter="Page"
        dirty={dirty}
        saving={saving}
        publishing={publishing}
        error={error}
        onSave={onSave}
      />
      <input
        className={`${titleInput} mb-6`}
        value={page.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <EditableBlocks blocks={page.blocks} onChange={(blocks) => onChange({ blocks })} />
    </section>
  );
}

function CreateFormShell({
  title,
  error,
  busy,
  canSubmit,
  onCancel,
  onSubmit,
  children,
}: {
  title: string;
  error?: string;
  busy: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8 rounded border border-emerald-300 bg-emerald-50/40 p-4 dark:border-emerald-700 dark:bg-emerald-900/10">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {children}
        {error ? <p className="text-xs text-red-500 dark:text-red-400">{error}</p> : null}
        <div className="flex gap-2">
          <button disabled={busy || !canSubmit} onClick={onSubmit} className={createBtn}>
            {busy ? "Creating…" : "Create"}
          </button>
          <button onClick={onCancel} className={smallBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function NewSectionForm({
  error,
  onCancel,
  onSubmit,
}: {
  error?: string;
  onCancel: () => void;
  onSubmit: (title: string, label: string, overview: string) => Promise<boolean>;
}) {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [overview, setOverview] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <CreateFormShell
      title="New section"
      error={error}
      busy={busy}
      canSubmit={title.length > 0}
      onCancel={onCancel}
      onSubmit={async () => {
        setBusy(true);
        await onSubmit(title, label, overview);
        setBusy(false);
      }}
    >
      <input className={smallInput} placeholder="Section title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input
        className={smallInput}
        placeholder="Label (e.g. IV. New Section)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <textarea
        className={`${smallInput} min-h-[3rem]`}
        placeholder="Overview"
        value={overview}
        onChange={(e) => setOverview(e.target.value)}
      />
    </CreateFormShell>
  );
}

function NewLessonForm({
  error,
  onCancel,
  onSubmit,
}: {
  error?: string;
  onCancel: () => void;
  onSubmit: (title: string, label: string) => Promise<boolean>;
}) {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <CreateFormShell
      title="New lesson"
      error={error}
      busy={busy}
      canSubmit={title.length > 0}
      onCancel={onCancel}
      onSubmit={async () => {
        setBusy(true);
        await onSubmit(title, label);
        setBusy(false);
      }}
    >
      <input className={smallInput} placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={smallInput} placeholder="Label (e.g. L5)" value={label} onChange={(e) => setLabel(e.target.value)} />
    </CreateFormShell>
  );
}

function NewActivityForm({
  error,
  onCancel,
  onSubmit,
}: {
  error?: string;
  onCancel: () => void;
  onSubmit: (title: string, label: string) => Promise<boolean>;
}) {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <CreateFormShell
      title="New activity"
      error={error}
      busy={busy}
      canSubmit={title.length > 0}
      onCancel={onCancel}
      onSubmit={async () => {
        setBusy(true);
        await onSubmit(title, label);
        setBusy(false);
      }}
    >
      <input className={smallInput} placeholder="Activity title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={smallInput} placeholder="Label (e.g. A3)" value={label} onChange={(e) => setLabel(e.target.value)} />
    </CreateFormShell>
  );
}

// Verbatim (content-wise) copy of PortalApp.tsx's Typography reference
// modal — same measured type scale, same overlay/card chrome — so the
// client sees the exact same design constraints Kendall does.
function TypographyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded border border-neutral-200 bg-white text-neutral-900 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold">Typography reference</h2>
          <button onClick={onClose} className={smallBtn}>
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 text-xs">
          <p className="mb-3 text-neutral-500 dark:text-neutral-400">
            This is the site&apos;s locked type system. The editor never lets you change size,
            weight, or color directly — only which of these roles a block uses.
          </p>

          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="text-neutral-500 dark:text-neutral-400">Trim size:</span>{" "}
              {TRIM_SIZE.widthIn}in × {TRIM_SIZE.heightIn}in
            </div>
            <div>
              <span className="text-neutral-500 dark:text-neutral-400">Font family:</span>{" "}
              {FONT_FAMILY}
            </div>
            <div className="col-span-2">
              <span className="text-neutral-500 dark:text-neutral-400">Margins:</span> outer{" "}
              {MARGINS.outerPt}pt · body column {MARGINS.bodyLeftPt}–{MARGINS.bodyRightPt}pt (
              {MARGINS.bodyWidthIn}in wide)
            </div>
          </div>

          <p className="mb-1 font-medium">Type scale (ratio relative to {BODY_SIZE_PT}pt body)</p>
          <table className="mb-4 w-full table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[42%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="py-1 pr-2 font-medium">Role</th>
                <th className="py-1 pr-2 font-medium">Size</th>
                <th className="py-1 pr-2 font-medium">Weight</th>
                <th className="py-1 pr-2 font-medium">Ratio</th>
                <th className="py-1 font-medium">Sample</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_SCALE.map((r) => (
                <tr key={r.role} className="border-b border-neutral-100 align-top dark:border-neutral-900">
                  <td className="break-words py-1.5 pr-2">
                    {r.role}
                    {r.note && (
                      <div className="text-[10px] text-neutral-400 dark:text-neutral-600">{r.note}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-1.5 pr-2">{r.sizePt}pt</td>
                  <td className="whitespace-nowrap py-1.5 pr-2">{r.weight}</td>
                  <td className="whitespace-nowrap py-1.5 pr-2">{(r.sizePt / BODY_SIZE_PT).toFixed(2)}×</td>
                  <td className="break-words py-1.5 text-neutral-600 dark:text-neutral-400">{r.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mb-1 font-medium">Letter-spacing (site tokens)</p>
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[64%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <th className="py-1 pr-2 font-medium">Token</th>
                <th className="py-1 pr-2 font-medium">Value</th>
                <th className="py-1 font-medium">Usage</th>
              </tr>
            </thead>
            <tbody>
              {LETTER_SPACING_TOKENS.map((t) => (
                <tr key={t.token} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="whitespace-nowrap py-1.5 pr-2">{t.token}</td>
                  <td className="whitespace-nowrap py-1.5 pr-2">{t.valuePx}px</td>
                  <td className="break-words py-1.5 text-neutral-600 dark:text-neutral-400">{t.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
