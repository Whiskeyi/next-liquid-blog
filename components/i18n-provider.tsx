"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  defaultLocale, isLocale, localeStorageKey, translate,
  type Locale, type MessageKey, type MessageValues
} from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: MessageValues) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(localeStorageKey);
      if (isLocale(stored)) updateLocale(stored);
    } catch {
      // The switch still works when browser storage is unavailable.
    }

    function syncLocale(event: StorageEvent) {
      if (event.key === localeStorageKey || event.key === null) {
        updateLocale(isLocale(event.newValue) ? event.newValue : defaultLocale);
      }
    }

    window.addEventListener("storage", syncLocale);
    return () => window.removeEventListener("storage", syncLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(nextLocale: Locale) {
    updateLocale(nextLocale);
    try {
      window.localStorage.setItem(localeStorageKey, nextLocale);
    } catch {
      // Keep the in-memory preference for this visit.
    }
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: (key, values) => translate(locale, key, values) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
