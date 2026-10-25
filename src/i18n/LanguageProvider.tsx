'use client';

import {
  addTransitionType,
  createContext,
  type ReactNode,
  startTransition,
  use,
  useLayoutEffect,
  useState,
  ViewTransition
} from 'react';
import { LOCALES, type Locale } from '@/i18n/config';
import { type Dictionary, dictionaries } from '@/i18n/dictionary';

interface LanguageContextValue {
  locale: Locale;
  dir: (typeof LOCALES)[Locale]['dir'];
  t: Dictionary;
  /** Localizes digits: Arabic-Indic numerals in Arabic. */
  num: (value: number | string) => string;
  percent: (value: number) => string;
  switchLocale: (locale: Locale) => void;
}

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Each locale is prerendered at its own URL for SEO. Switching swaps the dictionary in
 * state, so every component keeps its state, and rewrites the URL without navigating.
 */
export function LanguageProvider({
  initialLocale,
  children
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const t = dictionaries[locale];
  const { htmlLang, dir } = LOCALES[locale];

  // Commit-time, so the page flips direction in the same frame as its text (and
  // re-applies after React Strict Mode resets <html> in development).
  useLayoutEffect(() => {
    document.documentElement.lang = htmlLang;
    document.documentElement.dir = dir;
    document.title = t.meta.title;
  }, [htmlLang, dir, t]);

  function switchLocale(next: Locale) {
    if (next === locale) return;
    const { search, hash } = window.location;
    window.history.replaceState(null, '', LOCALES[next].path + search + hash);
    startTransition(() => {
      addTransitionType('locale-switch');
      setLocale(next);
    });
  }

  const num = (value: number | string) =>
    locale === 'ar'
      ? String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)])
      : String(value);
  const percent = (value: number) =>
    `${num(value)}${locale === 'ar' ? '٪' : '%'}`;

  return (
    <LanguageContext value={{ locale, dir, t, num, percent, switchLocale }}>
      <ViewTransition
        default="none"
        update={{ 'locale-switch': 'auto', default: 'none' }}
      >
        {children}
      </ViewTransition>
    </LanguageContext>
  );
}

export function useLanguage() {
  const context = use(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return context;
}
