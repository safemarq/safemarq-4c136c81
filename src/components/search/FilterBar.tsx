import { useState } from 'react';
import { ArrowDownUp, BadgeCheck, Check, ChevronDown, Loader2, LocateFixed, MapPin, Radius, RotateCcw } from 'lucide-react';
import type { RankingSort } from '@/hooks/useRanking';
import { RADIUS_OPTIONS } from '@/hooks/useRanking';
import { useI18n } from '@/i18n/I18nProvider';
import { CITIES, cityName, type City } from '@/lib/cities';
import type { TradeSlug, VehicleSlug } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';
import { CityField } from './CityField';
import { PickerShell, TradePicker, VehiclePicker, pillTrigger } from './Pickers';

export interface Filters {
  vehicle: VehicleSlug;
  trade: TradeSlug | null;
  city: City | null;
  radius: number;
  sort: RankingSort;
  verifiedOnly: boolean;
}

interface Props extends Filters {
  defaultRadius: number;
  onVehicle: (v: VehicleSlug) => void;
  onTrade: (t: TradeSlug | null) => void;
  onCity: (c: City) => void;
  onLocate: () => void;
  locating: boolean;
  onRadius: (km: number) => void;
  onSort: (s: RankingSort) => void;
  onVerified: (on: boolean) => void;
  onReset?: () => void;
  className?: string;
}

/** Every filter as a chip: what is searched reads at a glance, one tap changes it. */
export function FilterBar(p: Props) {
  const { t } = useI18n();
  return (
    <div className={cn('scrollbar-hide flex items-center gap-2 overflow-x-auto', p.className)}>
      <VehiclePicker value={p.vehicle} onChange={p.onVehicle} variant="pill" />
      <TradePicker vehicle={p.vehicle} value={p.trade} onChange={p.onTrade} variant="pill" allowAll />
      <CityPill city={p.city} onCity={p.onCity} onLocate={p.onLocate} locating={p.locating} />
      <ChoicePill
        title={t('ranking.radiusLabel')}
        icon={Radius}
        active={p.radius !== p.defaultRadius}
        label={t('ranking.radiusValue', { km: p.radius })}
        options={RADIUS_OPTIONS.map((km) => ({ value: km, label: t('ranking.radiusValue', { km }) }))}
        value={p.radius}
        onChange={p.onRadius}
      />
      <ChoicePill
        title={t('ranking.sortLabel')}
        icon={ArrowDownUp}
        active={p.sort !== 'score'}
        label={p.sort === 'score' ? t('ranking.sortScore') : t('ranking.sortDistance')}
        options={[
          { value: 'score' as const, label: t('ranking.sortScore') },
          { value: 'distance' as const, label: t('ranking.sortDistance') },
        ]}
        value={p.sort}
        onChange={p.onSort}
      />
      <button type="button" aria-pressed={p.verifiedOnly} onClick={() => p.onVerified(!p.verifiedOnly)} className={pillTrigger(p.verifiedOnly)}>
        <BadgeCheck className="h-[18px] w-[18px]" aria-hidden />
        {t('searchPage.verifiedOnly')}
      </button>
      {p.onReset && (
        <button
          type="button"
          onClick={p.onReset}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 px-2 text-[15px] font-semibold text-strong underline underline-offset-4"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          {t('searchPage.reset')}
        </button>
      )}
    </div>
  );
}

function ChoicePill<T extends string | number>({
  title,
  icon: Icon,
  label,
  active,
  options,
  value,
  onChange,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PickerShell
      title={title}
      open={open}
      onOpenChange={setOpen}
      width="w-56 p-2"
      trigger={
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${title} : ${label}`} className={pillTrigger(active)}>
          <Icon className="h-[18px] w-[18px]" aria-hidden />
          {label}
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      }
    >
      <ul className="space-y-0.5">
        {options.map((o) => (
          <li key={String(o.value)}>
            <button
              type="button"
              aria-pressed={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[15px] font-semibold text-ink hover:bg-paper-2', o.value === value && 'bg-paper-2')}
            >
              {o.label}
              {o.value === value && <Check className="h-4 w-4 text-strong" aria-hidden />}
            </button>
          </li>
        ))}
      </ul>
    </PickerShell>
  );
}

/** Town picker: type a name or postal code, use the position, or tap a big town. */
export function CityChooser({
  onCity,
  onLocate,
  locating,
  autoFocus,
  error,
}: {
  onCity: (c: City) => void;
  onLocate: () => void;
  locating: boolean;
  autoFocus?: boolean;
  /** Why the position could not be used, shown under the button. */
  error?: string | null;
}) {
  const { t, locale } = useI18n();
  const [text, setText] = useState('');
  return (
    <div>
      <CityField
        value={text}
        onChange={setText}
        onPick={(c) => {
          setText('');
          onCity(c);
        }}
        ref={(el) => {
          if (el && autoFocus) el.focus({ preventScroll: true });
        }}
      />
      <button
        type="button"
        onClick={onLocate}
        disabled={locating}
        className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-[15px] font-semibold text-strong hover:bg-paper-2 disabled:opacity-60"
      >
        {locating ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <LocateFixed className="h-5 w-5" aria-hidden />}
        {locating ? t('search.locating') : t('searchPage.nearMeShort')}
      </button>
      {error && (
        <p role="alert" className="mt-1 px-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
      <p className="mb-2 mt-4 text-[13px] font-semibold text-slate1">{t('searchPage.bigCities')}</p>
      <ul className="flex flex-wrap gap-2">
        {CITIES.slice(0, 10).map((c) => (
          <li key={c.slug}>
            <button
              type="button"
              onClick={() => onCity(c)}
              className="inline-flex min-h-[40px] items-center rounded-full border border-line bg-card px-3.5 text-[14px] font-semibold text-ink hover:border-ink/40"
            >
              {cityName(c, locale)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CityPill({ city, onCity, onLocate, locating }: { city: City | null; onCity: (c: City) => void; onLocate: () => void; locating: boolean }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const label = city ? cityName(city, locale) : t('search.cityLabel');
  return (
    <PickerShell
      title={t('searchPage.whereTitle')}
      open={open}
      onOpenChange={setOpen}
      width="w-[24rem] p-4"
      trigger={
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${t('search.cityLabel')} : ${label}`} className={pillTrigger(false)}>
          <MapPin className="h-[18px] w-[18px]" aria-hidden />
          <span className="max-w-[12rem] truncate">{label}</span>
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      }
    >
      <CityChooser
        autoFocus
        locating={locating}
        onLocate={() => {
          onLocate();
          setOpen(false);
        }}
        onCity={(c) => {
          onCity(c);
          setOpen(false);
        }}
      />
    </PickerShell>
  );
}
