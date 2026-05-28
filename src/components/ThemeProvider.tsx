"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

export const ACCENT_SWATCHES = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#0000FF",
  "#7F00FF",
  "#FF007F",
] as const;

/** Returns #000000 or #ffffff — whichever is more legible on top of `hex`. */
function contrastFor(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 0.45 ? "#000000" : "#ffffff";
  } catch {
    return "#000000";
  }
}

// Continuous type-scale range. Each click of +/- moves by ZOOM_STEP within
// [ZOOM_MIN, ZOOM_MAX]. Stored as a multiplier and applied to the root font
// size so every rem-based dimension grows or shrinks together.
// ZOOM_DEFAULT is the "100%" reference — the label is shown relative to it.
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.1;
// 0.9 is the new "100%" reference — chosen because it matches the previous
// 60% rendering (0.9 / 1.5 = 0.6) which proved to be the most comfortable
// default for the site's typography.
const ZOOM_DEFAULT = 0.9;

function clampZoom(z: number): number {
  if (Number.isNaN(z)) return 1;
  // Round to nearest step to avoid floating-point drift across reloads.
  const stepped = Math.round(z / ZOOM_STEP) * ZOOM_STEP;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(stepped.toFixed(2))));
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  accent: string;
  setAccent: (color: string) => void;
  /** True when the user has selected the monochrome swatch. While true, the
   *  accent is always white in dark mode and black in light mode, and
   *  follows the theme automatically. Picking any colored swatch clears it. */
  mono: boolean;
  setMono: () => void;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
  zoomLabel: string;
  showUtilityRow: boolean;
  setShowUtilityRow: (v: boolean | ((prev: boolean) => boolean)) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEYS = {
  theme: "cc-theme",
  zoom: "cc-zoom",
  accent: "cc-accent",
  mono: "cc-mono",
} as const;

function monoAccentFor(theme: Theme): string {
  return theme === "dark" ? "#ffffff" : "#000000";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [zoom, setZoom] = useState<number>(ZOOM_DEFAULT);
  const [accent, setAccentState] = useState<string>("#fff75d");
  const [mono, setMonoState] = useState<boolean>(false);
  const [showUtilityRow, setShowUtilityRow] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEYS.theme) as Theme | null;
      const z = localStorage.getItem(STORAGE_KEYS.zoom);
      const a = localStorage.getItem(STORAGE_KEYS.accent);
      const m = localStorage.getItem(STORAGE_KEYS.mono);
      if (t === "dark" || t === "light") setThemeState(t);
      if (z) {
        const parsed = parseFloat(z);
        if (!Number.isNaN(parsed)) setZoom(clampZoom(parsed));
      }
      if (m === "1") {
        setMonoState(true);
        setAccentState(monoAccentFor(t === "dark" ? "dark" : "light"));
      } else if (a) {
        setAccentState(a);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--zoom", String(zoom));
    try {
      localStorage.setItem(STORAGE_KEYS.zoom, String(zoom));
    } catch {
      /* ignore */
    }
  }, [zoom]);

  // When mono mode is on, keep accent locked to white-on-dark / black-on-light
  // whenever the theme flips. This is what makes the monochrome swatch
  // "follow" the theme instead of stranding the user with e.g. black text on
  // a black background after toggling to dark mode.
  useEffect(() => {
    if (!mono) return;
    const next = monoAccentFor(theme);
    setAccentState((prev) => (prev === next ? prev : next));
  }, [mono, theme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", accent);
    document.documentElement.style.setProperty("--color-accent-fg", contrastFor(accent));

    // Circular SVG cursor matching the current accent, no drop shadow.
    // Hot-spot is the centre.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="14" fill="${accent}"/></svg>`;
    const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 14 14, auto`;
    document.documentElement.style.setProperty("--cc-cursor", url);

    try {
      localStorage.setItem(STORAGE_KEYS.accent, accent);
    } catch {
      /* ignore */
    }
  }, [accent]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.mono, mono ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [mono]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    []
  );

  const zoomIn = useCallback(() => {
    setZoom((z) => clampZoom(z + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => clampZoom(z - ZOOM_STEP));
  }, []);

  const zoomReset = useCallback(() => {
    setZoom(ZOOM_DEFAULT);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return;
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setShowUtilityRow(true);
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        setShowUtilityRow(true);
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        setShowUtilityRow(true);
        zoomReset();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomIn, zoomOut, zoomReset]);

  // Picking a specific color always exits mono mode — the user has chosen a
  // concrete hue, so the accent should stop tracking the theme.
  const setAccent = useCallback((color: string) => {
    setMonoState(false);
    setAccentState(color);
  }, []);

  // Enter mono mode and set the accent to whatever matches the current theme.
  const setMono = useCallback(() => {
    setMonoState(true);
    setAccentState(monoAccentFor(theme));
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      accent,
      setAccent,
      mono,
      setMono,
      zoom,
      zoomIn,
      zoomOut,
      zoomReset,
      zoomLabel: `${Math.round((zoom / ZOOM_DEFAULT) * 100)}%`,
      showUtilityRow,
      setShowUtilityRow,
    }),
    [theme, setTheme, toggleTheme, accent, setAccent, mono, setMono, zoom, zoomIn, zoomOut, zoomReset, showUtilityRow, setShowUtilityRow]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
