import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import fr from './locales/fr';
import { LOCALE_META, LOCALE_STORAGE_KEY, detectLocale, type Locale } from './config';
import type { MessageKey, Messages, PluralKey, Vars } from './types';

// French ships in the main bundle; the three others are separate chunks.
const loaders: Record<Exclude<Locale, 'fr'>, () => Promise<{ default: Messages }>> = {
  nl: () => import('./locales/nl'),
  de: () => import('./locales/de'),
  en: () => import('./locales/en'),
};

const cache: Partial<Record<Locale, Messages>> = { fr };

export async function loadMessages(locale: Locale): Promise<Messages> {
  const hit = cache[locale];
  if (hit) return hit;
  const mod = await loaders[locale as Exclude<Locale, 'fr'>]();
  cache[locale] = mod.default;
  return mod.default;
}

/** Call before the first render so a Dutch visitor never sees French flash. */
export async function initI18n(): Promise<Locale> {
  const locale = detectLocale();
  try {
    await loadMessages(locale);
    return locale;
  } catch {
    return 'fr';
  }
}

function lookup(messages: Messages, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object') return (node as Record<string, unknown>)[part];
    return undefined;
  }, messages);
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  tp: (key: PluralKey, count: number, vars?: Vars) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  dateFnsLocale: (typeof LOCALE_META)[Locale]['dateFns'];
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(cache[initialLocale] ?? fr);

  useEffect(() => {
    document.documentElement.lang = LOCALE_META[locale].htmlLang;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* storage blocked */
    }
    // Switch only once the dictionary is in memory, so the page never shows keys.
    loadMessages(next)
      .then((m) => {
        setMessages(m);
        setLocaleState(next);
      })
      .catch(() => {
        /* chunk failed (offline): keep the current language */
      });
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const htmlLang = LOCALE_META[locale].htmlLang;
    const plural = new Intl.PluralRules(htmlLang);
    const t = (key: MessageKey, vars?: Vars) => {
      const v = lookup(messages, key) ?? lookup(fr, key);
      return typeof v === 'string' ? interpolate(v, vars) : key;
    };
    const tp = (key: PluralKey, count: number, vars?: Vars) => {
      const forms = (lookup(messages, key) ?? lookup(fr, key)) as { one: string; other: string } | undefined;
      if (!forms) return key;
      const form = plural.select(count) === 'one' ? forms.one : forms.other;
      return interpolate(form, { count: new Intl.NumberFormat(htmlLang).format(count), ...vars });
    };
    return {
      locale,
      setLocale,
      t,
      tp,
      formatDate: (date, options = { day: 'numeric', month: 'long', year: 'numeric' }) =>
        new Intl.DateTimeFormat(htmlLang, options).format(typeof date === 'string' ? new Date(date) : date),
      formatNumber: (n, options) => new Intl.NumberFormat(htmlLang, options).format(n),
      dateFnsLocale: LOCALE_META[locale].dateFns,
    };
  }, [locale, messages, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
