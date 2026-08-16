#!/usr/bin/env python3
"""Fast, text-only extraction + spellcheck feeding the /portal QA Check tab.

Unlike portal-extract.py (which renders every page to a JPEG and pulls
embedded images for the page viewer — the expensive part), this only pulls
each page's plain text and runs a spellcheck pass over it. That's all the
order-consistency (done in TypeScript, see src/lib/portal/qa-order-check.ts)
and spellcheck checks need, so an uploaded PDF can be checked in a couple of
seconds instead of the minute or so full rendering takes.

Usage:
  python3 scripts/portal-qa-extract.py path/to.pdf

Prints a single JSON document to stdout:
  {
    "pageCount": N,
    "pages": [{"page": 1, "text": "..."}, ...],
    "spellcheck": [{"word": "teh", "count": 3, "pages": [4, 12]}, ...]
  }

InDesign print exports (unlike the site's own single-page-per-sheet PDF) put
a full two-page spread on one PDF page — landscape, double-width. Left
(verso) and right (recto) only carry their own running header on the recto
side ("Compassionate Curriculum" on the left vs. "II. Section / L6. Lesson"
on the right), so a spread's raw text is really two pages' worth of content
glued together. Splitting each spread by its horizontal midpoint before
emitting "pages" keeps a left page's tail-of-previous-lesson content from
being lumped in with the right page's (different) lesson — see
attributeSegments() in src/lib/portal/running-header.ts, which is what
actually resolves a leftover left-page entry (no header of its own) to
whichever lesson most recently appeared.
"""

import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF
from spellchecker import SpellChecker

ROOT = Path(__file__).resolve().parent.parent
ALLOWLIST_PATH = ROOT / "scripts" / "qa-spellcheck-allowlist.json"

