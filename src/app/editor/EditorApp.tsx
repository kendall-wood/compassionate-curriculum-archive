"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Section, StandalonePage, ContentBlock } from "@/data/types";
import { ContentRenderer } from "@/components/ContentRenderer";
import { BlockEditor } from "./BlockEditor";
import { PublishStatus } from "./PublishStatus";
import { useDeployStatus } from "./useDeployStatus";

interface TreeActivity {
  id: string;
  label: string;
  title: string;
}
interface TreeLesson {
  id: string;
  label: string;
  title: string;
  activities: TreeActivity[];
}
interface TreeSection {
  id: string;
  label: string;
  title: string;
  lessons: TreeLesson[];
}
interface Tree {
  sections: TreeSection[];
  pages: { slug: string; title: string }[];
}

type Selection =
  | { kind: "section"; sectionId: string }
  | { kind: "lesson"; sectionId: string; lessonId: string }
  | { kind: "activity"; sectionId: string; lessonId: string; activityId: string }
  | { kind: "page"; slug: string };

const inputClass =
  "w-full rounded border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";
const primaryButton =
  "rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-40";
const treeButton = "block w-full truncate rounded px-2 py-1 text-left text-sm hover:bg-neutral-100";
const treeButtonActive = "block w-full truncate rounded bg-neutral-900 px-2 py-1 text-left text-sm text-white";

