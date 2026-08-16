"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

interface LibraryImage {
  name: string;
  url: string;
  previewable: boolean;
  size: number;
}

// Modal overlay, matching the Typography reference modal in EditorApp/
// PortalApp (fixed inset-0 dim backdrop, centered bordered card) — the same
// modal pattern already used elsewhere in this app, reused here instead of
// inventing a second popover style.
export function ImagePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
}) {
  const [library, setLibrary] = useState<LibraryImage[]>([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || library.length > 0) return;
    fetch("/api/portal/library")
      .then((r) => r.json())
      .then((d: { images: LibraryImage[] }) => setLibrary(d.images ?? []))
      .catch(() => setLibrary([]));
  }, [open, library.length]);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/editor/upload",
      });
      onPick(blob.url);
      onClose();
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  const filtered = library.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded border border-neutral-200 bg-white text-neutral-900 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-sm font-semibold">Choose an image</h2>
          <button
            onClick={onClose}
            className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

        <div className="border-b border-neutral-200 p-3 dark:border-neutral-800">
          <button
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="rounded border border-emerald-400 px-2.5 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
          >
            {uploading ? "Uploading…" : "Upload a new image"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          {error ? <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p> : null}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search existing images…"
            className="mt-2 w-full rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-4 gap-2">
            {filtered.slice(0, 80).map((img) => (
              <button
                key={img.url}
                onClick={() => {
                  onPick(img.url);
                  onClose();
                }}
                title={img.name}
                className="overflow-hidden rounded border border-neutral-200 bg-white text-left hover:border-emerald-400 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex aspect-square items-center justify-center bg-neutral-100 dark:bg-neutral-950">
                  {img.previewable ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-600">
                      {img.name.split(".").pop()?.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="truncate p-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                  {img.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
