import { forwardRef, useId, useMemo, useState } from 'react';
import { BadgeCheck, LocateFixed, MapPin, Search, Store, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useGarageSuggestions, type GarageSuggestion } from '@/hooks/useRanking';
import { usePlaces } from '@/hooks/usePlaces';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeLabelKey, vehicleKey } from '@/i18n/keys';
import { cityName, type City } from '@/lib/cities';
import { parseQuery, suggest, vocabularyFor, type Suggestion } from '@/lib/searchQuery';
import { DEFAULT_VEHICLE, TRADES, type TradeSlug } from '@/lib/taxonomy';
import { tradeIcon, vehicleIcon } from '@/lib/tradeMeta';
import { cn } from '@/lib/utils';

export type OmniboxPick = Suggestion | { kind: 'garage'; garage: GarageSuggestion };

interface Props {
  value: string;
  onChange: (value: string) => void;
  onPick: (pick: OmniboxPick) => void;
  /** Place currently searched, used to complete "vidange" into "Vidange à Namur". */
  currentCity: City | null;
  /** What to offer on an empty focused field. */
  idleSuggestions: Suggestion[];
  className?: string;
}

/**
 * One field for everything: trades, vehicles, towns, postal codes and names.
 * Understands "pneus liège" or "moto 5100" and offers the full search first.
 */
