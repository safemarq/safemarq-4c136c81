import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import type { MessageKey } from '@/i18n/types';
import { cityName, loadPlaces, rememberCity, type City } from '@/lib/cities';
import { rankingPath } from '@/lib/links';
import { DEFAULT_VEHICLE, offers, type TradeSlug, type VehicleSlug } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';
import { CityField } from './CityField';
import { TradePicker, VehiclePicker } from './Pickers';

interface Props {
  initialVehicle?: VehicleSlug;
  initialTrade?: TradeSlug | null;
  initialCity?: City | null;
  className?: string;
}

/** One row of pickers under a ranking's title: change the vehicle, the trade or the town. */
export function SearchPanel({ initialVehicle, initialTrade, initialCity, className }: Props) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const errorId = useId();
  const cityRef = useRef<HTMLInputElement>(null);

  const [vehicle, setVehicle] = useState<VehicleSlug>(initialVehicle ?? DEFAULT_VEHICLE);
  // null = every trade.
  const [trade, setTrade] = useState<TradeSlug | null>(initialTrade ?? null);
  const [cityText, setCityText] = useState(initialCity ? cityName(initialCity, locale) : '');
  const [picked, setPicked] = useState<City | null>(initialCity ?? null);
  const [error, setError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState<'locate' | 'submit' | null>(null);

  useEffect(() => {
    if (initialTrade !== undefined) setTrade(initialTrade);
  }, [initialTrade]);

  // Keep the visible town name in the current language.
  useEffect(() => {
    if (picked) setCityText(cityName(picked, locale));
  }, [locale, picked]);

  const changeVehicle = (next: VehicleSlug) => {
    setVehicle(next);
    // Keep the trade if the new vehicle has it (servicing, tyres…), else every trade.
    setTrade((current) => (current && offers(next, current) ? current : null));
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
