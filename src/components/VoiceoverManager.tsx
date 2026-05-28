"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

import { useTheme } from "./ThemeProvider";

// Elements whose text content is eligible to be read aloud. Headings, prose,
// list items, blockquotes, plus interactive labels (button / a / summary).
// Toolbar utility controls opt out by adding `data-cc-no-vo=""` to a parent
// (see Toolbar.tsx).
const SPEAKABLE_SELECTOR =
  "p, li, h1, h2, h3, h4, h5, h6, blockquote, a, button, summary";

// Walks up from `el` looking for the nearest speakable ancestor. Returns null
// if any ancestor on the way is opted out via `[data-cc-no-vo]`, so an entire
// region (e.g. the Settings utility row) can be excluded with one attribute.
function findSpeakable(el: Element | null): HTMLElement | null {
  let node: Element | null = el;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement && node.dataset.ccNoVo !== undefined) {
      return null;
    }
    if (node instanceof HTMLElement && node.matches(SPEAKABLE_SELECTOR)) {
      // Skip purely whitespace targets (e.g. layout-only buttons).
      if ((node.innerText ?? "").trim().length > 0) return node;
    }
    node = node.parentElement;
  }
  return null;
}

// True for devices with a coarse pointer / no hover — i.e. touch. We branch
// the trigger gesture on this: desktops use Option+hover, touch uses tap.
function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

// Some browsers (notably Chrome) get stuck if you call speak() immediately
// after cancel() in the same tick. A microtask gap is enough to recover.
function speakSoon(utter: SpeechSynthesisUtterance) {
  window.speechSynthesis.cancel();
  // Two RAFs ≈ ~32ms — generous enough for Chrome's queue to flush without
  // adding human-noticeable latency.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.speechSynthesis.speak(utter);
  }));
}

type WrapResult = {
  /** Original innerHTML, restored when speech ends or moves to another node. */
  original: string;
  /** Flat list of word <span>s in reading order. */
  spans: HTMLSpanElement[];
  /** Char offsets (into the utterance's `text`) where each word begins. */
  offsets: number[];
  /** The full text passed to the utterance. */
  text: string;
};

// Walk every text node inside `el`, splitting on whitespace and replacing each
// non-whitespace token with a <span class="cc-vo-word">. Preserves nested
// elements (links, <strong>, etc.) by only touching TEXT_NODEs. Returns the
// original HTML so we can restore it verbatim on cleanup.
function wrapWords(el: HTMLElement): WrapResult {
  const original = el.innerHTML;
  const spans: HTMLSpanElement[] = [];
  const offsets: number[] = [];
  let charCursor = 0;
  let textBuf = "";

  // Snapshot text nodes first — mutating during traversal would invalidate
  // the walker.
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) textNodes.push(n as Text);

  for (const tn of textNodes) {
    const raw = tn.nodeValue ?? "";
    if (!raw) continue;
    const parent = tn.parentNode;
    if (!parent) continue;
    // Split keeping whitespace runs so reflow is identical to the original.
    const parts = raw.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (part === "") continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        textBuf += part;
        charCursor += part.length;
      } else {
        const span = document.createElement("span");
        span.className = "cc-vo-word";
        span.textContent = part;
        spans.push(span);
        offsets.push(charCursor);
        frag.appendChild(span);
        textBuf += part;
        charCursor += part.length;
      }
    }
    parent.replaceChild(frag, tn);
  }

  return { original, spans, offsets, text: textBuf.trim() };
}

export function VoiceoverManager() {
  const { voiceover } = useTheme();
  const locale = useLocale();

  // Mutable refs so the effect's handlers always see the latest values
  // without re-binding listeners on every render.
  const altDown = useRef(false);
  const activeEl = useRef<HTMLElement | null>(null);
  const activeOriginalHTML = useRef<string | null>(null);

  useEffect(() => {
    if (!voiceover) return;
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const coarse = isCoarsePointer();

    function restore() {
      if (activeEl.current && activeOriginalHTML.current !== null) {
        // Element may have been unmounted by a route change; guard.
        if (document.contains(activeEl.current)) {
          activeEl.current.innerHTML = activeOriginalHTML.current;
        }
      }
      activeEl.current = null;
      activeOriginalHTML.current = null;
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }

    function speakElement(el: HTMLElement) {
      // Already speaking this exact node — leave it be.
      if (activeEl.current === el) return;
      restore();

      const { original, spans, offsets, text } = wrapWords(el);
      if (!text) return;

      activeEl.current = el;
      activeOriginalHTML.current = original;

      const utter = new SpeechSynthesisUtterance(text);
      // BCP47-ish: "en", "es", "zh"... Browsers normalize and pick a voice.
      utter.lang = locale;
      utter.rate = 1;
      utter.pitch = 1;

      // `boundary` fires before each word with charIndex into `text`. We
      // accumulate the .cc-vo-spoken class on every word whose offset is
      // <= charIndex so the highlight grows progressively to the right.
      utter.onboundary = (ev) => {
        if (ev.name && ev.name !== "word") return;
        const idx = ev.charIndex ?? 0;
        for (let i = 0; i < offsets.length; i++) {
          if (offsets[i] <= idx) spans[i].classList.add("cc-vo-spoken");
          else break;
        }
      };

      // Safari/Firefox often skip `boundary` entirely. Treat `end` as a
      // "fill the rest" so the visual still completes even without
      // per-word timing.
      utter.onend = () => {
        spans.forEach((s) => s.classList.add("cc-vo-spoken"));
      };

      speakSoon(utter);
    }

    // --- Desktop: Option/Alt + hover ---------------------------------------
    function onMouseOver(e: MouseEvent) {
      if (coarse) return;
      if (!altDown.current && !e.altKey) return;
      // mouseover bubbles — find nearest speakable from the actual target.
      const target = findSpeakable(e.target as Element);
      if (!target) return;
      speakElement(target);
    }

    function onMouseOut(e: MouseEvent) {
      if (coarse) return;
      if (!activeEl.current) return;
      // If pointer leaves the active speakable for somewhere outside it,
      // stop reading. `relatedTarget` is null when leaving the window.
      const related = e.relatedTarget as Node | null;
      if (related && activeEl.current.contains(related)) return;
      restore();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Alt" || e.altKey) altDown.current = true;
      // Esc always cancels.
      if (e.key === "Escape") restore();
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "Alt" || !e.altKey) {
        altDown.current = false;
        // Releasing Option stops mid-utterance — matches the gesture model
        // the user described (hold-to-speak).
        restore();
      }
    }

    // --- Touch: tap a speakable to start, tap again (or anywhere outside) to stop
    function onClick(e: MouseEvent) {
      if (!coarse) return;
      const target = findSpeakable(e.target as Element);
      if (!target) {
        // Tap outside any speakable — stop current.
        if (activeEl.current) restore();
        return;
      }
      if (activeEl.current === target) {
        restore();
        return;
      }
      // Prevent the tap from also activating a button/link underneath when
      // we're using it as a "read me" gesture.
      if (target.matches("a, button")) e.preventDefault();
      speakElement(target);
    }

    function onBlur() {
      // Lost focus — release Alt latch and stop.
      altDown.current = false;
      restore();
    }

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("click", onClick, true);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("blur", onBlur);
      restore();
    };
  }, [voiceover, locale]);

  return null;
}