# Matches URLs/bare domains (youtu.be/..., something.com, etc.) so they're
# stripped before tokenizing, and words with internal apostrophes only
# ("don't", "facilitator's") — hyphenated compounds are split into their
# parts at spellcheck time instead (below), since a hyphenated word being a
# single unknown token was the single biggest source of false positives
# ("open-ended", "self-care", "pre-work" etc. all read as "misspelled"
# otherwise, when both halves are perfectly ordinary words).
URL_RE = re.compile(r"https?://\S+|www\.\S+|\b[a-zA-Z0-9-]+\.(?:com|org|net|be|edu|gov|io|co)\b\S*")
WORD_RE = re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)*(?:-[A-Za-z]+(?:['’][A-Za-z]+)*)*")


# Longest-first so "n't" matches before a bare "'t" would. Both straight and
# curly apostrophes show up depending on how the PDF was typeset.
_CONTRACTION_SUFFIXES = sorted(
    {s for base in ["n't", "'re", "'ve", "'ll", "'d", "'m", "'s"] for s in (base, base.replace("'", "’"))},
    key=len,
    reverse=True,
)


def strip_contraction(word: str) -> str:
    """"You're" -> "You", "don't" -> "do", "Harrell's" -> "Harrell".

    Without this, the dictionary check runs on the whole contraction as one
    token — which of course isn't a dictionary word — so ordinary
    contractions and possessives (the majority of what got flagged in an
    early pass of this tool) all read as "misspelled" even though the
    underlying word is perfectly ordinary.
    """
    low = word.lower()
    for suf in _CONTRACTION_SUFFIXES:
        if low.endswith(suf.lower()) and len(word) > len(suf):
            return word[: -len(suf)]
    return word


def split_word(token: str) -> list[str]:
    return [strip_contraction(part) for part in token.split("-") if part]


def normalize(word: str) -> str:
    # Curly and straight apostrophes are typographically distinct but mean
    # the same thing here — without this, an allowlist entry written with a
    # straight quote silently fails to match text using a curly one (or
    # vice versa), which is exactly what happened with "Hawai'i".
    return word.lower().replace("’", "'")


def load_allowlist() -> set[str]:
    if not ALLOWLIST_PATH.exists():
        return set()
    with open(ALLOWLIST_PATH, "r", encoding="utf-8") as f:
        return {normalize(w.strip()) for w in json.load(f)}


def is_misspelled(token: str, checker: SpellChecker, allowlist: set[str]) -> bool:
    parts = split_word(token)
    unknown = checker.unknown([normalize(p) for p in parts])
    return any(normalize(p) not in allowlist for p in parts if normalize(p) in unknown)


def run_spellcheck(pages: list[dict], allowlist: set[str]) -> list[dict]:
    checker = SpellChecker()
    # Occurrences per lowercase word: display form (first seen), count, pages.
    seen: dict[str, dict] = {}

    for p in pages:
        text = URL_RE.sub(" ", p["text"])
        tokens = WORD_RE.findall(text)
        # Short ALL-CAPS runs (TOC, MNF, RP...) read as acronyms/labels far
        # more often than typos in this document, so they're excluded to cut
        # down on noise — anything longer than 5 letters still gets checked.
        # Very short tokens (<=2 letters) are almost never a meaningful typo
        # signal either ("pp", "to", "AI" as part of a compound, etc).
        candidates = [t for t in tokens if len(t) > 2 and not (t.isupper() and len(t) <= 5)]
        for token in candidates:
            lw = normalize(token)
            if lw in allowlist or not is_misspelled(token, checker, allowlist):
                continue
            entry = seen.setdefault(lw, {"word": token, "count": 0, "pages": []})
            entry["count"] += 1
            if p["page"] not in entry["pages"]:
                entry["pages"].append(p["page"])

    results = sorted(seen.values(), key=lambda e: (-e["count"], e["word"]))
    return results


def clean(text: str) -> str:
    return re.sub("\xad\\s*", "", text).strip()  # \xad = soft hyphen (U+00AD)


def spread_halves(page) -> list[str]:
    """Splits a landscape two-page-spread PDF page into (left, right) text,
    by each *word's* horizontal position relative to the page midpoint.

    Block-level splitting isn't safe here: the running header and folio
    aren't always two separate per-page frames — on some spreads they're a
    single frame spanning the whole spread width (book title on a left tab
    stop, section/lesson name on a right tab stop, one paragraph/line). A
    block's bounding box in that case covers the full width, so classifying
    by the block would put the entire line on whichever side it starts on.
    Splitting by each word's own position and regrouping into lines avoids
    that — content paragraphs are never that wide, so this never fragments
    real prose, only the header/folio lines that are actually two things.
    """
    mid_x = page.rect.width / 2
    left_lines: dict[tuple[int, int], list] = {}
    right_lines: dict[tuple[int, int], list] = {}
    for x0, y0, _x1, _y1, word, block_no, line_no, word_no in page.get_text("words"):
        bucket = left_lines if x0 < mid_x else right_lines
        bucket.setdefault((block_no, line_no), []).append((word_no, y0, x0, word))

    halves = []
    for lines in (left_lines, right_lines):
        rows = []
        for words in lines.values():
            words.sort(key=lambda t: t[0])  # word_no: original order within the line
            y0 = words[0][1]
            x0 = words[0][2]
            rows.append((y0, x0, " ".join(w[3] for w in words)))
        rows.sort(key=lambda t: (round(t[0]), t[1]))  # reading order: top-to-bottom, then left-to-right
        halves.append("\n".join(r[2] for r in rows))
    return halves


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: portal-qa-extract.py path/to.pdf")
    pdf_path = sys.argv[1]

    # PyMuPDF's TEXT_DEHYPHENATE flag was tried here and reverted: it rejoins
    # ANY hyphen sitting at a line-wrap, which fixes true soft-hyphen breaks
    # ("pre\xadsented" -> "presented") but also wrongly merges real
    # hyphenated compounds that just happen to wrap there ("trauma-\n
    # informed" -> "traumainformed", losing a hyphen that was supposed to
    # stay). A real soft hyphen (U+00AD) is unambiguous — it never renders
    # and always means "join these", so it's stripped by hand below instead,
    # leaving genuine hyphens (which are ambiguous — could be a real
    # line-wrap or a real compound word) alone rather than guessing.
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        page_num = i + 1
        is_spread = page.rect.width > page.rect.height  # landscape spread vs. a single portrait page (e.g. the cover)
        if is_spread:
            for half_text in spread_halves(page):
                pages.append({"page": page_num, "text": clean(half_text)})
        else:
            pages.append({"page": page_num, "text": clean(page.get_text("text"))})

    allowlist = load_allowlist()
    spellcheck = run_spellcheck(pages, allowlist)

    print(json.dumps({"pageCount": len(pages), "pages": pages, "spellcheck": spellcheck}))


if __name__ == "__main__":
    main()
