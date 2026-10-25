import type { MetadataRoute } from 'next';
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionary';

export default function manifest(): MetadataRoute.Manifest {
  const { meta, nav } = dictionaries[DEFAULT_LOCALE];

  return {
    name: `${nav.brand}: ${nav.tagline}`,
    short_name: nav.brand,
    description: meta.description,
    lang: LOCALES[DEFAULT_LOCALE].htmlLang,
    dir: LOCALES[DEFAULT_LOCALE].dir,
    start_url: '/',
    display: 'standalone',
    background_color: '#fdf8ee',
    theme_color: '#fdf8ee',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  };
}
