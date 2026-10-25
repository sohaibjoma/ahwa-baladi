# قهوة بلدي: فتلة ولا كشري؟ · Ahwa Baladi: Fatla Wala Koshary?

An Egyptian street-cafe tea studio, mood oracle and decision maker. Build your glass on a brass tray, let the Ma'allem pick for you, steep it with a coach, and settle the bill with a retro receipt. Bilingual: Egyptian Arabic (default, RTL) and English (LTR).

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · framer-motion (LazyMotion) · lucide-react · Biome.

## Scripts

| Command             | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `npm run dev`       | Dev server on <http://localhost:3000>                            |
| `npm run build`     | Production build (every page is prerendered)                     |
| `npm start`         | Serve the production build                                       |
| `npm run lint`      | Biome lint + format check                                        |
| `npm run format`    | Biome: format, organize imports, apply safe fixes                |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`                        |
| `npm run brand`     | Re-render the share cards, apple icon and favicon (needs Chrome) |

## Structure

```text
src/
  app/
    [locale]/layout.tsx    root layout: fonts, <html lang dir>, metadata, JSON-LD, providers
    [locale]/page.tsx      the page (Server Component composing the sections)
    global-not-found.tsx   bilingual 404 for unknown URLs and locales
    sitemap.ts robots.ts manifest.ts icon.svg apple-icon.png favicon.ico globals.css
  components/              one file per section; TeaStudio is the client island that owns the tea order
  data/tea.ts              domain: options, default order, quiz answers and their effects, tea colours
  i18n/
    config.ts              locale registry (lang tag, direction, URL path, OG locale, switcher label)
    dictionary/ar.ts       Arabic copy; the source of the Dictionary type
    dictionary/en.ts       English copy, type-checked against Arabic
    LanguageProvider.tsx   active locale, dictionary and number helpers; instant switching
    format.ts              ahwa shorthand for an order
  lib/seo.ts               metadata, hreflang alternates, JSON-LD
  lib/fonts.ts             Cairo, Marhey, Space Grotesk via next/font
  utils/sound.ts           Web Audio synth: clink, pour, plop, slurp, bell (no audio files)
scripts/brand-images.mjs   renders public/og/*.png, apple-icon.png and favicon.ico from icon.svg
```

## Languages

- Arabic lives at `/`, English at `/en`. Both are prerendered, so search engines index each language with its own title, description, canonical and hreflang links.
- Switching language is instant: the provider swaps the dictionary in state (every component keeps its state), updates `<html lang dir>` and the title, and rewrites the URL with `history.replaceState`. The switcher items are real `<a hreflang>` links, so crawlers follow them.
- Add copy to `dictionary/ar.ts` first; TypeScript then flags anything missing in `en.ts`. Arabic copy is Egyptian street Arabic, not Modern Standard Arabic.
- Adding a locale: add it to `LOCALES` in `config.ts` and add its dictionary.

## SEO

- Per-locale metadata, `x-default`, Open Graph and Twitter cards, JSON-LD (`WebSite` + `WebApplication`), sitemap with hreflang alternates, robots, manifest and icons.
- Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) so absolute URLs use the production domain; on Vercel the production domain is used automatically.
- Share cards are static PNGs rendered by headless Chrome, because `next/og` cannot lay out Arabic text correctly. Run `npm run brand` after changing the brand copy or `icon.svg`.

## Decisions

- **`/ar` redirects to `/` (308, cached by browsers).** The default locale is served from the root through a rewrite in `next.config.ts`. The redirect source is exact on purpose: a wildcard would also catch `/ar/...` asset routes.
- **Unknown locales 404 statically** via `unstable_paramMatching` in the root layout, the Cache Components replacement for `dynamicParams = false`. It is still `unstable_` in Next 16.4, so re-check it when upgrading, together with `experimental.globalNotFound`.
- **`ensureStatic = 'navigation'`** on the root layout makes the build fail if anything request-time slips into a page.
