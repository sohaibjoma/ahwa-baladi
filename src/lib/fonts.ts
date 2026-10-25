import { Cairo, Marhey, Space_Grotesk } from 'next/font/google';

const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['arabic', 'latin']
});

const marhey = Marhey({
  variable: '--font-marhey',
  subsets: ['arabic']
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin']
});

/** Font CSS variables for <html>; globals.css picks the faces per language. */
export const fontVariables = `${cairo.variable} ${marhey.variable} ${spaceGrotesk.variable}`;
