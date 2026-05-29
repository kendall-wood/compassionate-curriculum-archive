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

// Cancel any in-flight utterance and immediately queue a new one in the same
// JS tick. This is the documented-stable pattern for Chrome — putting any
// gap (setTimeout, RAF) between cancel() and speak() opens a race window
// where another scheduleSpeak can fire and cancel the new utterance before
// the engine ever starts it. `resume()` is included to unstick the engine
// in case a prior cancel() left it in the (documented) paused state.
function cancelAndSpeak(utter: SpeechSynthesisUtterance) {
  const synth = window.speechSynthesis;
  try {
    synth.cancel();
    synth.resume();
    synth.speak(utter);
  } catch {
    /* ignore */
  }
}

// `speechSynthesis.getVoices()` is empty until the engine fires
// `voiceschanged`. Localhost often has voices warm-cached, but a fresh tab on
// the production domain doesn't — so the first speak() before voices arrive
// uses no voice and silently no-ops on Safari/iOS. We resolve once voices
// land, or after a 1.5s safety timeout (some browsers never fire the event
// but do populate the list after a tick).
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const initial = synth.getVoices();
    if (initial.length) {
      resolve(initial);
      return;
    }
    const onChange = () => {
      const v = synth.getVoices();
      if (v.length) {
        synth.removeEventListener?.("voiceschanged", onChange);
        resolve(v);
      }
    };
    synth.addEventListener?.("voiceschanged", onChange);
    setTimeout(() => {
      synth.removeEventListener?.("voiceschanged", onChange);
      resolve(synth.getVoices());
    }, 1500);
  });
}

