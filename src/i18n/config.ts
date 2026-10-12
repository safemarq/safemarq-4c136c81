import type { Locale as DateFnsLocale } from 'date-fns';
import { de, enGB, fr, nlBE } from 'date-fns/locale';

export const LOCALES = ['fr', 'nl', 'de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';
export const LOCALE_STORAGE_KEY = 'safemarq-locale';

export const LOCALE_META: Record<Locale, { label: string; htmlLang: string; dateFns: DateFnsLocale }> = {
  fr: { label: 'Français', htmlLang: 'fr-BE', dateFns: fr },
  nl: { label: 'Nederlands', htmlLang: 'nl-BE', dateFns: nlBE },
  de: { label: 'Deutsch', htmlLang: 'de-BE', dateFns: de },
  en: { label: 'English', htmlLang: 'en', dateFns: enGB },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Saved choice first, then the browser language, then French. */
export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* storage blocked */
  }
  const langs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const lang of langs) {
    const base = lang.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
