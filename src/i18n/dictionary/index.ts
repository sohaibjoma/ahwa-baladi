import type { Locale } from '@/i18n/config';
import { ar, type Dictionary } from './ar';
import { en } from './en';

export type { Dictionary };

/** Both dictionaries ship to the client so the language switches without a reload. */
export const dictionaries: Record<Locale, Dictionary> = { ar, en };
