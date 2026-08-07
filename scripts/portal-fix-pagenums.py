#!/usr/bin/env python3
"""Correct the baked-in footer page numbers + Table of Contents entries in
print-output/compassionate-curriculum-en.pdf after the Ice Breakers page
reorder (see portal-fix-pagenums notes in conversation). Physical page N's
printed footer number should equal N; this patches every page where the
export-time number no longer matches, plus the TOC's "Page" column.

Layout facts (measured from the doc itself, HelveticaNeue, non-bold):
- Footer page number: fontsize 9, centered at x=315.0 on odd/recto pages,
  x=297.0 on even/verso pages, baseline y unchanged per page.
- TOC "Page" column: fontsize 10, right-aligned to x=576.2.
"""

import fitz

PDF_PATH = "print-output/compassionate-curriculum-en.pdf"
FOOTER_SIZE = 9.0
FOOTER_ODD_CENTER = 315.0
FOOTER_EVEN_CENTER = 297.0
TOC_SIZE = 10.0
TOC_RIGHT_EDGE = 576.2

# (old TOC page number -> new), derived from the +4 shift for every lesson
# page and the Ice Breakers block moving from 97 to 9. "Introduction"->5,
# "About"->101, "References"->103 are unchanged and omitted.
TOC_REMAP = {
    9: 13, 17: 21, 20: 24, 25: 29, 33: 37, 38: 42, 44: 48, 48: 52,
    50: 54, 52: 56, 57: 61, 65: 69, 71: 75, 76: 80, 80: 84, 86: 90,
    97: 9,
}


def main():
    doc = fitz.open(PDF_PATH)

    # The doc's embedded HelveticaNeue is a subsetted CID font whose cmap
    # doesn't survive re-use for arbitrary new Unicode text (produced null
    # glyphs when tried). Base-14 Helvetica is visually indistinguishable at
    # 9-10pt for plain digits, so use that instead — far more reliable.
    font = fitz.Font("helv")

    footer_fixed = 0
    for i, page in enumerate(doc):
        page_num = i + 1
        d = page.get_text("dict")
        target = None
        for b in d["blocks"]:
            for l in b.get("lines", []):
                for s in l.get("spans", []):
                    if (
                        abs(s["size"] - FOOTER_SIZE) < 0.3
                        and 725 < s["bbox"][1] < 735
                        and s["text"].strip().isdigit()
                    ):
                        target = s
        if target is None:
            continue
        if target["text"].strip() == str(page_num):
            continue

        page.add_redact_annot(fitz.Rect(target["bbox"]), fill=(1, 1, 1))
        page.apply_redactions()

        new_text = str(page_num)
        center = FOOTER_ODD_CENTER if page_num % 2 == 1 else FOOTER_EVEN_CENTER
        width = font.text_length(new_text, fontsize=FOOTER_SIZE)
        x0 = center - width / 2
        baseline_y = target["origin"][1]
        page.insert_text(
            (x0, baseline_y), new_text, fontsize=FOOTER_SIZE, fontname="helv", color=(0, 0, 0)
        )
        footer_fixed += 1

    # --- Table of Contents (page 3) ---
    toc_page = doc[2]
    d = toc_page.get_text("dict")
    toc_fixed = 0
    for b in d["blocks"]:
        for l in b.get("lines", []):
            for s in l.get("spans", []):
                if abs(s["size"] - TOC_SIZE) < 0.3 and s["text"].strip().isdigit():
                    old_num = int(s["text"].strip())
                    if old_num not in TOC_REMAP:
                        continue
                    new_num = TOC_REMAP[old_num]
                    toc_page.add_redact_annot(fitz.Rect(s["bbox"]), fill=(1, 1, 1))
                    toc_page.apply_redactions()
                    new_text = str(new_num)
                    width = font.text_length(new_text, fontsize=TOC_SIZE)
                    x0 = TOC_RIGHT_EDGE - width
                    baseline_y = s["origin"][1]
                    toc_page.insert_text(
                        (x0, baseline_y), new_text, fontsize=TOC_SIZE, fontname="helv", color=(0, 0, 0)
                    )
                    toc_fixed += 1

    out_path = "print-output/compassionate-curriculum-en.RENUMBERED.pdf"
    doc.save(out_path, garbage=3, deflate=True)
    print(f"Fixed {footer_fixed} footer page numbers and {toc_fixed} TOC entries -> {out_path}")


if __name__ == "__main__":
    main()
