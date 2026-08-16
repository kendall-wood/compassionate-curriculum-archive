"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  TYPE_SCALE,
  LETTER_SPACING_TOKENS,
  TRIM_SIZE,
  MARGINS,
  FONT_FAMILY,
  BODY_SIZE_PT,
  SITE_TYPE_SPECS,
} from "./typography-spec";

interface PageEntry {
  page: number;
  render: string;
  text: string;
  imageIds: string[];
}
interface EmbeddedImage {
  id: string;
  file: string;
  width: number;
  height: number;
  pages: number[];
  recurring: boolean;
}
interface Manifest {
  source: string;
  generatedAt: string;
  pageCount: number;
  pages: PageEntry[];
  embeddedImages: Record<string, EmbeddedImage>;
}
interface LibraryImage {
  rootId: "cc_images" | "public_images";
  relPath: string;
  name: string;
  ext: string;
  previewable: boolean;
  size: number;
  code: { section: string; lesson: string; activity: string } | null;
  url: string;
}

// Every lesson content page carries a running header in this exact form,
// e.g. "I. BELOVED COMMUNITY · L2" or "III. MEDIA, NARRATIVE, & FUTURING · L4".
// Cover/TOC/intro pages mention section names too but never in this combined
// header+lesson form, so matching on it (rather than the name alone) avoids
// those pages contaminating the carried-forward section/lesson state.
const RUNNING_HEADER_RE =
  /(BELOVED COMMUNITY|RESTORATIVE PRACTICES|MEDIA,\s*NARRATIVE,?\s*&?\s*FUTURING)\s*·\s*L(\d+)/i;

function sectionCode(name: string): string {
  const n = name.toUpperCase();
  if (n.includes("BELOVED")) return "BC";
  if (n.includes("RESTORATIVE")) return "RP";
  return "MNF";
}

