import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeLabelKey, vehicleKey } from '@/i18n/keys';
import type { MessageKey } from '@/i18n/types';
import { cityName, lastCity, loadPlaces, rememberCity, type City } from '@/lib/cities';
import { rankingPath } from '@/lib/links';
import { DEFAULT_VEHICLE, FEATURED_TRADES, VEHICLES, offers, type TradeSlug, type VehicleSlug } from '@/lib/taxonomy';
import { tradeIcon, vehicleIcon } from '@/lib/tradeMeta';
import { cn } from '@/lib/utils';
import { CityField } from './CityField';
import { TradePicker, VehiclePicker } from './Pickers';

interface Props {
  /** "hero": vehicle tabs + trade tabs. "compact": one row of pickers (ranking pages). */
  variant?: 'hero' | 'compact';
  /** Controlled vehicle (the home page title follows it); internal state otherwise. */
  vehicle?: VehicleSlug;
  onVehicleChange?: (vehicle: VehicleSlug) => void;
  initialVehicle?: VehicleSlug;
  initialTrade?: TradeSlug | null;
  initialCity?: City | null;
  /** Focus the city field on mount (when arriving from a trade link). */
  autoFocusCity?: boolean;
  className?: string;
}

const firstTrade = (vehicle: VehicleSlug) => FEATURED_TRADES[vehicle][0];

