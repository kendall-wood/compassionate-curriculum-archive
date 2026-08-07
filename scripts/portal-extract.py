#!/usr/bin/env python3
"""One-time extraction feeding the /portal InDesign-prep tool.

Renders every PDF page to a JPEG (for the page viewer), pulls the page's
plain text (for copy/paste into InDesign), and pulls embedded raster images
per page (deduped by content hash, since headers/backgrounds repeat across
the whole book). Output goes to portal-data/, which is gitignored — this is
a local working tool, not something that ships with the site.

Usage:
  python3 scripts/portal-extract.py [path/to.pdf]

Defaults to print-output/compassionate-curriculum-en.pdf.
"""

import hashlib
import json
import sys
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = ROOT / "print-output" / "compassionate-curriculum-en.pdf"
OUT_DIR = ROOT / "portal-data"
PAGES_DIR = OUT_DIR / "pages"
EMBEDDED_DIR = OUT_DIR / "embedded"
RENDER_ZOOM = 2.0  # ~144dpi, crisp enough to read/zoom in-browser
MIN_IMAGE_DIM = 48  # skip tiny bullets/icons picked up as "images"


def main():
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    if not pdf_path.exists():
        sys.exit(f"PDF not found: {pdf_path}")

    PAGES_DIR.mkdir(parents=True, exist_ok=True)
    EMBEDDED_DIR.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    embedded_images = {}  # hash -> {file, w, h, pages: [...]}
    pages_out = []

    for i, page in enumerate(doc):
        page_num = i + 1
        print(f"page {page_num}/{len(doc)}", end="\r")

        # --- render for the viewer ---
        pix = page.get_pixmap(matrix=fitz.Matrix(RENDER_ZOOM, RENDER_ZOOM))
        render_name = f"page-{page_num:03d}.jpg"
        pix.save(PAGES_DIR / render_name, jpg_quality=88)

        # --- text for copy/paste ---
        text = page.get_text("text").strip()

        # --- embedded images on this page ---
        page_image_ids = []
        for img in page.get_images(full=True):
            xref = img[0]
            try:
                base = doc.extract_image(xref)
            except Exception:
                continue
            data = base["image"]
            w, h = base.get("width", 0), base.get("height", 0)
            if w < MIN_IMAGE_DIM or h < MIN_IMAGE_DIM:
                continue
            digest = hashlib.sha256(data).hexdigest()[:16]
            if digest not in embedded_images:
                ext = base.get("ext", "png")
                fname = f"img-{digest}.{ext}"
                (EMBEDDED_DIR / fname).write_bytes(data)
                embedded_images[digest] = {
                    "id": digest,
                    "file": fname,
                    "width": w,
                    "height": h,
                    "pages": [],
                }
            embedded_images[digest]["pages"].append(page_num)
            page_image_ids.append(digest)

        pages_out.append(
            {
                "page": page_num,
                "render": render_name,
                "text": text,
                "imageIds": page_image_ids,
            }
        )

    print()

    # Images repeated across many pages are headers/backgrounds/logos, not
    # page-specific content — flag them so the UI can hide them by default.
    for info in embedded_images.values():
        info["recurring"] = len(info["pages"]) > 4

    import time

    manifest = {
        "source": str(pdf_path.relative_to(ROOT)),
        "generatedAt": str(int(time.time())),
        "pageCount": len(doc),
        "pages": pages_out,
        "embeddedImages": embedded_images,
    }
    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"Wrote {OUT_DIR / 'manifest.json'} ({len(doc)} pages, {len(embedded_images)} unique embedded images)")


if __name__ == "__main__":
    main()