export const Omnibox = forwardRef<HTMLInputElement, Props>(function Omnibox(
  { value, onChange, onPick, currentCity, idleSuggestions, className },
  ref,
) {
  const { t, locale, formatNumber } = useI18n();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { data: places } = usePlaces(open || value.length > 0);

  // The site's own trade names in the visitor's language join the built-in words.
  const vocab = useMemo(() => {
    const labels: Partial<Record<TradeSlug, string[]>> = {};
    for (const tr of TRADES) labels[tr] = [t(tradeLabelKey(tr))];
    return vocabularyFor(locale, labels);
  }, [locale, t]);

  const parsed = useMemo(() => parseQuery(value, places ?? null, vocab), [value, places, vocab]);
  const searches = useMemo(
    () => (value.trim() ? suggest(parsed, { places: places ?? null, currentCity, vocab, limit: 6 }) : idleSuggestions),
    [value, parsed, places, currentCity, vocab, idleSuggestions],
  );

  const debounced = useDebouncedValue(value, 220);
  const { data: garages = [] } = useGarageSuggestions(open ? debounced : '', currentCity);
  const garageOptions = value.trim().length >= 2 ? garages : [];

  const options: OmniboxPick[] = [...searches, ...garageOptions.map((garage) => ({ kind: 'garage' as const, garage }))];
  const showList = open && options.length > 0;

  const pick = (o: OmniboxPick) => {
    setOpen(false);
    setActive(-1);
    onPick(o);
  };

  const describe = (s: Suggestion): { title: string; meta?: string; icon: React.ComponentType<{ className?: string }> } => {
    if (s.kind === 'city') {
      return { title: cityName(s.city, locale), meta: `${s.city.zips[0]} · ${t(`home.regions.${s.city.region}`)}`, icon: MapPin };
    }
    const trade = s.trade ? t(tradeLabelKey(s.trade, s.vehicle)) : null;
    const inline = t(vehicleKey(s.vehicle, 'inline'));
    const what = trade ? (s.vehicle === DEFAULT_VEHICLE ? trade : `${trade} (${inline})`) : t(vehicleKey(s.vehicle, 'pros'));
    const icon = s.trade ? tradeIcon(s.trade) : vehicleIcon(s.vehicle);
    if (s.kind === 'trade') return { title: what, meta: t('searchPage.tradeOnlyHint'), icon };
    if (s.nearMe) return { title: t('searchPage.nearMe', { what }), icon: LocateFixed };
    if (!s.city) return { title: what, icon };
    const city = cityName(s.city, locale);
    const title = !trade
      ? t('ranking.titleAll', { pros: t(vehicleKey(s.vehicle, 'pros')), city })
      : s.vehicle === DEFAULT_VEHICLE
        ? t('ranking.title', { trade, city })
        : t('ranking.titleVehicle', { trade, vehicle: inline, city });
    return { title, meta: `${s.city.zips[0]} · ${t(`home.regions.${s.city.region}`)}`, icon };
  };

  const optionId = (i: number) => `${listId}-o${i}`;

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate1" aria-hidden />
      <input
        ref={ref}
        type="search"
        role="combobox"
        aria-label={t('searchPage.omniboxLabel')}
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        value={value}
        placeholder={t('searchPage.omniboxPlaceholder')}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 140)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && options.length) {
            e.preventDefault();
            setOpen(true);
            setActive((i) => (i + 1) % options.length);
          } else if (e.key === 'ArrowUp' && options.length) {
            e.preventDefault();
            setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            // Enter without choosing = the best guess.
            const o = options[active >= 0 ? active : 0];
            if (o) pick(o);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className="h-14 w-full rounded-xl border border-line bg-card pl-12 pr-12 text-[17px] text-ink shadow-sm placeholder:text-slate1 focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/30 md:h-16 md:text-lg [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            setActive(-1);
          }}
          aria-label={t('searchPage.clear')}
          className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate1 hover:bg-paper-2 hover:text-ink"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      )}

      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label={t('searchPage.omniboxLabel')}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-40 max-h-[min(70vh,32rem)] overflow-y-auto rounded-xl border border-line bg-card py-1.5 shadow-lg"
        >
          {searches.length > 0 && (
            <p className="px-4 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-wide text-slate1" aria-hidden>
              {t('searchPage.groupSearches')}
            </p>
          )}
          {searches.map((s, i) => {
            const d = describe(s);
            return (
              <Option key={i} id={optionId(i)} active={i === active} onHover={() => setActive(i)} onPick={() => pick(s)}>
                <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-2 text-strong">
                  <d.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-ink">{d.title}</span>
                  {d.meta && <span className="block truncate text-[13px] text-slate1">{d.meta}</span>}
                </span>
              </Option>
            );
          })}
          {garageOptions.length > 0 && (
            <p
              className={cn('px-4 pb-1 text-[12px] font-semibold uppercase tracking-wide text-slate1', searches.length ? 'mt-1 border-t border-line pt-3' : 'pt-2')}
              aria-hidden
            >
              {t('searchPage.groupGarages')}
            </p>
          )}
          {garageOptions.map((g, j) => {
            const i = searches.length + j;
            return (
              <Option key={g.id} id={optionId(i)} active={i === active} onHover={() => setActive(i)} onPick={() => pick({ kind: 'garage', garage: g })}>
                <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-paper-2 text-strong">
                  <Store className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
                    <span className="truncate">{g.name}</span>
                    {g.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-teal" aria-hidden />}
                  </span>
                  <span className="block truncate text-[13px] text-slate1">
                    {[g.postalCode && g.locality ? `${g.postalCode} ${g.locality}` : g.locality, g.distanceKm !== null && t('ranking.distance', { km: formatNumber(g.distanceKm, { maximumFractionDigits: 1 }) })]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-strong px-2 py-1 text-[13px] font-bold text-paper num" aria-label={t('searchPage.scoreShort', { score: g.score })}>
                  {g.score}
                </span>
              </Option>
            );
          })}
        </div>
      )}
    </div>
  );
});

function Option({
  id,
  active,
  onHover,
  onPick,
  children,
}: {
  id: string;
  active: boolean;
  onHover: () => void;
  onPick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      onMouseDown={(e) => {
        e.preventDefault(); // keep focus in the field until the pick is done
        onPick();
      }}
      onMouseEnter={onHover}
      className={cn('flex cursor-pointer items-center gap-3 px-3 py-2.5', active && 'bg-paper-2')}
    >
      {children}
    </div>
  );
}
