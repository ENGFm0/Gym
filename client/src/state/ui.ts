import { create } from "zustand";
import type { Lang, Theme } from "@/lib/types";

interface UiState {
  lang: Lang;
  theme: Theme;
  toast: string | null;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  say: (message: string) => void;
}

const read = <T extends string>(key: string, fallback: T): T => {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode: the choice simply will not survive a reload */
  }
};

/** Applies language and theme to the document so RTL and the palette follow. */
export function paint(lang: Lang, theme: Theme) {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
}

let toastTimer: number | undefined;

export const useUi = create<UiState>((set, get) => ({
  lang: read<Lang>("fitcore.lang", "ar"),
  theme: read<Theme>("fitcore.theme", "dark"),
  toast: null,

  setLang: (lang) => {
    write("fitcore.lang", lang);
    paint(lang, get().theme);
    set({ lang });
  },

  setTheme: (theme) => {
    write("fitcore.theme", theme);
    paint(get().lang, theme);
    set({ theme });
  },

  toggleLang: () => get().setLang(get().lang === "ar" ? "en" : "ar"),
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),

  say: (message) => {
    set({ toast: message });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => set({ toast: null }), 1900);
  }
}));

export const t = <T>(lang: Lang, ar: T, en: T) => (lang === "en" ? en : ar);
