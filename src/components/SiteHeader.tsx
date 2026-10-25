'use client';

import { m } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { type MouseEvent, useState } from 'react';
import { DEFAULT_ORDER, liquidColor } from '@/data/tea';
import { LOCALE_CODES, LOCALES, type Locale } from '@/i18n/config';
import { useLanguage } from '@/i18n/LanguageProvider';
import { playClink, setMuted } from '@/utils/sound';

/** The favicon's glass, poured with the house order. */
const HOUSE_TEA = liquidColor(DEFAULT_ORDER);
const STEAM = [
  'M26 11c-1.6-2.2 1.6-3.8 0-6',
  'M32 10c-1.6-2.2 1.6-3.8 0-6',
  'M38 11c-1.6-2.2 1.6-3.8 0-6'
];

function SteamingGlass() {
  return (
    <svg
      viewBox="16 0 32 54"
      aria-hidden="true"
      className="h-9 w-6 overflow-visible"
    >
      {STEAM.map((d, i) => (
        <m.path
          key={d}
          d={d}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="stroke-espresso"
          animate={{ y: [3, -4], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2.4,
            delay: i * 0.8,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
      <path
        d="M19 13h26c-.8 8.5-6 12.5-6 18 0 4.6 5 7.6 5 13.4 0 3.2-1.4 6.6-1.4 6.6H21.4S20 47.6 20 44.4c0-5.8 5-8.8 5-13.4 0-5.5-5.2-9.5-6-18z"
        strokeWidth="3.5"
        strokeLinejoin="round"
        className="fill-cream stroke-espresso"
      />
      <path
        d="M23.3 22h17.4c-1.5 3.8-4.2 6-4.2 9 0 4.4 5 7.2 5 12.6 0 1.8-.6 3.6-.6 3.6H23.1s-.6-1.8-.6-3.6c0-5.4 5-8.2 5-12.6 0-3-2.7-5.2-4.2-9z"
        fill={HOUSE_TEA}
      />
      <path
        d="M25.6 37.5c-.8 1.6-1 3.4-.6 5.4"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="stroke-cream"
      />
    </svg>
  );
}

export default function SiteHeader() {
  const { locale, t, switchLocale } = useLanguage();
  const [muted, setMutedState] = useState(false);

  function switchTo(event: MouseEvent<HTMLAnchorElement>, next: Locale) {
    // Modified clicks keep their native meaning (new tab, new window...).
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    switchLocale(next);
  }

  function toggleSound() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playClink();
  }

  return (
    <>
      <a
        href="#main"
        className="btn fixed inset-s-4 top-4 z-50 translate-y-[-200%] bg-brass-light focus:translate-y-0"
      >
        {t.nav.skip}
      </a>
      <header className="sticky top-0 z-40 border-espresso border-b-3 bg-cream">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:h-18 sm:gap-3 sm:px-6">
          <a
            href={LOCALES[locale].path}
            className="group flex min-w-0 items-center gap-2 rounded-xl sm:gap-2.5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border-3 border-espresso bg-brass-light shadow-brutal-sm transition-transform duration-200 group-hover:-rotate-6">
              <SteamingGlass />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block whitespace-nowrap font-bold font-display text-base sm:text-2xl">
                {t.nav.brand}
              </span>
              <span className="hidden font-semibold text-sm min-[440px]:block">
                {t.nav.tagline}
              </span>
            </span>
          </a>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav aria-label={t.nav.langGroup}>
              <ul className="flex rounded-xl border-3 border-espresso bg-paper shadow-brutal">
                {LOCALE_CODES.map((code) => {
                  const current = code === locale;
                  return (
                    <li
                      key={code}
                      className="group border-espresso not-first:border-s-3"
                    >
                      <a
                        href={LOCALES[code].path}
                        hrefLang={code}
                        lang={LOCALES[code].htmlLang}
                        aria-current={current ? 'true' : undefined}
                        onClick={(event) => switchTo(event, code)}
                        className={`flex min-h-11 min-w-11 items-center justify-center px-2.5 font-bold text-sm transition-colors sm:px-3 group-first:rounded-s-[9px] group-last:rounded-e-[9px] ${
                          current
                            ? 'bg-koshary text-cream'
                            : 'hover:bg-brass-light'
                        }`}
                      >
                        {LOCALES[code].label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? t.nav.unmute : t.nav.mute}
              className="press grid size-11 shrink-0 place-items-center rounded-xl border-3 border-espresso bg-paper shadow-brutal"
            >
              {muted ? (
                <VolumeX aria-hidden="true" className="size-5" />
              ) : (
                <Volume2 aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
