/** Every locale the site serves; the default one lives at the root URL. */
export const LOCALES = {
  ar: {
    htmlLang: 'ar-EG',
    dir: 'rtl',
    path: '/',
    ogLocale: 'ar_EG',
    label: 'عربي مصري'
  },
  en: {
    htmlLang: 'en',
    dir: 'ltr',
    path: '/en',
    ogLocale: 'en_US',
    label: 'EN'
  }
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'ar';

/** Locale codes in switcher order. */
export const LOCALE_CODES = Object.keys(LOCALES) as Locale[];

export function isLocale(value: string): value is Locale {
  return Object.hasOwn(LOCALES, value);
}
