"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Translations } from "./types";
import { fr } from "./fr";
import { en } from "./en";

type Locale = "fr" | "en";

const STORAGE_KEY = "locale";
const translations: Record<Locale, Translations> = { fr, en };

interface TranslationContextValue {
  T: Translations;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const TranslationContext = createContext<TranslationContextValue>({
  T: fr,
  locale: "fr",
  setLocale: () => {},
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "fr") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  return (
    <TranslationContext.Provider value={{ T: translations[locale], locale, setLocale }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => useContext(TranslationContext);
