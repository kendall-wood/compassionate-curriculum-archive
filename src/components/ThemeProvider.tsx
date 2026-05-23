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
  "#fff75d",
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#C77DFF",
  "#FF9F1C",
] as const;

// Continuous type-scale range. Each click of +/- moves by ZOOM_STEP within
// [ZOOM_MIN, ZOOM_MAX]. Stored as a multiplier and applied to the root font
// size so every rem-based dimension grows or shrinks together.
const ZOOM_MIN = 0.8;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;

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
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomLabel: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEYS = {
  theme: "cc-theme",
  zoom: "cc-zoom",
  accent: "cc-accent",
} as const;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [zoom, setZoom] = useState<number>(1);
  const [accent, setAccentState] = useState<string>("#fff75d");

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEYS.theme) as Theme | null;
      const z = localStorage.getItem(STORAGE_KEYS.zoom);
      const a = localStorage.getItem(STORAGE_KEYS.accent);
      if (t === "dark" || t === "light") setThemeState(t);
      if (z) {
        const parsed = parseFloat(z);
        if (!Number.isNaN(parsed)) setZoom(clampZoom(parsed));
      }
      if (a) setAccentState(a);
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

  useEffect(() => {
    document.documentElement.style.setProperty("--color-accent", accent);

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

  const setAccent = useCallback((color: string) => setAccentState(color), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      accent,
      setAccent,
      zoom,
      zoomIn,
      zoomOut,
      zoomLabel: `${Math.round(zoom * 100)}%`,
    }),
    [theme, setTheme, toggleTheme, accent, setAccent, zoom, zoomIn, zoomOut]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