export function SearchPanel({
  variant = 'hero',
  vehicle: controlledVehicle,
  onVehicleChange,
  initialVehicle,
  initialTrade,
  initialCity,
  autoFocusCity,
  className,
}: Props) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const errorId = useId();
  const cityRef = useRef<HTMLInputElement>(null);

  const [ownVehicle, setOwnVehicle] = useState<VehicleSlug>(controlledVehicle ?? initialVehicle ?? DEFAULT_VEHICLE);
  const vehicle = controlledVehicle ?? ownVehicle;
  // Compact pickers may say "every trade" (null); the hero always has one selected.
  const [trade, setTrade] = useState<TradeSlug | null>(
    initialTrade !== undefined ? initialTrade : variant === 'compact' ? null : firstTrade(vehicle),
  );
  const startCity = initialCity ?? (variant === 'compact' ? null : lastCity());
  const [cityText, setCityText] = useState(startCity ? cityName(startCity, locale) : '');
  const [picked, setPicked] = useState<City | null>(startCity);
  const [error, setError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState<'locate' | 'submit' | null>(null);

  useEffect(() => {
    if (initialTrade !== undefined) setTrade(initialTrade);
  }, [initialTrade]);

  useEffect(() => {
    if (autoFocusCity) cityRef.current?.focus({ preventScroll: true });
  }, [autoFocusCity, initialTrade]);

  // Keep the visible town name in the current language.
  useEffect(() => {
    if (picked) setCityText(cityName(picked, locale));
  }, [locale, picked]);

  const changeVehicle = (next: VehicleSlug) => {
    if (controlledVehicle === undefined) setOwnVehicle(next);
    onVehicleChange?.(next);
    // Keep the trade if the new vehicle has it (servicing, tyres…), else its first one.
    setTrade((current) => (current && offers(next, current) ? current : variant === 'compact' ? null : firstTrade(next)));
  };

  const go = (city: City) => {
    rememberCity(city);
    navigate(rankingPath({ vehicle, trade, city: city.slug }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = cityText.trim();
    if (!text) {
      setError('search.noCity');
      cityRef.current?.focus();
      return;
    }
    if (picked && cityName(picked, locale) === text) {
      setError(null);
      return go(picked);
    }
    setBusy('submit');
    try {
      const city = (await loadPlaces()).resolve(text);
      if (!city) {
        setError('search.unknownCity');
        cityRef.current?.focus();
        return;
      }
      setError(null);
      go(city);
    } catch {
      setError('common.errorNetwork');
    } finally {
      setBusy(null);
    }
  };

  const locate = () => {
    if (!('geolocation' in navigator)) return setError('search.locateFailed');
    setBusy('locate');
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const city = (await loadPlaces()).nearest(pos.coords.latitude, pos.coords.longitude);
          setPicked(city);
          setCityText(cityName(city, locale));
          go(city);
        } catch {
          setError('common.errorNetwork');
        } finally {
          setBusy(null);
        }
      },
      (err) => {
        setBusy(null);
        setError(err.code === err.PERMISSION_DENIED ? 'search.locateDenied' : 'search.locateFailed');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60_000 },
    );
  };

  const cityField = (
    <CityField
      ref={cityRef}
      value={cityText}
      onChange={(v) => {
        setCityText(v);
        setPicked(null);
        if (error) setError(null);
      }}
      onPick={(c) => {
        setPicked(c);
        setError(null);
      }}
      onLocate={locate}
      locating={busy === 'locate'}
      invalid={!!error}
      describedBy={error ? errorId : undefined}
      className="flex-1"
    />
  );

  const errorLine = error && (
    <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-destructive">
      {t(error)}
    </p>
  );

  const submitButton = (
    <button type="submit" className="btn-amber min-h-[56px] px-7 text-base" disabled={busy === 'submit'}>
      <Search className="h-5 w-5" aria-hidden />
      {t('search.submit')}
    </button>
  );

  if (variant === 'compact') {
    return (
      <form onSubmit={submit} className={cn('rounded-2xl border border-line bg-card p-2 shadow-md', className)} role="search">
        {/* Phones: vehicle | trade on one row, town + round search button on the next. */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-[13rem_15rem_1fr_auto]">
          <VehiclePicker value={vehicle} onChange={changeVehicle} />
          <TradePicker vehicle={vehicle} value={trade} onChange={setTrade} allowAll />
          <div className="col-span-2 flex gap-2 md:contents">
            {cityField}
            <button
              type="submit"
              className="btn-amber min-h-[56px] w-14 shrink-0 px-0 md:w-auto md:px-6"
              disabled={busy === 'submit'}
              aria-label={t('search.submit')}
            >
              <Search className="h-5 w-5" aria-hidden />
              <span className="hidden md:inline">{t('search.submit')}</span>
            </button>
          </div>
        </div>
        {errorLine}
      </form>
    );
  }

  const featured = FEATURED_TRADES[vehicle] as readonly TradeSlug[];
  const extraTrade = trade && !featured.includes(trade) ? trade : null;

  return (
    <div className={className}>
      <VehicleTabs value={vehicle} onChange={changeVehicle} />
      <form onSubmit={submit} className="mt-3 rounded-2xl bg-card p-3 shadow-lg md:p-4" role="search">
        <div
          role="radiogroup"
          aria-label={t('search.tradeLabel')}
          className="scrollbar-hide -mx-3 flex gap-1 overflow-x-auto px-3 [mask-image:linear-gradient(90deg,#000_88%,transparent)] md:mx-0 md:px-0 md:[mask-image:none]"
        >
          {[...featured, ...(extraTrade ? [extraTrade] : [])].map((slug) => {
            const Icon = tradeIcon(slug);
            const active = trade === slug;
            return (
              <button
                key={slug}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTrade(slug)}
                className={cn(
                  'relative inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold transition-colors',
                  active ? 'text-strong' : 'text-slate1 hover:bg-paper-2 hover:text-ink',
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.9} aria-hidden />
                {t(tradeLabelKey(slug, vehicle))}
                {active && <span aria-hidden className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-amber" />}
              </button>
            );
          })}
          <TradePicker vehicle={vehicle} value={trade} onChange={setTrade} variant="tab" />
        </div>

        <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 md:flex-row">
          {cityField}
          {submitButton}
        </div>
        {errorLine}
      </form>
    </div>
  );
}

/** The seven vehicles as tabs over the hero photo (Booking-style). */
function VehicleTabs({ value, onChange }: { value: VehicleSlug; onChange: (v: VehicleSlug) => void }) {
  const { t } = useI18n();
  return (
    <div
      role="radiogroup"
      aria-label={t('search.vehicleLabel')}
      className="scrollbar-hide -mx-4 flex gap-1.5 overflow-x-auto px-4 [mask-image:linear-gradient(90deg,#000_90%,transparent)] sm:mx-0 sm:px-0 sm:[mask-image:none]"
    >
      {VEHICLES.map((v) => {
        const Icon = vehicleIcon(v);
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-colors',
              active
                ? 'border-chalk bg-chalk text-navy-900'
                : 'border-chalk/25 bg-navy-900/35 text-chalk backdrop-blur-sm hover:border-chalk/60 hover:bg-navy-900/60',
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.9} aria-hidden />
            {t(vehicleKey(v, 'short'))}
          </button>
        );
      })}
    </div>
  );
}
