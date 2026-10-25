import type { Metadata } from 'next';
import { LOCALES } from '@/i18n/config';
import { dictionaries } from '@/i18n/dictionary';
import { fontVariables } from '@/lib/fonts';
import './globals.css';

const { ar, en } = dictionaries;

export const metadata: Metadata = {
  title: `${ar.notFound.title} | ${en.notFound.title}`
};

/** Bilingual 404 for any URL outside the locale routes (rendered without a layout). */
export default function GlobalNotFound() {
  return (
    <html
      lang={LOCALES.ar.htmlLang}
      dir={LOCALES.ar.dir}
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full items-center justify-center bg-cream p-4 font-sans text-espresso">
        <main className="card w-full max-w-lg bg-paper p-8 text-center">
          <p
            aria-hidden="true"
            className="font-black font-display text-7xl text-koshary"
          >
            ٤٠٤
          </p>
          <h1 className="mt-4 text-balance font-bold font-display text-3xl">
            {ar.notFound.title}
          </h1>
          <p className="mt-3 text-pretty text-lg">{ar.notFound.body}</p>
          <p lang="en" dir="ltr" className="mt-3 text-pretty">
            {en.notFound.body}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href={LOCALES.ar.path} className="btn bg-koshary text-cream">
              {ar.notFound.home}
            </a>
            <a
              href={LOCALES.en.path}
              lang={LOCALES.en.htmlLang}
              hrefLang="en"
              className="btn bg-brass-light"
            >
              {en.notFound.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
