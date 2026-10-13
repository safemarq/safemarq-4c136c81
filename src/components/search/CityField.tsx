import { forwardRef, useId, useMemo, useState } from 'react';
import { LocateFixed, Loader2, MapPin } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { cityName, searchCities, type City } from '@/lib/cities';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onPick: (city: City) => void;
  onLocate?: () => void;
  locating?: boolean;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
  inputClassName?: string;
}

/** City input with suggestions (combobox pattern) and an optional "near me" button. */
export const CityField = forwardRef<HTMLInputElement, Props>(function CityField(
  { value, onChange, onPick, onLocate, locating, invalid, describedBy, className, inputClassName },
  ref,
) {
  const { t, locale } = useI18n();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const options = useMemo(() => searchCities(value, 6), [value]);
  const showList = open && value.trim().length > 0;

  const pick = (c: City) => {
    onChange(cityName(c.slug, locale));
    onPick(c);
    setOpen(false);
  };

  return (
    <div className={cn('relative min-w-0', className)}>
      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate1" aria-hidden />
      <input
        ref={ref}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && options[active] ? `${listId}-${options[active].slug}` : undefined}
        aria-label={t('search.cityLabel')}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        value={value}
        placeholder={t('search.cityPlaceholder')}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!showList || options.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % options.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i - 1 + options.length) % options.length);
          } else if (e.key === 'Enter' && options[active]) {
            // Let the form submit with the highlighted city.
            onChange(cityName(options[active].slug, locale));
            onPick(options[active]);
            setOpen(false);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={cn(
          'h-14 w-full rounded-xl border border-transparent bg-paper-2 pl-12 text-[16px] text-ink placeholder:text-slate1 focus:border-amber focus:bg-card focus:outline-none focus:ring-2 focus:ring-amber/30',
          onLocate ? 'pr-14' : 'pr-4',
          invalid && 'border-destructive',
          inputClassName,
        )}
      />
      {onLocate && (
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-strong transition-colors hover:bg-paper-2 disabled:opacity-60"
          aria-label={locating ? t('search.locating') : t('search.nearMe')}
          title={t('search.nearMe')}
        >
          {locating ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <LocateFixed className="h-5 w-5" aria-hidden />}
        </button>
      )}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-4 py-3 text-[15px] text-slate1">{t('search.noMatch')}</li>
          ) : (
            options.map((c, i) => (
              <li
                key={c.slug}
                id={`${listId}-${c.slug}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(c);
                }}
                onMouseEnter={() => setActive(i)}
                className={cn('flex cursor-pointer items-center gap-3 px-4 py-3', i === active && 'bg-paper-2')}
              >
                <MapPin className="h-4 w-4 shrink-0 text-slate1" aria-hidden />
                <span className="text-[15px] font-semibold text-ink">{cityName(c.slug, locale)}</span>
                <span className="ml-auto text-[13px] text-slate1">{t(`home.regions.${c.region}`)}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
});
