"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

interface LibraryImage {
  name: string;
  url: string;
  previewable: boolean;
  size: number;
}

export function ImagePicker({ onPick }: { onPick: (url: string) => void }) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  const filtered = library.filter((img) =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded border border-neutral-300 px-2 py-1.5 text-sm text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
      >
        Browse…
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-10 mt-1 flex max-h-[28rem] w-[24rem] flex-col gap-2 rounded border border-neutral-300 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Choose an image</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-neutral-400 hover:text-neutral-900"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInput.current?.click()}
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
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
          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          <div className="border-t border-neutral-200 pt-2">
            <input
              className="w-full rounded border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-neutral-900"
              placeholder="Search existing images…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 overflow-y-auto">
            {filtered.slice(0, 60).map((img) => (
              <button
                key={img.url}
                type="button"
                onClick={() => {
                  onPick(img.url);
                  setOpen(false);
                }}
                className="flex flex-col gap-1 rounded border border-neutral-200 p-1 text-left hover:border-neutral-900"
                title={img.name}
              >
                {img.previewable ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt=""
                    className="aspect-square w-full rounded object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded bg-neutral-100 text-xs text-neutral-400">
                    no preview
                  </div>
                )}
                <span className="truncate text-[0.65rem] text-neutral-500">
                  {img.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
