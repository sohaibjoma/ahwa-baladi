import type { Metadata, ParamMatching, Viewport } from 'next';
import { notFound } from 'next/navigation';
import MotionProvider from '@/components/MotionProvider';
import { isLocale, LOCALE_CODES, LOCALES } from '@/i18n/config';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { fontVariables } from '@/lib/fonts';
import { buildJsonLd, buildMetadata } from '@/lib/seo';
import '../globals.css';

/** Every page is prerendered; the build fails if request-time work slips in. */
export const ensureStatic = 'navigation';

/**
 * Unknown locales get the static global 404 (Cache Components' stand-in for
 * `dynamicParams = false`). Still `unstable_` in Next 16.4: re-check on upgrades.
 */
export const unstable_paramMatching = {
  locale: 'not-found'
} satisfies ParamMatching<'locale'>;

export const viewport: Viewport = {
  themeColor: '#fdf8ee',
  colorScheme: 'light'
};

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: Pick<LayoutProps<'/[locale]'>, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildMetadata(locale) : {};
}

export default async function LocaleLayout({
  children,
  params
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={LOCALES[locale].htmlLang}
      dir={LOCALES[locale].dir}
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full bg-cream font-sans text-espresso">
        <LanguageProvider initialLocale={locale}>
          <MotionProvider>{children}</MotionProvider>
        </LanguageProvider>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined; every "<" is escaped
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(locale)).replace(/</g, '\\u003c')
          }}
        />
      </body>
    </html>
  );
}
