import { Check, Languages, Monitor, Moon, Sun } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/i18n/I18nProvider';
import { LOCALES, LOCALE_META, type Locale } from '@/i18n/config';
import { useTheme, type ThemePreference } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const iconButton =
  'inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber';

export function LanguageMenu({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(iconButton, className)} aria-label={t('language.change')}>
        <Languages className="h-4 w-4 text-slate1" aria-hidden />
        <span className="uppercase">{locale}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem]">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">{t('language.label')}</DropdownMenuLabel>
        {LOCALES.map((l) => (
          <DropdownMenuItem key={l} onSelect={() => setLocale(l)} className="justify-between gap-6 py-2" lang={LOCALE_META[l].htmlLang}>
            {LOCALE_META[l].label}
            {l === locale && <Check className="h-4 w-4 text-amber" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const THEME_ICON: Record<ThemePreference, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };
const THEME_ORDER: ThemePreference[] = ['light', 'dark', 'system'];

export function ThemeMenu({ className }: { className?: string }) {
  const { preference, theme, setPreference } = useTheme();
  const { t } = useI18n();
  const Current = theme === 'dark' ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(iconButton, 'w-10 px-0', className)} aria-label={t('theme.toggle')}>
        <Current className="h-[18px] w-[18px]" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">{t('theme.label')}</DropdownMenuLabel>
        {THEME_ORDER.map((p) => {
          const Icon = THEME_ICON[p];
          return (
            <DropdownMenuItem key={p} onSelect={() => setPreference(p)} className="gap-2.5 py-2">
              <Icon className="h-4 w-4 text-slate1" aria-hidden />
              <span className="flex-1">{t(`theme.${p}`)}</span>
              {p === preference && <Check className="h-4 w-4 text-amber" aria-hidden />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Two-row segmented controls for the mobile menu and the pro account page. */
export function PreferenceSegments({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const { preference, setPreference } = useTheme();
  return (
    <div className={cn('space-y-5', className)}>
      <Segmented
        label={t('language.label')}
        value={locale}
        onChange={(v) => setLocale(v as Locale)}
        options={LOCALES.map((l) => ({ value: l, label: l.toUpperCase(), title: LOCALE_META[l].label, lang: LOCALE_META[l].htmlLang }))}
      />
      <Segmented
        label={t('theme.label')}
        value={preference}
        onChange={(v) => setPreference(v as ThemePreference)}
        options={THEME_ORDER.map((p) => ({ value: p, label: t(`theme.${p}`), icon: THEME_ICON[p] }))}
      />
    </div>
  );
}

interface SegmentOption {
  value: string;
  label: string;
  title?: string;
  lang?: string;
  icon?: typeof Sun;
}

function Segmented({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: SegmentOption[] }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-slate1">{label}</legend>
      <div className="grid gap-1 rounded-xl bg-paper-2 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => {
          const active = o.value === value;
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              type="button"
              title={o.title}
              lang={o.lang}
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors',
                active ? 'seg-active' : 'text-slate1 hover:text-ink',
              )}
            >
              {Icon && <Icon className="h-4 w-4" aria-hidden />}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