function completedKey(source: string) {
  return `portal:${source}:completed`;
}
function lastPageKey(source: string) {
  return `portal:${source}:lastPage`;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// navigator.clipboard requires a secure context + user gesture and can
// silently reject in some embedded/automated browsers; the hidden-textarea +
// execCommand path covers those cases.
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function PortalApp() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [library, setLibrary] = useState<LibraryImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [tab, setTab] = useState<"text" | "images">("text");
  const [librarySearch, setLibrarySearch] = useState("");
  const [showFullLibrary, setShowFullLibrary] = useState(false);
  const [pageJump, setPageJump] = useState("");
  const [copyFlash, setCopyFlash] = useState(false);
  const [copiedLine, setCopiedLine] = useState<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showTypography, setShowTypography] = useState(false);
  const [typographyCopyFlash, setTypographyCopyFlash] = useState(false);
  const [viewMode, setViewMode] = useState<"spread" | "document" | "qa">("spread");
  const initializedFromStorage = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem("portal-theme");
    setTheme(stored === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("portal-theme", next);
      return next;
    });
  }, []);

  useEffect(() => {
    fetch("/api/portal/manifest")
      .then((r) => {
        if (!r.ok) throw new Error("manifest not found — run scripts/portal-extract.py");
        return r.json();
      })
      .then((m: Manifest) => setManifest(m))
      .catch((e) => setError(String(e.message ?? e)));
    fetch("/api/portal/library")
      .then((r) => r.json())
      .then((d: { images: LibraryImage[] }) => setLibrary(d.images))
      .catch(() => setLibrary([]));
  }, []);

  // Restore completed-page set + last-viewed page once the manifest (and
  // thus its localStorage namespace) is known.
  useEffect(() => {
    if (!manifest || initializedFromStorage.current) return;
    initializedFromStorage.current = true;
    try {
      const rawCompleted = localStorage.getItem(completedKey(manifest.source));
      if (rawCompleted) setCompleted(new Set(JSON.parse(rawCompleted)));
      const rawLast = localStorage.getItem(lastPageKey(manifest.source));
      if (rawLast) setCurrentPage(Math.min(Number(rawLast), manifest.pageCount));
    } catch {
      /* ignore malformed storage */
    }
  }, [manifest]);

  const persistCompleted = useCallback(
    (next: Set<number>) => {
      if (!manifest) return;
      localStorage.setItem(completedKey(manifest.source), JSON.stringify([...next]));
    },
    [manifest]
  );

  const toggleCompleted = useCallback(
    (page: number) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(page)) next.delete(page);
        else next.add(page);
        persistCompleted(next);
        return next;
      });
    },
    [persistCompleted]
  );

  const goToPage = useCallback(
    (n: number) => {
      if (!manifest) return;
      const clamped = Math.max(1, Math.min(n, manifest.pageCount));
      setCurrentPage(clamped);
      localStorage.setItem(lastPageKey(manifest.source), String(clamped));
    },
    [manifest]
  );

  // Book-style spread: page 1 is a lone cover (recto only); from page 2 on,
  // even pages sit on the left (verso) paired with the following odd/right
  // (recto) page — the usual print-book convention.
  const spread = useMemo(() => {
    if (!manifest) return { left: 1, right: null as number | null };
    if (currentPage <= 1) return { left: 1, right: null as number | null };
    const left = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const right = left + 1 <= manifest.pageCount ? left + 1 : null;
    return { left, right };
  }, [manifest, currentPage]);

  const goToPrevSpread = useCallback(() => {
    if (currentPage <= 2) {
      goToPage(1);
      return;
    }
    goToPage(spread.left - 2);
  }, [currentPage, spread, goToPage]);

  const goToNextSpread = useCallback(() => {
    if (currentPage === 1) {
      goToPage(2);
      return;
    }
    goToPage(spread.left + 2);
  }, [currentPage, spread, goToPage]);

  const jumpToNextIncomplete = useCallback(() => {
    if (!manifest) return;
    for (let i = 1; i <= manifest.pageCount; i++) {
      const candidate = ((currentPage - 1 + i) % manifest.pageCount) + 1;
      if (!completed.has(candidate)) {
        goToPage(candidate);
        return;
      }
    }
  }, [manifest, currentPage, completed, goToPage]);

  // Keyboard nav: arrows to page through, "c" to toggle the current page
  // complete. Skipped while typing in the search/jump inputs.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") goToNextSpread();
      else if (e.key === "ArrowLeft") goToPrevSpread();
      else if (e.key.toLowerCase() === "c") toggleCompleted(currentPage);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, goToNextSpread, goToPrevSpread, toggleCompleted]);

  // One pass over the book to tag each page with the section/lesson it
  // falls under, so the library panel can suggest relevant images. Best
  // effort — driven by heading text and L<n> mentions, not exact.
  const pageMeta = useMemo(() => {
    if (!manifest) return new Map<number, { section: string | null; lesson: string | null }>();
    const out = new Map<number, { section: string | null; lesson: string | null }>();
    let section: string | null = null;
    let lesson: string | null = null;
    for (const p of manifest.pages) {
      const match = p.text.match(RUNNING_HEADER_RE);
      if (match) {
        section = sectionCode(match[1]);
        lesson = match[2];
      }
      out.set(p.page, { section, lesson });
    }
    return out;
  }, [manifest]);

  const pageEntry = manifest?.pages.find((p) => p.page === currentPage);
  const currentMeta = pageMeta.get(currentPage);

  const pageImages = useMemo(() => {
    if (!manifest || !pageEntry) return [];
    return pageEntry.imageIds.map((id) => manifest.embeddedImages[id]).filter(Boolean);
  }, [manifest, pageEntry]);

  const suggestedLibraryImages = useMemo(() => {
    if (!currentMeta?.section) return [];
    return library
      .filter((img) => img.code && img.code.section.toUpperCase() === currentMeta.section)
      .sort((a, b) => {
        const aMatch = a.code?.lesson === currentMeta.lesson ? 0 : 1;
        const bMatch = b.code?.lesson === currentMeta.lesson ? 0 : 1;
        return aMatch - bMatch;
      });
  }, [library, currentMeta]);

  const filteredLibrary = useMemo(() => {
    const q = librarySearch.trim().toLowerCase();
    if (!q) return library;
    return library.filter(
      (img) => img.name.toLowerCase().includes(q) || img.relPath.toLowerCase().includes(q)
    );
  }, [library, librarySearch]);

  const pageLines = useMemo(() => (pageEntry?.text ?? "").split("\n"), [pageEntry]);

  const copyAllText = useCallback(() => {
    if (!pageEntry) return;
    copyToClipboard(pageEntry.text).then((ok) => {
      if (!ok) return;
      setCopyFlash(true);
      setTimeout(() => setCopyFlash(false), 1200);
    });
  }, [pageEntry]);

  const copyLine = useCallback((line: string, index: number) => {
    copyToClipboard(line).then((ok) => {
      if (!ok) return;
      setCopiedLine(index);
      setTimeout(() => setCopiedLine((cur) => (cur === index ? null : cur)), 1000);
    });
  }, []);

  const copyTypographySpec = useCallback(() => {
    const lines: string[] = [];
    lines.push(`Trim size: ${TRIM_SIZE.widthIn}in x ${TRIM_SIZE.heightIn}in (${TRIM_SIZE.widthPt}pt x ${TRIM_SIZE.heightPt}pt)`);
    lines.push(`Font family: ${FONT_FAMILY}`);
    lines.push(
      `Margins: outer ${MARGINS.outerPt}pt, body column ${MARGINS.bodyLeftPt}–${MARGINS.bodyRightPt}pt (${MARGINS.bodyWidthIn}in wide)`
    );
    lines.push("");
    lines.push(`Type scale (ratio relative to ${BODY_SIZE_PT}pt body):`);
    for (const r of TYPE_SCALE) {
      const ratio = (r.sizePt / BODY_SIZE_PT).toFixed(2);
      lines.push(`- ${r.role}: ${r.sizePt}pt ${r.weight}, ${r.color} (${ratio}x body) — "${r.sample}"${r.note ? ` [${r.note}]` : ""}`);
    }
    lines.push("");
    lines.push("Letter-spacing (from site tokens):");
    for (const t of LETTER_SPACING_TOKENS) {
      lines.push(`- ${t.token}: ${t.valuePx}px — ${t.usage}`);
    }
    copyToClipboard(lines.join("\n")).then((ok) => {
      if (!ok) return;
      setTypographyCopyFlash(true);
      setTimeout(() => setTypographyCopyFlash(false), 1200);
    });
  }, []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="text-lg font-medium text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }
  if (!manifest) {
    return (
      <div className="flex h-screen items-center justify-center text-neutral-500 dark:text-neutral-400">
        Loading…
      </div>
    );
  }

  const progressPct = Math.round((completed.size / manifest.pageCount) * 100);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">InDesign Portal</h1>
          <p className="text-xs text-neutral-500">
            {manifest.source} · {manifest.pageCount} pages
          </p>
        </div>
        {viewMode === "spread" && (
          <div className="flex max-w-md flex-1 items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs text-neutral-500 dark:text-neutral-400">
              {completed.size}/{manifest.pageCount} complete
            </span>
          </div>
        )}
        {(viewMode === "document" || viewMode === "qa") && <div className="flex-1" />}
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded border border-neutral-300 dark:border-neutral-700">
            <button
              onClick={() => setViewMode("spread")}
              className={`px-2.5 py-1.5 text-xs ${
                viewMode === "spread"
                  ? "bg-neutral-200 dark:bg-neutral-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Spread
            </button>
            <button
              onClick={() => setViewMode("document")}
              className={`px-2.5 py-1.5 text-xs ${
                viewMode === "document"
                  ? "bg-neutral-200 dark:bg-neutral-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Website
            </button>
            <button
              onClick={() => setViewMode("qa")}
              className={`px-2.5 py-1.5 text-xs ${
                viewMode === "qa"
                  ? "bg-neutral-200 dark:bg-neutral-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              QA Check
            </button>
          </div>
          <button
            onClick={() => setShowTypography(true)}
            className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Typography
          </button>
          <button
            onClick={toggleTheme}
            title="Toggle light / dark"
            className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {theme === "dark" ? "☀︎ Light" : "☾ Dark"}
          </button>
          {viewMode === "spread" && (
            <button
              onClick={jumpToNextIncomplete}
              className="whitespace-nowrap rounded border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Next incomplete →
            </button>
          )}
        </div>
      </header>

      {viewMode === "document" && <SiteView />}
      {viewMode === "qa" && <QAView />}

      {viewMode === "spread" && (
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr_400px]">
        {/* Page grid */}
        <aside className="min-h-0 overflow-y-auto border-r border-neutral-200 p-2 dark:border-neutral-800">
          <div className="grid grid-cols-4 gap-1">
            {manifest.pages.map((p) => {
              const isDone = completed.has(p.page);
              const isCurrent = p.page === currentPage;
              return (
                <button
                  key={p.page}
                  onClick={() => goToPage(p.page)}
                  title={`Page ${p.page}${isDone ? " — complete" : ""}`}
                  className={[
                    "relative aspect-[3/4] flex items-center justify-center rounded border text-[11px]",
                    isCurrent
                      ? "border-emerald-400 ring-1 ring-emerald-400"
                      : "border-neutral-200 dark:border-neutral-800",
                    isDone
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800",
                  ].join(" ")}
                >
                  {p.page}
                  {isDone && <span className="absolute right-0.5 top-0.5 text-[9px]">✓</span>}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Viewer */}
        <main className="flex min-h-0 flex-col">
          <div className="flex items-center justify-center gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
            <button
              onClick={goToPrevSpread}
              disabled={currentPage <= 1}
              className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30 dark:border-neutral-700"
            >
              ← Prev
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(pageJump);
                if (n) goToPage(n);
                setPageJump("");
              }}
              className="flex items-center gap-1"
            >
              <input
                value={pageJump}
                onChange={(e) => setPageJump(e.target.value)}
                placeholder={String(currentPage)}
                className="w-14 rounded border border-neutral-300 bg-white px-2 py-1 text-center text-xs dark:border-neutral-700 dark:bg-neutral-900"
              />
              <span className="text-xs text-neutral-500">/ {manifest.pageCount}</span>
            </form>
            <button
              onClick={goToNextSpread}
              disabled={currentPage >= manifest.pageCount}
              className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-30 dark:border-neutral-700"
            >
              Next →
            </button>
            <span className="mx-2 h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
            >
              −
            </button>
            <span className="w-10 text-center text-xs text-neutral-500 dark:text-neutral-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="rounded border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
            >
              +
            </button>
            <span className="mx-2 h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
            <label className="flex items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                checked={completed.has(currentPage)}
                onChange={() => toggleCompleted(currentPage)}
                className="h-3.5 w-3.5"
              />
              Mark page complete
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-neutral-100 p-6 dark:bg-neutral-900/50">
            <div className="mx-auto flex w-fit items-start gap-1">
              <SpreadPage
                page={spread.left}
                manifest={manifest}
                active={currentPage === spread.left}
                onSelect={goToPage}
                side="left"
                zoom={zoom}
              />
              {spread.right && (
                <SpreadPage
                  page={spread.right}
                  manifest={manifest}
                  active={currentPage === spread.right}
                  onSelect={goToPage}
                  side="right"
                  zoom={zoom}
                />
              )}
            </div>
          </div>
        </main>

        {/* Side panel */}
        <aside className="flex min-h-0 flex-col border-l border-neutral-200 dark:border-neutral-800">
          <div className="flex border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setTab("text")}
              className={`flex-1 px-3 py-2 text-xs ${
                tab === "text" ? "bg-neutral-100 dark:bg-neutral-800" : ""
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setTab("images")}
              className={`flex-1 px-3 py-2 text-xs ${
                tab === "images" ? "bg-neutral-100 dark:bg-neutral-800" : ""
              }`}
            >
              Images {pageImages.length > 0 && `(${pageImages.length})`}
            </button>
          </div>

          {tab === "text" && (
            <div className="flex min-h-0 flex-1 flex-col p-3">
              <button
                onClick={copyAllText}
                className="mb-2 rounded border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {copyFlash ? "Copied ✓" : "Copy all page text"}
              </button>
              <p className="mb-1 text-[10px] text-neutral-500 dark:text-neutral-600">
                Select any span to copy it, or hover a line for a one-click copy.
              </p>
              <div className="min-h-0 flex-1 select-text overflow-y-auto rounded border border-neutral-200 bg-white p-2 text-xs leading-relaxed text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                {pageLines.map((line, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-2 rounded px-1 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                  >
                    <span className="flex-1 whitespace-pre-wrap">{line || " "}</span>
                    {line.trim() && (
                      <button
                        onClick={() => copyLine(line, i)}
                        className="shrink-0 rounded border border-neutral-300 px-1.5 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 dark:border-neutral-700"
                      >
                        {copiedLine === i ? "✓" : "Copy"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "images" && (
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">On this page</p>
              {pageImages.length === 0 && (
                <p className="mb-4 text-xs text-neutral-400 dark:text-neutral-600">
                  No embedded images on this page.
                </p>
              )}
              <div className="mb-4 grid grid-cols-2 gap-2">
                {pageImages.map((img) => (
                  <ImageCard
                    key={img.id}
                    thumbUrl={`/api/portal/asset?kind=embedded&file=${encodeURIComponent(img.file)}&v=${manifest.generatedAt}`}
                    downloadUrl={`/api/portal/asset?kind=embedded&file=${encodeURIComponent(img.file)}&download=1&v=${manifest.generatedAt}`}
                    label={`${img.width}×${img.height}`}
                    filename={img.file}
                  />
                ))}
              </div>

              {suggestedLibraryImages.length > 0 && (
                <>
                  <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Suggested from library ({currentMeta?.section}
                    {currentMeta?.lesson ? ` L${currentMeta.lesson}` : ""})
                  </p>
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {suggestedLibraryImages.slice(0, 12).map((img) => (
                      <ImageCard
                        key={img.rootId + img.relPath}
                        thumbUrl={img.previewable ? img.url : null}
                        downloadUrl={`${img.url}${img.url.includes("?") ? "&" : "?"}download=1`}
                        label={img.name}
                        filename={img.name}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setShowFullLibrary((v) => !v)}
                className="mb-2 text-xs text-neutral-500 underline dark:text-neutral-400"
              >
                {showFullLibrary ? "Hide" : "Browse"} full image library ({library.length})
              </button>
              {showFullLibrary && (
                <div>
                  <input
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Search filename…"
                    className="mb-2 w-full rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {filteredLibrary.map((img) => (
                      <ImageCard
                        key={img.rootId + img.relPath}
                        thumbUrl={img.previewable ? img.url : null}
                        downloadUrl={`${img.url}${img.url.includes("?") ? "&" : "?"}download=1`}
                        label={img.relPath}
                        filename={img.name}
                        size={img.size}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
      )}

      {showTypography && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setShowTypography(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded border border-neutral-200 bg-white text-neutral-900 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <h2 className="text-sm font-semibold">Typography reference</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyTypographySpec}
                  className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  {typographyCopyFlash ? "Copied ✓" : "Copy as text"}
                </button>
                <button
                  onClick={() => setShowTypography(false)}
                  className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-xs">
              <p className="mb-3 text-neutral-500 dark:text-neutral-400">
                Measured directly from the PDF&apos;s glyph data (font, size, weight, color per
                span) — the ground truth for what&apos;s actually on the page. Letter-spacing has
                no reliable PDF-side signal, so those values come from the live site&apos;s own
                CSS tokens instead (labeled below).
              </p>

              <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">Trim size:</span>{" "}
                  {TRIM_SIZE.widthIn}in × {TRIM_SIZE.heightIn}in ({TRIM_SIZE.widthPt}×
                  {TRIM_SIZE.heightPt}pt)
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
                      <td className="py-1.5 pr-2 whitespace-nowrap">{r.sizePt}pt</td>
                      <td className="py-1.5 pr-2 whitespace-nowrap">{r.weight}</td>
                      <td className="py-1.5 pr-2 whitespace-nowrap">{(r.sizePt / BODY_SIZE_PT).toFixed(2)}×</td>
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
                      <td className="py-1.5 pr-2 whitespace-nowrap">{t.token}</td>
                      <td className="py-1.5 pr-2 whitespace-nowrap">{t.valuePx}px</td>
                      <td className="break-words py-1.5 text-neutral-600 dark:text-neutral-400">{t.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wraps a plain <img> (site hero images, inline ContentRenderer "image"
// blocks) with an always-visible download button — these are same-origin
// static files, so the `download` attribute triggers a real save without
// needing a dedicated API route the way the PDF-page/embedded assets do.
function DownloadableImage({
  src,
  alt,
  className,
  wrapperClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
}) {
  const filename = decodeURIComponent(src.split("/").pop() ?? "image");
  return (
    <div className={`relative ${wrapperClassName ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} />
      <a
        href={src}
        download={filename}
        className="absolute bottom-2 right-2 rounded border border-neutral-300 bg-white/90 px-2 py-1 text-xs shadow-sm hover:bg-white dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-900"
      >
        ↓ Download
      </a>
    </div>
  );
}

function ImageCard({
  thumbUrl,
  downloadUrl,
  label,
  filename,
  size,
}: {
  thumbUrl: string | null;
  downloadUrl: string;
  label: string;
  filename: string;
  size?: number;
}) {
  return (
    <div className="overflow-hidden rounded border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex aspect-square items-center justify-center bg-neutral-100 dark:bg-neutral-950">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={filename} className="h-full w-full object-contain" />
        ) : (
          <span className="text-[10px] text-neutral-400 dark:text-neutral-600">
            {filename.split(".").pop()?.toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-1.5">
        <p className="truncate text-[10px] text-neutral-500 dark:text-neutral-400" title={label}>
          {label}
        </p>
        <a
          href={downloadUrl}
          download
          className="mt-1 block rounded bg-neutral-200 px-1.5 py-1 text-center text-[10px] hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          Download{size ? ` (${formatBytes(size)})` : ""}
        </a>
      </div>
    </div>
  );
}

interface SiteBlock {
  kind: "p" | "ul" | "ol" | "h" | "label" | "image" | "download";
  text?: string;
  bold?: boolean;
  boldPrefix?: string;
  items?: string[];
  src?: string;
  alt?: string;
  caption?: string;
  href?: string;
}
interface SiteActivity {
  id: string;
  label: string;
  title: string;
  blocks: SiteBlock[];
}
interface SiteBreadcrumb {
  sectionTitle: string;
  globalIndex: number;
}
interface CurriculumTableRow {
  lessonLabel: string;
  lessonTitle: string;
  activities: { label: string; title: string }[];
}
interface IceBreakerRow {
  number: number;
  title: string;
  directions: { prefix?: string; text: string }[];
}
interface ReferenceRow {
  sectionLabel: string;
  showSectionLabel: boolean;
  lessonLabel: string;
  lessonTitle: string;
  sources: string[];
}
interface SitePage {
  id: string;
  chapter: string;
  kind: "intro" | "section" | "lesson" | "appendix-index" | "ice-breakers" | "references" | "about";
  title: string;
  heroImage?: string;
  breadcrumb?: SiteBreadcrumb;
  blocks: SiteBlock[];
  activities?: SiteActivity[];
  curriculumTable?: CurriculumTableRow[];
  iceBreakerRows?: IceBreakerRow[];
  referenceRows?: ReferenceRow[];
}

function siteCompletedKey() {
  return "portal:website:completed";
}

// Flattens a page's blocks (+ nested activity blocks, if any) into plain
// text for the "Copy this page" button — one line per block, lists exploded
// to "- item" lines, matching how the block reads visually.
function blocksToText(blocks: SiteBlock[]): string {
  const lines: string[] = [];
  for (const b of blocks) {
    if (b.kind === "ul" || b.kind === "ol") {
      for (const item of b.items ?? []) lines.push(`- ${item}`);
    } else if (b.kind === "image") {
      if (b.caption) lines.push(b.caption);
    } else if (b.kind === "download") {
      if (b.text) lines.push(b.text);
    } else if (b.text) {
      lines.push(b.text);
    }
  }
  return lines.join("\n\n");
}

function pageToText(page: SitePage): string {
  const parts = [page.title, blocksToText(page.blocks)];
  for (const a of page.activities ?? []) {
    parts.push(`${a.label} ${a.title}`, blocksToText(a.blocks));
  }
  if (page.curriculumTable) {
    for (const row of page.curriculumTable) {
      parts.push(
        `${row.lessonLabel} ${row.lessonTitle}\n${row.activities.map((a) => `  ${a.label} ${a.title}`).join("\n")}`
      );
    }
  }
  if (page.iceBreakerRows) {
    for (const row of page.iceBreakerRows) {
      parts.push(
        `${row.number}. ${row.title}\n${row.directions.map((d) => `${d.prefix ?? ""}${d.text}`).join("\n")}`
      );
    }
  }
  if (page.referenceRows) {
    for (const row of page.referenceRows) {
      parts.push(
        `${row.showSectionLabel ? `${row.sectionLabel}\n` : ""}${row.lessonLabel} ${row.lessonTitle}\n${row.sources.map((s) => `- ${s}`).join("\n")}`
      );
    }
  }
  return parts.filter(Boolean).join("\n\n");
}

// References and Ice Breakers now render their bulk content as dedicated
// tables (ReferencesTable / IceBreakersTable below), each cell tagged with
// its own precise role directly — so the only "p" block left flowing
// through here on those two pages is their shared opacity-70 intro line,
// which uses a distinct smaller scale from the standard body paragraph.
// `bold` here means "this specific run is bold" — for a "p" block split by
// boldPrefix, call this once for the prefix (bold=true) and once for the
// remaining text (bold=b.bold), so each run reports its own true weight
// instead of one flag covering a mixed-weight line.
function roleForBlock(kind: SiteBlock["kind"], bold: boolean | undefined, pageKind: SitePage["kind"]): string {
  if ((pageKind === "references" || pageKind === "appendix-index") && kind === "p") {
    return "page-intro-note";
  }
  if (kind === "h") return "section-h2";
  if (kind === "label") return "label-pill";
  if (kind === "ul" || kind === "ol") return "list-item";
  if (kind === "download") return "download-label";
  if (kind === "image") return "image-caption";
  return bold ? "body-bold" : "body";
}

function SiteBlockRenderer({ blocks, pageKind }: { blocks: SiteBlock[]; pageKind: SitePage["kind"] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b, i) => {
        const role = roleForBlock(b.kind, b.bold, pageKind);
        if (b.kind === "h") {
          return (
            <h3
              key={i}
              data-role={role}
              className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100"
            >
              {b.text}
            </h3>
          );
        }
        if (b.kind === "label") {
          return (
            <span
              key={i}
              data-role={role}
              className="w-fit rounded border border-neutral-300 px-2 py-0.5 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
            >
              {b.text}
            </span>
          );
        }
        if (b.kind === "ul" || b.kind === "ol") {
          const Tag = b.kind === "ul" ? "ul" : "ol";
          return (
            <Tag
              key={i}
              className={`flex flex-col gap-2 pl-5 text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200 ${
                b.kind === "ul" ? "list-disc" : "list-decimal"
              }`}
            >
              {(b.items ?? []).map((item, j) => (
                <li key={j} data-role={role}>
                  {item}
                </li>
              ))}
            </Tag>
          );
        }
        if (b.kind === "image") {
          return (
            <figure key={i} className="my-2">
              <DownloadableImage
                src={b.src ?? ""}
                alt={b.alt ?? ""}
                className="mx-auto max-w-full rounded"
              />
              {b.caption && (
                <figcaption
                  data-role={role}
                  className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400"
                >
                  {b.caption}
                </figcaption>
              )}
            </figure>
          );
        }
        if (b.kind === "download") {
          return (
            <a
              key={i}
              href={b.href}
              data-role={role}
              className="w-fit rounded border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              ↓ {b.text}
            </a>
          );
        }
        return (
          <p
            key={i}
            className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-800 dark:text-neutral-200"
          >
            {b.boldPrefix && (
              <span
                data-role={roleForBlock("p", true, pageKind)}
                className="font-semibold text-neutral-900 dark:text-neutral-100"
              >
                {b.boldPrefix}
              </span>
            )}
            <span
              data-role={role}
              className={b.bold ? "font-semibold text-neutral-900 dark:text-neutral-100" : ""}
            >
              {b.text}
            </span>
          </p>
        );
      })}
    </div>
  );
}

function SitePageCard({
  page,
  completed,
  onToggleComplete,
}: {
  page: SitePage;
  completed: boolean;
  onToggleComplete: () => void;
}) {
  const [copyFlash, setCopyFlash] = useState(false);
  const copyPage = useCallback(() => {
    copyToClipboard(pageToText(page)).then((ok) => {
      if (!ok) return;
      setCopyFlash(true);
      setTimeout(() => setCopyFlash(false), 1200);
    });
  }, [page]);

  return (
    <section
      id={`site-page-${page.id}`}
      className={`mb-8 scroll-mt-6 rounded border bg-white p-8 shadow-sm dark:bg-neutral-900 ${
        completed
          ? "border-emerald-400 dark:border-emerald-600"
          : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
          {page.chapter}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={copyPage}
            className="rounded border border-neutral-300 px-2.5 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {copyFlash ? "Copied ✓" : "Copy this page"}
          </button>
          <label className="flex items-center gap-1.5 text-xs">
            <input type="checkbox" checked={completed} onChange={onToggleComplete} className="h-3.5 w-3.5" />
            Complete
          </label>
        </div>
      </div>
      <h1
        data-role={page.kind === "lesson" ? "lesson-h1" : "page-h1"}
        className="mb-6 text-2xl font-semibold tracking-tight"
      >
        {page.title}
      </h1>
      {page.heroImage && (
        <DownloadableImage
          src={page.heroImage}
          alt=""
          className="w-full rounded object-cover"
          wrapperClassName="mb-6"
        />
      )}
      {page.breadcrumb && (
        <p data-role="breadcrumb" className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          / {page.breadcrumb.sectionTitle}{" "}
          <span className="opacity-70">/ L{page.breadcrumb.globalIndex}</span>
        </p>
      )}
      <SiteBlockRenderer blocks={page.blocks} pageKind={page.kind} />
      {page.curriculumTable && <CurriculumTableView rows={page.curriculumTable} />}
      {page.iceBreakerRows && <IceBreakersTableView rows={page.iceBreakerRows} />}
      {page.referenceRows && <ReferencesTableView rows={page.referenceRows} />}

      {page.activities && page.activities.length > 0 && (
        <div className="mt-8 flex flex-col gap-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          {page.activities.map((a) => (
            <div key={a.id}>
              <h2 data-role="activity-h2" className="mb-3 flex items-center gap-2 text-base font-semibold">
                <span data-role="label-pill" className="rounded border border-neutral-300 px-1.5 py-0.5 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                  {a.label}
                </span>
                {a.title}
              </h2>
              <SiteBlockRenderer blocks={a.blocks} pageKind={page.kind} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const tableWrap =
  "mt-6 overflow-x-auto rounded border border-neutral-200 dark:border-neutral-800";
const tableEl = "w-full table-fixed border-collapse text-sm";
const theadRow =
  "border-b border-neutral-200 bg-neutral-50 text-left text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400";
const bodyRow = "border-b border-neutral-100 align-top last:border-0 dark:border-neutral-900";
const cell = "px-3 py-2";

// Mirrors CurriculumTable.tsx's Lesson / Title / Activities columns on a
// section overview page — link targets omitted (this is a reading view, not
// a navigable clone of the site) but every lesson and activity is listed.
function CurriculumTableView({ rows }: { rows: CurriculumTableRow[] }) {
  return (
    <div className={tableWrap}>
      <table className={tableEl}>
        <colgroup>
          <col className="w-[15%]" />
          <col className="w-[30%]" />
          <col className="w-[55%]" />
        </colgroup>
        <thead>
          <tr className={theadRow}>
            <th className={`${cell} font-medium`}>Lesson</th>
            <th className={`${cell} font-medium`}>Title</th>
            <th className={`${cell} font-medium`}>Activities</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.lessonLabel} className={bodyRow}>
              <td className={cell}>
                <span data-role="curriculum-lesson-label" className="font-semibold">
                  {row.lessonLabel}
                </span>
              </td>
              <td className={`${cell} break-words`} data-role="curriculum-text">
                {row.lessonTitle}
              </td>
              <td className={`${cell} break-words`}>
                <div className="flex flex-col gap-1">
                  {row.activities.map((a) => (
                    <div key={a.label} data-role="curriculum-text">
                      <span className="mr-1.5 text-neutral-400 dark:text-neutral-600">{a.label}</span>
                      {a.title}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mirrors appendix/ice-breakers/page.tsx's Number / Title / Directions table.
function IceBreakersTableView({ rows }: { rows: IceBreakerRow[] }) {
  return (
    <div className={tableWrap}>
      <table className={tableEl}>
        <colgroup>
          <col className="w-[8%]" />
          <col className="w-[22%]" />
          <col className="w-[70%]" />
        </colgroup>
        <thead>
          <tr className={theadRow}>
            <th className={`${cell} font-medium`}>#</th>
            <th className={`${cell} font-medium`}>Title</th>
            <th className={`${cell} font-medium`}>Directions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.number} className={bodyRow}>
              <td className={cell} data-role="ice-breaker-title">
                {row.number}
              </td>
              <td className={`${cell} break-words font-semibold`} data-role="ice-breaker-title">
                {row.title}
              </td>
              <td className={`${cell} break-words`}>
                <div className="flex flex-col gap-2">
                  {row.directions.map((d, i) => (
                    <p key={i}>
                      {d.prefix && (
                        <span data-role="ice-breaker-label" className="font-semibold">
                          {d.prefix}
                        </span>
                      )}
                      <span data-role="ice-breaker-text">{d.text}</span>
                    </p>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mirrors appendix/references/page.tsx's Section / Lesson / Source table.
// The Section cell only shows a value on that section's first row (a
// visual rowspan effect achieved by leaving the cell blank otherwise) — same
// as the real site.
function ReferencesTableView({ rows }: { rows: ReferenceRow[] }) {
  return (
    <div className={tableWrap}>
      <table className={tableEl}>
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[24%]" />
          <col className="w-[58%]" />
        </colgroup>
        <thead>
          <tr className={theadRow}>
            <th className={`${cell} font-medium`}>Section</th>
            <th className={`${cell} font-medium`}>Lesson</th>
            <th className={`${cell} font-medium`}>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={bodyRow}>
              <td className={`${cell} break-words font-semibold`} data-role="reference-label">
                {row.showSectionLabel ? row.sectionLabel : ""}
              </td>
              <td className={`${cell} break-words`}>
                <span data-role="reference-label" className="font-semibold">
                  {row.lessonLabel}{" "}
                </span>
                <span data-role="reference-lesson-title">{row.lessonTitle}</span>
              </td>
              <td className={`${cell} break-words`}>
                <ul className="flex flex-col gap-2">
                  {row.sources.map((s, j) => (
                    <li key={j} data-role="reference-citation">
                      {s}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SiteView() {
  const [pages, setPages] = useState<SitePage[] | null>(null);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<{ role: string; x: number; y: number } | null>(null);
  const [rootPx, setRootPx] = useState(16);
  const initialized = useRef(false);

  // The site's own root font-size is fluid (clamp() based on viewport width,
  // scaled by a user zoom setting) — read the live value so the tooltip's
  // px conversions stay accurate rather than assuming a fixed 16px root.
  useEffect(() => {
    function updateRootPx() {
      const px = parseFloat(getComputedStyle(document.documentElement).fontSize);
      if (!Number.isNaN(px)) setRootPx(px);
    }
    updateRootPx();
    window.addEventListener("resize", updateRootPx);
    return () => window.removeEventListener("resize", updateRootPx);
  }, []);

  // Block-level elements' hit boxes cover the full line height and any
  // trailing whitespace, not just the glyphs — so a plain elementFromPoint
  // hit test would fire everywhere inside a paragraph, including the gaps
  // between wrapped lines. caretRangeFromPoint finds the nearest text
  // position instead, and checking that one character's own getClientRects
  // against the cursor point confirms the cursor is actually over its ink,
  // not just closest to it.
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const doc = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    };
    const range = doc.caretRangeFromPoint?.(e.clientX, e.clientY);
    const node = range?.startContainer;
    if (!range || !node || node.nodeType !== Node.TEXT_NODE) {
      setHover(null);
      return;
    }

    const text = node as Text;
    const offset = range.startOffset;
    const charRange = document.createRange();
    charRange.setStart(text, Math.max(0, offset - 1));
    charRange.setEnd(text, Math.min(text.length, offset + 1));

    let overGlyph = false;
    for (const r of charRange.getClientRects()) {
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        overGlyph = true;
        break;
      }
    }
    if (!overGlyph) {
      setHover(null);
      return;
    }

    const target = text.parentElement?.closest("[data-role]") as HTMLElement | null;
    if (!target) {
      setHover(null);
      return;
    }
    setHover({ role: target.getAttribute("data-role")!, x: e.clientX, y: e.clientY });
  }, []);
  const handleMouseLeave = useCallback(() => setHover(null), []);

  useEffect(() => {
    fetch("/api/portal/site")
      .then((r) => {
        if (!r.ok) throw new Error("could not load site content");
        return r.json();
      })
      .then((d: { pages: SitePage[] }) => setPages(d.pages))
      .catch((e) => setSiteError(String(e.message ?? e)));
  }, []);

  useEffect(() => {
    if (!pages || initialized.current) return;
    initialized.current = true;
    try {
      const raw = localStorage.getItem(siteCompletedKey());
      if (raw) setCompleted(new Set(JSON.parse(raw)));
    } catch {
      /* ignore malformed storage */
    }
  }, [pages]);

  const toggleComplete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(siteCompletedKey(), JSON.stringify([...next]));
      return next;
    });
  }, []);

  const chapters = useMemo(() => {
    if (!pages) return [];
    const groups: { chapter: string; pages: SitePage[] }[] = [];
    for (const page of pages) {
      const last = groups[groups.length - 1];
      if (last && last.chapter === page.chapter) last.pages.push(page);
      else groups.push({ chapter: page.chapter, pages: [page] });
    }
    return groups;
  }, [pages]);

  const scrollToPage = useCallback((id: string) => {
    document.getElementById(`site-page-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const jumpToNextIncomplete = useCallback(() => {
    if (!pages) return;
    const next = pages.find((p) => !completed.has(p.id));
    if (next) scrollToPage(next.id);
  }, [pages, completed, scrollToPage]);

  if (siteError) {
    return <div className="p-10 text-sm text-red-500 dark:text-red-400">{siteError}</div>;
  }
  if (!pages) {
    return <div className="p-10 text-sm text-neutral-400">Loading site content…</div>;
  }

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr]">
      <aside className="min-h-0 overflow-y-auto border-r border-neutral-200 p-3 dark:border-neutral-800">
        <button
          onClick={jumpToNextIncomplete}
          className="mb-3 w-full rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Next incomplete →
        </button>
        {chapters.map((group) => (
          <div key={group.chapter} className="mb-4">
            <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-600">
              {group.chapter}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.pages.map((p) => {
                const done = completed.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => scrollToPage(p.id)}
                    className={`flex items-center gap-1.5 rounded px-2 py-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                      done ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    <span className="w-3 shrink-0">{done ? "✓" : ""}</span>
                    <span className="truncate">{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </aside>
      <div
        className="min-h-0 overflow-y-auto px-8 py-8"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-xs text-neutral-400 dark:text-neutral-600">
            Pulled directly from the site&apos;s own content — every section, lesson, and activity
            page, in order. Scroll through or jump via the outline on the left. Hover any text to
            see its real typographic spec.
          </p>
          {pages.map((page) => (
            <SitePageCard
              key={page.id}
              page={page}
              completed={completed.has(page.id)}
              onToggleComplete={() => toggleComplete(page.id)}
            />
          ))}
        </div>
      </div>
      {hover && SITE_TYPE_SPECS[hover.role] && (
        <TypeHoverTooltip spec={SITE_TYPE_SPECS[hover.role]} x={hover.x} y={hover.y} rootPx={rootPx} />
      )}
    </div>
  );
}

interface OrderFinding {
  severity: "error" | "warning" | "info";
  message: string;
  pages?: number[];
}
interface SpellcheckFinding {
  word: string;
  count: number;
  pages: number[];
}
interface PageMapEntry {
  page: number;
  sectionId: string | null;
  sectionTitle: string;
  lessonNum: number;
  lessonTitle: string;
  matchesSite: boolean;
}
interface ContentUnit {
  source: string;
  text: string;
}
interface CheckedUnit extends ContentUnit {
  found: boolean;
}
interface LessonContentReport {
  lessonNum: number;
  lessonTitle: string;
  sectionTitle: string;
  pages: number[];
  totalUnits: number;
  missing: ContentUnit[];
  units: CheckedUnit[];
  pdfText: string;
}
interface QAResult {
  pageCount: number;
  orderFindings: OrderFinding[];
  spellcheck: SpellcheckFinding[];
  pageMap: PageMapEntry[];
  contentReport: LessonContentReport[];
}

const severityStyle: Record<OrderFinding["severity"], string> = {
  error: "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400",
  warning: "border-amber-300 text-amber-600 dark:border-amber-800 dark:text-amber-400",
  info: "border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400",
};

// Upload a PDF (e.g. a fresh InDesign export) and check it like an
// editorialist/bookmaker would: does its section/lesson sequence match the
// live site's own curriculum order, and does its text hold up to a
// spellcheck pass (tuned against a curated allowlist of curriculum jargon
// and citation authors so it doesn't cry wolf on every proper noun). Runs
// fast text-only extraction (scripts/portal-qa-extract.py) rather than the
// full page-render pipeline portal-extract.py does for the Spread viewer —
// this never touches portal-data, so it's safe to run against any PDF
// without disturbing whatever book is currently loaded there.
function QAView() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<QAResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ignored, setIgnored] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState<Set<number>>(new Set());

  const toggleCompare = useCallback((lessonNum: number) => {
    setCompareOpen((prev) => {
      const next = new Set(prev);
      if (next.has(lessonNum)) next.delete(lessonNum);
      else next.add(lessonNum);
      return next;
    });
  }, []);

  const runCheck = useCallback(async () => {
    if (!file) return;
    setStatus("running");
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/portal/qa-check", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Check failed.");
        setStatus("error");
        return;
      }
      setResult(data);
      setIgnored(new Set());
      setCompareOpen(new Set());
      setStatus("done");
    } catch {
      setError("Couldn't reach the server.");
      setStatus("error");
    }
  }, [file]);

  const ignoreWord = useCallback(async (word: string) => {
    setIgnored((prev) => new Set(prev).add(word));
    try {
      await fetch("/api/portal/qa-check/ignore-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
    } catch {
      /* the word still stays hidden locally even if the write failed */
    }
  }, []);

  const visibleSpellcheck = (result?.spellcheck ?? []).filter((e) => !ignored.has(e.word.toLowerCase()));

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-xs text-neutral-400 dark:text-neutral-600">
          Upload a PDF (e.g. a fresh InDesign export) to check it like an editorialist would —
          reads the running header printed on every spread to place each page, then checks
          section/lesson order, titles, and the actual lesson/activity body content against the
          live site, plus a spellcheck pass.
        </p>

        <div className="mb-8 flex items-center gap-3 rounded border border-neutral-200 p-4 dark:border-neutral-800">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs text-neutral-500 dark:text-neutral-400"
          />
          <button
            onClick={runCheck}
            disabled={!file || status === "running"}
            className="rounded border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {status === "running" ? "Checking…" : "Run check"}
          </button>
          {result && status === "done" && (
            <span className="text-xs text-neutral-400 dark:text-neutral-600">
              {result.pageCount} pages checked
            </span>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-300 p-3 text-sm text-red-600 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <>
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-semibold">
                Order consistency vs. website ({result.orderFindings.length})
              </h2>
              <div className="flex flex-col gap-2">
                {result.orderFindings.map((f, i) => (
                  <div
                    key={i}
                    className={`rounded border px-3 py-2 text-xs ${severityStyle[f.severity]}`}
                  >
                    <span className="mr-2 font-semibold uppercase">{f.severity}</span>
                    {f.message}
                    {f.pages && f.pages.length > 0 && (
                      <span className="ml-2 text-neutral-400 dark:text-neutral-600">
                        (pages: {f.pages.slice(0, 12).join(", ")}
                        {f.pages.length > 12 ? "…" : ""})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-1 text-sm font-semibold">
                Content map — where each page is from ({result.pageMap.length})
              </h2>
              <p className="mb-3 text-xs text-neutral-400 dark:text-neutral-600">
                Read from each page&apos;s own running header (top-right of every spread in the
                PDF), matched against the live site&apos;s section/lesson data.
              </p>
              {result.pageMap.length === 0 ? (
                <p className="text-xs text-neutral-400 dark:text-neutral-600">
                  No running headers found on any page.
                </p>
              ) : (
                <div className="max-h-80 overflow-y-auto rounded border border-neutral-200 dark:border-neutral-800">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-900">
                      <tr className="text-neutral-400 dark:text-neutral-600">
                        <th className="px-3 py-1.5 font-medium">Page</th>
                        <th className="px-3 py-1.5 font-medium">Lesson</th>
                        <th className="px-3 py-1.5 font-medium">Section</th>
                        <th className="px-3 py-1.5 font-medium">Title</th>
                        <th className="px-3 py-1.5 font-medium">Site</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.pageMap.map((row, i) => (
                        <tr
                          key={i}
                          className="border-t border-neutral-100 dark:border-neutral-800"
                        >
                          <td className="px-3 py-1.5 text-neutral-400 dark:text-neutral-600">
                            {row.page}
                          </td>
                          <td className="px-3 py-1.5">L{row.lessonNum}</td>
                          <td className="px-3 py-1.5">{row.sectionTitle}</td>
                          <td className="px-3 py-1.5">{row.lessonTitle}</td>
                          <td className="px-3 py-1.5">
                            {row.matchesSite ? (
                              <span className="text-emerald-600 dark:text-emerald-400">match</span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">differs</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="mb-8">
              {(() => {
                const withIssues = result.contentReport.filter((r) => r.missing.length > 0);
                const clean = result.contentReport.length - withIssues.length;
                return (
                  <>
                    <h2 className="mb-1 text-sm font-semibold">
                      Lesson content vs. website ({withIssues.length} with differences)
                    </h2>
                    <p className="mb-3 text-xs text-neutral-400 dark:text-neutral-600">
                      Every paragraph, heading, and list item from each lesson&apos;s facilitator
                      notes and activities (the site&apos;s own content, not just titles), checked
                      against the PDF text on that lesson&apos;s pages. {clean} of{" "}
                      {result.contentReport.length} lessons matched in full. Click a lesson to
                      compare the website text and print text side by side.
                    </p>
                    <div className="flex flex-col gap-2">
                      {result.contentReport.map((r) => {
                        const isOpen = compareOpen.has(r.lessonNum);
                        const hasIssues = r.missing.length > 0;
                        return (
                          <div
                            key={r.lessonNum}
                            className={`rounded border text-xs ${
                              hasIssues
                                ? "border-amber-300 dark:border-amber-800"
                                : "border-neutral-200 dark:border-neutral-800"
                            }`}
                          >
                            <button
                              onClick={() => toggleCompare(r.lessonNum)}
                              className="flex w-full items-baseline justify-between gap-2 px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            >
                              <span className="font-semibold">
                                {isOpen ? "▾" : "▸"} L{r.lessonNum} {r.lessonTitle}
                              </span>
                              <span className="text-neutral-400 dark:text-neutral-600">
                                {r.totalUnits - r.missing.length}/{r.totalUnits} found — pages{" "}
                                {r.pages.join(",")}
                              </span>
                            </button>

                            {isOpen && (
                              <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 p-3 dark:border-neutral-800">
                                <div>
                                  <div className="mb-1.5 font-semibold text-neutral-500 dark:text-neutral-400">
                                    Website
                                  </div>
                                  <div className="max-h-96 overflow-y-auto rounded border border-neutral-200 p-2 dark:border-neutral-800">
                                    {r.units.map((u, i) => (
                                      <p
                                        key={i}
                                        className={`mb-2 last:mb-0 ${
                                          u.found
                                            ? "text-neutral-600 dark:text-neutral-300"
                                            : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                                        }`}
                                      >
                                        <span className="mr-1 text-neutral-400 dark:text-neutral-600">
                                          [{u.source}]
                                        </span>
                                        {u.text}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <div className="mb-1.5 font-semibold text-neutral-500 dark:text-neutral-400">
                                    Print (PDF, pages {r.pages.join(",")})
                                  </div>
                                  <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded border border-neutral-200 p-2 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
                                    {r.pdfText || (
                                      <span className="text-neutral-400 dark:text-neutral-600">
                                        No text extracted for these pages.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold">
                Possible misspellings ({visibleSpellcheck.length})
              </h2>
              {visibleSpellcheck.length === 0 ? (
                <p className="text-xs text-neutral-400 dark:text-neutral-600">
                  Nothing flagged — clean pass.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {visibleSpellcheck.map((e) => (
                    <div
                      key={e.word}
                      className="flex items-center justify-between rounded border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-800"
                    >
                      <span>
                        <span className="font-medium">{e.word}</span>
                        <span className="ml-2 text-neutral-400 dark:text-neutral-600">
                          ×{e.count} — pages {e.pages.slice(0, 8).join(", ")}
                          {e.pages.length > 8 ? "…" : ""}
                        </span>
                      </span>
                      <button
                        onClick={() => ignoreWord(e.word)}
                        className="shrink-0 rounded border border-neutral-300 px-2 py-0.5 text-[10px] hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      >
                        Not a typo — ignore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function TypeHoverTooltip({
  spec,
  x,
  y,
  rootPx,
}: {
  spec: (typeof SITE_TYPE_SPECS)[string];
  x: number;
  y: number;
  rootPx: number;
}) {
  const sizePx = spec.sizeRem * rootPx;
  const trackingPx = spec.trackingEm * sizePx;
  const leadingPx = spec.leading === "none" ? sizePx : spec.leading * sizePx;

  // Flip to the left of the cursor near the right edge so the tooltip never
  // clips off-screen; same idea vertically near the bottom.
  const flipX = typeof window !== "undefined" && x > window.innerWidth - 280;
  const flipY = typeof window !== "undefined" && y > window.innerHeight - 220;

  return (
    <div
      className="pointer-events-none fixed z-50 w-64 rounded border border-neutral-300 bg-white p-3 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      style={{
        left: flipX ? undefined : x + 16,
        right: flipX ? window.innerWidth - x + 16 : undefined,
        top: flipY ? undefined : y + 16,
        bottom: flipY ? window.innerHeight - y + 16 : undefined,
      }}
    >
      <p className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">{spec.role}</p>
      <dl className="flex flex-col gap-1 text-neutral-600 dark:text-neutral-400">
        <div className="flex justify-between gap-3">
          <dt>Font</dt>
          <dd className="text-right">Helvetica Neue</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Weight</dt>
          <dd className="text-right">{spec.weight} {spec.weight === 700 ? "(Bold)" : "(Regular)"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Size</dt>
          <dd className="text-right">
            {spec.sizeRem}rem <span className="text-neutral-400 dark:text-neutral-600">({sizePx.toFixed(1)}px)</span>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Letter-spacing</dt>
          <dd className="text-right">
            {spec.trackingEm}em <span className="text-neutral-400 dark:text-neutral-600">({trackingPx.toFixed(2)}px)</span>
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Line-height</dt>
          <dd className="text-right">
            {spec.leading === "none" ? "none (1×)" : spec.leading}{" "}
            <span className="text-neutral-400 dark:text-neutral-600">({leadingPx.toFixed(1)}px)</span>
          </dd>
        </div>
      </dl>
      <p className="mt-2 border-t border-neutral-200 pt-2 text-[11px] text-neutral-400 dark:border-neutral-800 dark:text-neutral-600">
        {spec.usage}
      </p>
    </div>
  );
}

function SpreadPage({
  page,
  manifest,
  active,
  onSelect,
  side,
  zoom,
}: {
  page: number;
  manifest: Manifest;
  active: boolean;
  onSelect: (page: number) => void;
  side: "left" | "right";
  zoom: number;
}) {
  const entry = manifest.pages.find((p) => p.page === page);
  if (!entry) return null;
  return (
    <button onClick={() => onSelect(page)} className="flex flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/portal/asset?kind=page&file=${encodeURIComponent(entry.render)}&v=${manifest.generatedAt}`}
        alt={`Page ${page}`}
        className={[
          "shadow-lg ring-2",
          active ? "ring-emerald-400" : "ring-transparent",
          side === "left" ? "rounded-l-sm" : "rounded-r-sm",
        ].join(" ")}
        style={{ width: `${420 * zoom}px` }}
      />
      <span
        className={`mt-1 text-[10px] ${active ? "text-emerald-500 dark:text-emerald-400" : "text-neutral-400 dark:text-neutral-500"}`}
      >
        {page}
      </span>
    </button>
  );
}