export function EditorApp() {
  const router = useRouter();
  const [tree, setTree] = useState<Tree | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [page, setPage] = useState<StandalonePage | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastCommitSha, setLastCommitSha] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<
    null | "section" | "lesson" | "activity" | "page"
  >(null);
  const deployStatus = useDeployStatus(lastCommitSha);
  const publishing = deployStatus === "publishing";

  const refreshTree = useCallback(() => {
    fetch("/api/editor/tree")
      .then((r) => r.json())
      .then(setTree)
      .catch(() => setError("Couldn't load the content list."));
  }, []);

  useEffect(refreshTree, [refreshTree]);

  const select = useCallback(async (sel: Selection) => {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    setSelection(sel);
    setError(null);
    setPage(null);
    setSection(null);
    setDirty(false);
    setCreating(null);
    if (sel.kind === "page") {
      const res = await fetch(`/api/editor/content?kind=page&slug=${encodeURIComponent(sel.slug)}`);
      const data = await res.json();
      setPage(data.page ?? null);
    } else {
      const res = await fetch(`/api/editor/content?kind=section&id=${encodeURIComponent(sel.sectionId)}`);
      const data = await res.json();
      setSection(data.section ?? null);
    }
  }, [dirty]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const body =
        selection?.kind === "page"
          ? { kind: "page", slug: page!.slug, page }
          : { kind: "section", sectionId: section!.id, section };
      const res = await fetch("/api/editor/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Save failed.");
        return;
      }
      setDirty(false);
      setLastCommitSha(data.commitSha);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/editor/logout", { method: "POST" });
    router.push("/editor/login");
  }

  return (
    <div className="flex h-screen flex-col bg-white text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-2">
        <h1 className="text-sm font-semibold">Compassionate Curriculum — Editor</h1>
        <div className="flex items-center gap-3">
          <PublishStatus status={deployStatus} />
          <button onClick={logout} className="text-sm text-neutral-500 hover:text-neutral-900">
            Log out
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-neutral-200 p-3">
          {tree ? (
            <Sidebar
              tree={tree}
              selection={selection}
              onSelect={select}
              creating={creating}
              setCreating={setCreating}
              onCreated={refreshTree}
            />
          ) : (
            <p className="text-sm text-neutral-400">Loading…</p>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          {error ? (
            <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {selection?.kind === "page" && page ? (
            <PageEditor page={page} onChange={(p) => { setPage(p); setDirty(true); }} />
          ) : null}

          {selection && selection.kind !== "page" && section ? (
            <SectionScopedEditor
              selection={selection}
              section={section}
              onChange={(s) => { setSection(s); setDirty(true); }}
            />
          ) : null}

          {!selection ? (
            <p className="text-neutral-400">
              Choose something to edit on the left, or create something new.
            </p>
          ) : null}

          {selection && (section || page) ? (
            <div className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-neutral-200 bg-white pt-4">
              <button
                onClick={save}
                disabled={!dirty || saving || publishing}
                className={primaryButton}
              >
                {saving ? "Saving…" : dirty ? "Save & publish" : "Saved"}
              </button>
              <span className="text-xs text-neutral-400">
                {publishing
                  ? "Please wait for the current publish to finish before saving again."
                  : "Publishing takes about a minute — the site rebuilds automatically."}
              </span>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  tree,
  selection,
  onSelect,
  creating,
  setCreating,
  onCreated,
}: {
  tree: Tree;
  selection: Selection | null;
  onSelect: (s: Selection) => void;
  creating: null | "section" | "lesson" | "activity" | "page";
  setCreating: (c: null | "section" | "lesson" | "activity" | "page") => void;
  onCreated: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Pages
          </span>
          <button
            className="text-xs text-neutral-500 hover:text-neutral-900"
            onClick={() => setCreating("page")}
          >
            + New
          </button>
        </div>
        {tree.pages.map((p) => (
          <button
            key={p.slug}
            className={
              selection?.kind === "page" && selection.slug === p.slug
                ? treeButtonActive
                : treeButton
            }
            onClick={() => onSelect({ kind: "page", slug: p.slug })}
          >
            {p.title}
          </button>
        ))}
        {creating === "page" ? (
          <NewPageForm onDone={() => { setCreating(null); onCreated(); }} onCancel={() => setCreating(null)} />
        ) : null}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Sections
          </span>
          <button
            className="text-xs text-neutral-500 hover:text-neutral-900"
            onClick={() => setCreating("section")}
          >
            + New
          </button>
        </div>
        {tree.sections.map((s) => (
          <div key={s.id}>
            <div className="flex items-center gap-1">
              <button className="px-1 text-xs text-neutral-400" onClick={() => toggle(s.id)}>
                {expanded.has(s.id) ? "▾" : "▸"}
              </button>
              <button
                className={
                  selection?.kind === "section" && selection.sectionId === s.id
                    ? treeButtonActive
                    : treeButton
                }
                onClick={() => onSelect({ kind: "section", sectionId: s.id })}
              >
                {s.label} · {s.title}
              </button>
            </div>
            {expanded.has(s.id) ? (
              <div className="ml-5 border-l border-neutral-100 pl-2">
                {s.lessons.map((l) => (
                  <div key={l.id}>
                    <div className="flex items-center gap-1">
                      <button
                        className="px-1 text-xs text-neutral-400"
                        onClick={() => toggle(`${s.id}/${l.id}`)}
                      >
                        {expanded.has(`${s.id}/${l.id}`) ? "▾" : "▸"}
                      </button>
                      <button
                        className={
                          selection?.kind === "lesson" &&
                          selection.sectionId === s.id &&
                          selection.lessonId === l.id
                            ? treeButtonActive
                            : treeButton
                        }
                        onClick={() => onSelect({ kind: "lesson", sectionId: s.id, lessonId: l.id })}
                      >
                        {l.label} · {l.title}
                      </button>
                    </div>
                    {expanded.has(`${s.id}/${l.id}`) ? (
                      <div className="ml-5 border-l border-neutral-100 pl-2">
                        {l.activities.map((a) => (
                          <button
                            key={a.id}
                            className={
                              selection?.kind === "activity" &&
                              selection.sectionId === s.id &&
                              selection.lessonId === l.id &&
                              selection.activityId === a.id
                                ? treeButtonActive
                                : treeButton
                            }
                            onClick={() =>
                              onSelect({
                                kind: "activity",
                                sectionId: s.id,
                                lessonId: l.id,
                                activityId: a.id,
                              })
                            }
                          >
                            {a.label} · {a.title}
                          </button>
                        ))}
                        <button
                          className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-900"
                          onClick={() => setCreating("activity")}
                        >
                          + New activity
                        </button>
                        {creating === "activity" &&
                        selection?.kind === "lesson" &&
                        selection.sectionId === s.id &&
                        selection.lessonId === l.id ? (
                          <NewActivityForm
                            sectionId={s.id}
                            section={null}
                            lessonId={l.id}
                            onDone={() => { setCreating(null); onCreated(); }}
                            onCancel={() => setCreating(null)}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
                <button
                  className="px-2 py-1 text-xs text-neutral-400 hover:text-neutral-900"
                  onClick={() => {
                    onSelect({ kind: "section", sectionId: s.id });
                    setCreating("lesson");
                  }}
                >
                  + New lesson
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {creating === "section" ? (
          <NewSectionForm onDone={() => { setCreating(null); onCreated(); }} onCancel={() => setCreating(null)} />
        ) : null}
        {creating === "lesson" && selection?.kind === "section" ? (
          <NewLessonForm
            sectionId={selection.sectionId}
            onDone={() => { setCreating(null); onCreated(); }}
            onCancel={() => setCreating(null)}
          />
        ) : null}
      </div>
    </div>
  );
}

function PageEditor({
  page,
  onChange,
}: {
  page: StandalonePage;
  onChange: (p: StandalonePage) => void;
}) {
  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Title
        </label>
        <input
          className={`${inputClass} mb-4`}
          value={page.title}
          onChange={(e) => onChange({ ...page, title: e.target.value })}
        />
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Content
        </label>
        <BlockEditor blocks={page.blocks} onChange={(blocks) => onChange({ ...page, blocks })} />
      </div>
      <PreviewPane title={page.title} blocks={page.blocks} />
    </div>
  );
}

function SectionScopedEditor({
  selection,
  section,
  onChange,
}: {
  selection: Exclude<Selection, { kind: "page" }>;
  section: Section;
  onChange: (s: Section) => void;
}) {
  if (selection.kind === "section") {
    return (
      <div className="flex gap-8">
        <div className="flex-1">
          <Field label="Label" value={section.label} onChange={(v) => onChange({ ...section, label: v })} />
          <Field label="Title" value={section.title} onChange={(v) => onChange({ ...section, title: v })} />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Overview
          </label>
          <textarea
            className={`${inputClass} mb-4 min-h-[5rem]`}
            value={section.overview}
            onChange={(e) => onChange({ ...section, overview: e.target.value })}
          />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
            For Facilitators
          </label>
          <BlockEditor
            blocks={section.facilitatorBlocks ?? []}
            onChange={(blocks) => onChange({ ...section, facilitatorBlocks: blocks })}
          />
        </div>
        <PreviewPane title={section.title} blocks={section.facilitatorBlocks ?? []} />
      </div>
    );
  }

  const lessonIdx = section.lessons.findIndex((l) => l.id === selection.lessonId);
  if (lessonIdx === -1) return <p className="text-red-600">Lesson not found.</p>;
  const lesson = section.lessons[lessonIdx];

  function updateLesson(patch: Partial<typeof lesson>) {
    const lessons = section.lessons.slice();
    lessons[lessonIdx] = { ...lesson, ...patch };
    onChange({ ...section, lessons });
  }

  if (selection.kind === "lesson") {
    return (
      <div className="flex gap-8">
        <div className="flex-1">
          <Field label="Label" value={lesson.label} onChange={(v) => updateLesson({ label: v })} />
          <Field label="Title" value={lesson.title} onChange={(v) => updateLesson({ title: v })} />
          <Field
            label="Hero image path"
            value={lesson.heroImage ?? ""}
            onChange={(v) => updateLesson({ heroImage: v || undefined })}
          />
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
            For Facilitators
          </label>
          <BlockEditor
            blocks={lesson.facilitatorBlocks}
            onChange={(blocks) => updateLesson({ facilitatorBlocks: blocks })}
          />
        </div>
        <PreviewPane title={lesson.title} blocks={lesson.facilitatorBlocks} />
      </div>
    );
  }

  const activityIdx = lesson.activities.findIndex((a) => a.id === selection.activityId);
  if (activityIdx === -1) return <p className="text-red-600">Activity not found.</p>;
  const activity = lesson.activities[activityIdx];

  function updateActivity(patch: Partial<typeof activity>) {
    const activities = lesson.activities.slice();
    activities[activityIdx] = { ...activity, ...patch };
    updateLesson({ activities });
  }

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <Field label="Label" value={activity.label} onChange={(v) => updateActivity({ label: v })} />
        <Field label="Title" value={activity.title} onChange={(v) => updateActivity({ title: v })} />
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Content
        </label>
        <BlockEditor blocks={activity.blocks} onChange={(blocks) => updateActivity({ blocks })} />
      </div>
      <PreviewPane title={activity.title} blocks={activity.blocks} />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </label>
      <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function PreviewPane({ title, blocks }: { title: string; blocks: ContentBlock[] }) {
  return (
    <div className="w-[28rem] shrink-0 rounded border border-neutral-200 bg-neutral-50 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Live preview — exactly how this renders on the site
      </p>
      <div className="cc-page bg-bg text-fg">
        <h2 className="mb-4 text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em]">{title}</h2>
        <ContentRenderer blocks={blocks} />
      </div>
    </div>
  );
}

function idSlug(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NewSectionForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [overview, setOverview] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    const id = idSlug(title);
    if (!id) return;
    setBusy(true);
    setErr(null);
    const section: Section = { id, label: label || title, title, overview, facilitatorBlocks: [], lessons: [] };
    const res = await fetch("/api/editor/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "section", sectionId: id, section, isNew: true }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json()).error ?? "Failed to create section.");
      return;
    }
    onDone();
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded border border-neutral-200 p-2">
      <input className={inputClass} placeholder="Section title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={inputClass} placeholder="Label (e.g. IV. New Section)" value={label} onChange={(e) => setLabel(e.target.value)} />
      <textarea className={`${inputClass} min-h-[3rem]`} placeholder="Overview" value={overview} onChange={(e) => setOverview(e.target.value)} />
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <div className="flex gap-2">
        <button className={primaryButton} disabled={busy || !title} onClick={submit}>
          {busy ? "Creating…" : "Create"}
        </button>
        <button className="text-sm text-neutral-500" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function NewLessonForm({
  sectionId,
  onDone,
  onCancel,
}: {
  sectionId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    const id = idSlug(title);
    if (!id) return;
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/editor/content?kind=section&id=${sectionId}`);
    const { section } = (await res.json()) as { section: Section };
    section.lessons.push({
      id,
      label: label || `L${section.lessons.length + 1}`,
      title,
      sectionId,
      facilitatorBlocks: [],
      activities: [],
    });
    const saveRes = await fetch("/api/editor/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "section", sectionId, section }),
    });
    setBusy(false);
    if (!saveRes.ok) {
      setErr((await saveRes.json()).error ?? "Failed to create lesson.");
      return;
    }
    onDone();
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded border border-neutral-200 p-2">
      <input className={inputClass} placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={inputClass} placeholder="Label (e.g. L5)" value={label} onChange={(e) => setLabel(e.target.value)} />
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <div className="flex gap-2">
        <button className={primaryButton} disabled={busy || !title} onClick={submit}>
          {busy ? "Creating…" : "Create"}
        </button>
        <button className="text-sm text-neutral-500" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function NewActivityForm({
  sectionId,
  lessonId,
  onDone,
  onCancel,
}: {
  sectionId: string;
  section: Section | null;
  lessonId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    const id = idSlug(title);
    if (!id) return;
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/editor/content?kind=section&id=${sectionId}`);
    const { section } = (await res.json()) as { section: Section };
    const lesson = section.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      setErr("Lesson not found.");
      setBusy(false);
      return;
    }
    lesson.activities.push({
      id,
      label: label || `A${lesson.activities.length + 1}`,
      title,
      blocks: [],
    });
    const saveRes = await fetch("/api/editor/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "section", sectionId, section }),
    });
    setBusy(false);
    if (!saveRes.ok) {
      setErr((await saveRes.json()).error ?? "Failed to create activity.");
      return;
    }
    onDone();
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded border border-neutral-200 p-2">
      <input className={inputClass} placeholder="Activity title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className={inputClass} placeholder="Label (e.g. A3)" value={label} onChange={(e) => setLabel(e.target.value)} />
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <div className="flex gap-2">
        <button className={primaryButton} disabled={busy || !title} onClick={submit}>
          {busy ? "Creating…" : "Create"}
        </button>
        <button className="text-sm text-neutral-500" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function NewPageForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    const slug = idSlug(title);
    if (!slug) return;
    setBusy(true);
    setErr(null);
    const page: StandalonePage = { id: slug, slug, title, blocks: [] };
    const res = await fetch("/api/editor/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "page", slug, page, isNew: true }),
    });
    setBusy(false);
    if (!res.ok) {
      setErr((await res.json()).error ?? "Failed to create page.");
      return;
    }
    onDone();
  }

  return (
    <div className="mt-2 flex flex-col gap-2 rounded border border-neutral-200 p-2">
      <input className={inputClass} placeholder="Page title" value={title} onChange={(e) => setTitle(e.target.value)} />
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <div className="flex gap-2">
        <button className={primaryButton} disabled={busy || !title} onClick={submit}>
          {busy ? "Creating…" : "Create"}
        </button>
        <button className="text-sm text-neutral-500" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
