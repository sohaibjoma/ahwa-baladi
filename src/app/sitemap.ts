import type { MetadataRoute } from 'next';
import { LOCALE_CODES, LOCALES } from '@/i18n/config';
import { absoluteUrl, LANGUAGE_ALTERNATES } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALE_CODES.map((locale) => ({
    url: absoluteUrl(LOCALES[locale].path),
    changeFrequency: 'monthly',
    priority: 1,
    alternates: { languages: LANGUAGE_ALTERNATES }
  }));
}