// Given a list of voices and a locale like "en" / "zh" / "pt", pick the best
// match. Voice .lang is always BCP47 (e.g. "en-US", "zh-CN"); our locales
// are bare 2-letter codes, so we have to broaden the match. Prefer the
// default voice for the language when one is marked default — those tend to
// sound the most natural per platform.
function pickVoice(
  voices: SpeechSynthesisVoice[],
  locale: string
): SpeechSynthesisVoice | undefined {
  if (!voices.length) return undefined;
  const lc = locale.toLowerCase();
  const base = lc.slice(0, 2);
  const langMatch = voices.filter(
    (v) => v.lang.toLowerCase().slice(0, 2) === base
  );
  if (!langMatch.length) return undefined;
  return langMatch.find((v) => v.default) ?? langMatch[0];
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
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  // Pending speak debounce, so we can cancel it when the user keeps moving
  // the cursor.
  const pendingHoverEl = useRef<HTMLElement | null>(null);
  const hoverDebounceTimer = useRef<number | null>(null);
  // Last speakable element the cursor entered, regardless of whether Option
  // was held. We replay it on Alt-keydown so "hover the text, then press
  // Option" works (otherwise no mouseover ever fires while Option is down).
  const lastHoveredEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!voiceover) return;
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    const coarse = isCoarsePointer();

    // Opt-in verbose logging for production debugging. Enable by appending
    // `?vo-debug` to the URL or by running `localStorage.setItem('cc-vo-debug','1')`
    // in the console. Silent in normal use.
    const debug =
      (typeof location !== "undefined" &&
        new URLSearchParams(location.search).has("vo-debug")) ||
      localStorage.getItem("cc-vo-debug") === "1";
    // eslint-disable-next-line no-console
    const log = debug ? (...a: unknown[]) => console.log("[vo]", ...a) : () => {};
    log("enabled", { locale, coarse });

    // Kick off voice loading immediately so by the time the user hovers a
    // word the engine has a matched voice ready. Without this, the very
    // first utterance on a cold tab uses no voice and silently fails on
    // Safari/iOS Chrome. We re-resolve whenever the locale changes.
    let cancelled = false;
    loadVoices().then((voices) => {
      if (cancelled) return;
      voiceRef.current = pickVoice(voices, locale) ?? null;
      log("voices loaded", {
        count: voices.length,
        picked: voiceRef.current
          ? { name: voiceRef.current.name, lang: voiceRef.current.lang }
          : null,
      });
      if (voices.length === 0) {
        // eslint-disable-next-line no-console
        console.warn(
          "[voiceover] no voices available — speech engine returned an empty list. " +
            "On Chrome this can mean OS TTS is disabled or no language packs are installed."
        );
      }
    });

    function clearTimers() {
      if (hoverDebounceTimer.current !== null) {
        window.clearTimeout(hoverDebounceTimer.current);
        hoverDebounceTimer.current = null;
      }
      pendingHoverEl.current = null;
    }

    function restore() {
      clearTimers();
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
        // Chrome can leave the engine in a `paused` state after cancel()
        // when nothing was actively speaking. resume() unsticks it so the
        // next speak() actually plays.
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }
    }

    function actuallySpeak(el: HTMLElement) {
      if (activeEl.current === el) return;
      // Tear down any previous speech & DOM mutation before starting a new one.
      restore();

      const { original, spans, offsets, text } = wrapWords(el);
      if (!text) return;
      log("speak", {
        tag: el.tagName,
        chars: text.length,
        words: spans.length,
        preview: text.slice(0, 40),
      });

      activeEl.current = el;
      activeOriginalHTML.current = original;

      const utter = new SpeechSynthesisUtterance(text);
      // Prefer an explicitly matched voice over relying on the engine to
      // resolve from `.lang` alone — some browsers (Safari especially) do
      // nothing when given a bare "en" / "zh" because their voice list is
      // keyed by full BCP47 tags like "en-US". `voiceRef` is populated
      // asynchronously when VO is enabled; if it's still null we fall
      // back to setting `.lang` and hoping the engine picks something.
      if (voiceRef.current) {
        utter.voice = voiceRef.current;
        utter.lang = voiceRef.current.lang;
      } else {
        utter.lang = locale;
      }
      utter.rate = 1;
      utter.pitch = 1;

      utter.onerror = (ev) => {
        // "canceled" / "interrupted" are expected churn whenever the user
        // moves to a new element mid-speech; only surface genuine failures.
        if (ev.error === "canceled" || ev.error === "interrupted") {
          log("utter canceled/interrupted (expected)", ev.error);
          return;
        }
        // eslint-disable-next-line no-console
        console.warn("[voiceover] utterance error:", ev.error, {
          lang: utter.lang,
          voice: utter.voice?.name,
        });
      };

      utter.onstart = () => log("utter onstart");

      // `boundary` fires before each word with charIndex into `text`. We
      // accumulate the .cc-vo-spoken class on every word whose offset is
      // <= charIndex so the highlight grows progressively to the right.
      let boundaryCount = 0;
      utter.onboundary = (ev) => {
        if (ev.name && ev.name !== "word") return;
        if (boundaryCount === 0) log("utter first onboundary", ev.charIndex);
        boundaryCount++;
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
        log("utter onend", { boundaryCount });
        spans.forEach((s) => s.classList.add("cc-vo-spoken"));
      };

      cancelAndSpeak(utter);
    }

    // Debounce hover-triggered speech. Rapid mouseovers (which happen
    // naturally when the cursor crosses between adjacent speakables) would
    // otherwise stack speak/cancel cycles and lock up Chrome's engine.
    // 80ms is short enough to feel instant but long enough to absorb
    // micro-jitter while the user settles on a paragraph. `immediate=true`
    // bypasses the debounce entirely — used for deliberate triggers like
    // Alt-keydown and touch-tap.
    function scheduleSpeak(el: HTMLElement, immediate = false) {
      if (activeEl.current === el) return;
      if (immediate) {
        log("schedule (immediate)", { tag: el.tagName });
        // Clear any pending debounce so it doesn't fire on top of us.
        if (hoverDebounceTimer.current !== null) {
          window.clearTimeout(hoverDebounceTimer.current);
          hoverDebounceTimer.current = null;
        }
        pendingHoverEl.current = null;
        actuallySpeak(el);
        return;
      }
      if (pendingHoverEl.current === el && hoverDebounceTimer.current !== null) {
        return; // already queued for this exact element
      }
      pendingHoverEl.current = el;
      if (hoverDebounceTimer.current !== null) {
        window.clearTimeout(hoverDebounceTimer.current);
      }
      log("schedule", { tag: el.tagName, delay: 80 });
      hoverDebounceTimer.current = window.setTimeout(() => {
        hoverDebounceTimer.current = null;
        const target = pendingHoverEl.current;
        pendingHoverEl.current = null;
        if (target && document.contains(target)) actuallySpeak(target);
      }, 80);
    }

    // --- Desktop: Option/Alt + hover ---------------------------------------
    function onMouseOver(e: MouseEvent) {
      if (coarse) return;
      // Always track the most recent speakable under the cursor so a later
      // Alt-keydown can replay it (covers "hover first, then press Option").
      const target = findSpeakable(e.target as Element);
      if (target) lastHoveredEl.current = target;
      if (!altDown.current && !e.altKey) return;
      if (!target) return;
      // mouseover bubbles — findSpeakable gave us the nearest speakable.
      scheduleSpeak(target);
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
      if (e.key === "Alt" || e.altKey) {
        const wasDown = altDown.current;
        altDown.current = true;
        // Pressing Option AFTER the cursor is already on a speakable doesn't
        // fire mouseover, so we'd otherwise be silent until the user wiggled
        // the mouse. Replay the last hovered element on the rising edge so
        // "hover, then press Option" works the way the user expects.
        if (!wasDown && lastHoveredEl.current) {
          log("alt down → replay last hover", lastHoveredEl.current.tagName);
          scheduleSpeak(lastHoveredEl.current, true);
        }
      }
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
      // Tap is itself a deliberate gesture — speak immediately, no debounce.
      actuallySpeak(target);
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
      cancelled = true;
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
