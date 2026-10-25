import type { Metadata } from 'next';
import {
  DEFAULT_LOCALE,
  LOCALE_CODES,
  LOCALES,
  type Locale
} from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionary';

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const deployUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl && `https://${vercelUrl}`);

if (!deployUrl && process.env.NODE_ENV === 'production') {
  console.warn(
    'NEXT_PUBLIC_SITE_URL is not set: canonical, hreflang and sitemap URLs will point to localhost.'
  );
}

/** Canonical origin: NEXT_PUBLIC_SITE_URL, else Vercel's production domain. */
export const SITE_URL = deployUrl || 'http://localhost:3000';

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;

/** hreflang map shared by the page metadata and the sitemap. */
export const LANGUAGE_ALTERNATES: Record<string, string> = {
  ...Object.fromEntries(
    LOCALE_CODES.map((locale) => [locale, absoluteUrl(LOCALES[locale].path)])
  ),
  'x-default': absoluteUrl(LOCALES[DEFAULT_LOCALE].path)
};

/** Open Graph/Twitter titles and descriptions are inherited from title/description. */
export function buildMetadata(locale: Locale): Metadata {
  const { meta, nav } = dictionaries[locale];
  const shareImage = {
    url: `/og/${locale}.png`,
    width: 1200,
    height: 630,
    alt: meta.ogAlt,
    type: 'image/png'
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    applicationName: nav.brand,
    category: 'food',
    alternates: {
      canonical: LOCALES[locale].path,
      languages: LANGUAGE_ALTERNATES
    },
    openGraph: {
      type: 'website',
      url: LOCALES[locale].path,
      siteName: nav.brand,
      locale: LOCALES[locale].ogLocale,
      alternateLocale: LOCALE_CODES.filter((other) => other !== locale).map(
        (other) => LOCALES[other].ogLocale
      ),
      images: [shareImage]
    },
    twitter: { card: 'summary_large_image', images: [shareImage] },
    robots: { googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 } },
    appleWebApp: { title: nav.brand },
    formatDetection: { telephone: false, address: false, email: false }
  };
}

/** schema.org graph: the site plus the free interactive tea studio it hosts. */
export function buildJsonLd(locale: Locale) {
  const { meta, nav } = dictionaries[locale];
  const home = absoluteUrl('/');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${home}#website`,
        name: dictionaries[DEFAULT_LOCALE].nav.brand,
        alternateName: LOCALE_CODES.filter(
          (other) => other !== DEFAULT_LOCALE
        ).map((other) => dictionaries[other].nav.brand),
        url: home,
        inLanguage: LOCALE_CODES.map((code) => LOCALES[code].htmlLang)
      },
      {
        '@type': 'WebApplication',
        name: nav.brand,
        url: absoluteUrl(LOCALES[locale].path),
        description: meta.description,
        inLanguage: LOCALES[locale].htmlLang,
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EGP' },
        isPartOf: { '@id': `${home}#website` }
      }
    ]
  };
}
