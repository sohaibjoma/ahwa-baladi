// Renders every brand raster from src/app/icon.svg and the dictionaries in headless Chrome,
// which shapes Arabic correctly (next/og's satori reverses Arabic word order):
//   public/og/{ar,en}.png  1200×630 share cards
//   src/app/apple-icon.png 180×180, full-bleed
//   src/app/favicon.ico    16/32/48
// Re-run after changing the icon or the brand copy: npm run brand (CHROME=… to override).
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { LOCALE_CODES, LOCALES } from '../src/i18n/config.ts';
import { ar } from '../src/i18n/dictionary/ar.ts';
import { en } from '../src/i18n/dictionary/en.ts';

const root = join(import.meta.dirname, '..');
const icon = await readFile(join(root, 'src/app/icon.svg'), 'utf8');
const tmp = await mkdtemp(join(tmpdir(), 'brand-'));
const dictionaries = { ar, en };
const fonts =
  'https://fonts.googleapis.com/css2?family=Cairo:wght@700&family=Marhey:wght@700&family=Space+Grotesk:wght@700&display=block';

async function render(name, html, width, height) {
  const page = join(tmp, `${name}.html`);
  const out = join(tmp, `${name}.png`);
  await writeFile(page, `<!doctype html><meta charset="utf-8">${html}`);
  execFileSync(
    process.env.CHROME ?? 'google-chrome',
    [
      '--headless',
      `--user-data-dir=${join(tmp, 'profile')}`,
      '--hide-scrollbars',
      '--default-background-color=00000000',
      '--force-device-scale-factor=1',
      `--window-size=${width},${height}`,
      '--virtual-time-budget=10000',
      `--screenshot=${out}`,
      pathToFileURL(page).href
    ],
    { stdio: 'ignore' }
  );
  return readFile(out);
}

function shareCard(locale) {
  const { nav, hero } = dictionaries[locale];
  const other = LOCALE_CODES.find((code) => code !== locale);
  const [display, title, tagline] =
    locale === 'ar' ? ['Marhey', 128, 76] : ["'Space Grotesk'", 104, 64];
  return `<html lang="${LOCALES[locale].htmlLang}" dir="${LOCALES[locale].dir}"><link rel="stylesheet" href="${fonts}"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;display:flex;align-items:center;justify-content:space-between;gap:48px;padding:0 96px;
  background:#fdf8ee radial-gradient(rgb(30 19 12/.09) 1.5px,transparent 2px) 0 0/18px 18px;
  color:#1e130c;font:700 30px ${locale === 'ar' ? '' : "'Space Grotesk',"}Cairo,sans-serif}
span{display:inline-block;padding:6px 24px;border-radius:99px;background:#1e130c;color:#fdf8ee}
h1{font:700 ${title}px/1.15 ${display};margin-top:12px;white-space:nowrap}
p{font:700 ${tagline}px/1.3 ${display};margin-top:16px;color:#c84b31;white-space:nowrap}
figure{display:flex;flex-direction:column;align-items:center;gap:16px;font-size:34px;color:#6e140e}
svg{width:320px;height:320px;filter:drop-shadow(10px 10px 0 #1e130c)}
</style><body><div><span>${hero.greeting}</span><h1>${nav.brand}</h1><p>${nav.tagline}</p></div>
<figure>${icon}<figcaption lang="${LOCALES[other].htmlLang}">${dictionaries[other].nav.brand}</figcaption></figure></body></html>`;
}

/** ICO container holding PNG frames (supported by every current browser). */
function ico(frames) {
  const header = Buffer.alloc(6 + 16 * frames.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach(({ size, data }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...frames.map((frame) => frame.data)]);
}

await mkdir(join(root, 'public/og'), { recursive: true });
for (const locale of LOCALE_CODES) {
  await writeFile(
    join(root, `public/og/${locale}.png`),
    await render(locale, shareCard(locale), 1200, 630)
  );
}

// Full-bleed for iOS (it rounds the corners itself): hide the icon's own tile.
const appleIcon = `<style>*{margin:0}body{width:180px;height:180px;background:#f59e0b}
svg{display:block;width:180px;height:180px}svg>rect{display:none}</style>${icon}`;
await writeFile(
  join(root, 'src/app/apple-icon.png'),
  await render('apple', appleIcon, 180, 180)
);

const frames = [];
for (const size of [16, 32, 48]) {
  const html = `<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${icon}`;
  frames.push({ size, data: await render(`icon-${size}`, html, size, size) });
}
await writeFile(join(root, 'src/app/favicon.ico'), ico(frames));

await rm(tmp, { recursive: true, force: true });
