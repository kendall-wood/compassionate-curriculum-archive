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

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5];

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
        if (ZOOM_STEPS.includes(parsed)) setZoom(parsed);
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

    // Build a circular SVG cursor that matches the current accent and stash
    // it in --cc-cursor; globals.css applies it to every element via the
    // universal selector. Hot-spot is the centre of the circle (16, 16).
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="${accent}" stroke="rgba(0,0,0,0.45)" stroke-width="1"/></svg>`;
    const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 16 16, auto`;
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
    setZoom((z) => {
      const idx = ZOOM_STEPS.indexOf(z);
      const next = idx === -1 ? 1 : Math.min(ZOOM_STEPS.length - 1, idx + 1);
      return ZOOM_STEPS[next];
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_STEPS.indexOf(z);
      const next = idx === -1 ? 1 : Math.max(0, idx - 1);
      return ZOOM_STEPS[next];
    });
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
