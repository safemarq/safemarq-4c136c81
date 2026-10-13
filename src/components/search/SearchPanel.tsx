import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutGrid, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeKey } from '@/i18n/keys';
import type { MessageKey } from '@/i18n/types';
import { cityName, getCity, lastCity, nearestCity, rememberCity, resolveCity, type City } from '@/lib/cities';
import { FEATURED_TRADES, tradeIcon } from '@/lib/tradeMeta';
import { getTrade } from '@/lib/trades';
import { cn } from '@/lib/utils';
import { CityField } from './CityField';
import { TradeList } from './TradeList';

interface Props {
  /** "hero": trade tabs above the field. "compact": one row, trade as a picker. */
  variant?: 'hero' | 'compact';
  initialTrade?: string;
  initialCity?: string;
  /** Focus the city field on mount (when arriving from a trade link). */
  autoFocusCity?: boolean;
  className?: string;
}

export function SearchPanel({ variant = 'hero', initialTrade, initialCity, autoFocusCity, className }: Props) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const errorId = useId();
  const cityRef = useRef<HTMLInputElement>(null);

  const startCity = getCity(initialCity) ?? (variant === 'compact' ? null : lastCity());
  const [trade, setTrade] = useState(getTrade(initialTrade)?.slug ?? 'entretien');
  const [cityText, setCityText] = useState(startCity ? cityName(startCity.slug, locale) : '');
  const [picked, setPicked] = useState<City | null>(startCity);
  const [error, setError] = useState<MessageKey | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (initialTrade && getTrade(initialTrade)) setTrade(initialTrade);
  }, [initialTrade]);

  useEffect(() => {
    if (autoFocusCity) cityRef.current?.focus({ preventScroll: true });
  }, [autoFocusCity, initialTrade]);

  // Keep the visible city name in the current language.
  useEffect(() => {
    if (picked) setCityText(cityName(picked.slug, locale));
  }, [locale, picked]);

  const go = (city: City, tradeSlug = trade) => {
    rememberCity(city.slug);
    navigate(`/${tradeSlug}/${city.slug}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = cityText.trim();
    if (!text) {
      setError('search.noCity');
      cityRef.current?.focus();
      return;
    }
    const city = picked && cityName(picked.slug, locale) === text ? picked : resolveCity(text);
    if (!city) {
      setError('search.unknownCity');
      cityRef.current?.focus();
      return;
    }
    setError(null);
    go(city);
  };

  const locate = () => {
    if (!('geolocation' in navigator)) return setError('search.locateFailed');
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const city = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setPicked(city);
        setCityText(cityName(city.slug, locale));
        go(city);
      },
      (err) => {
        setLocating(false);
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
      locating={locating}
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

  if (variant === 'compact') {
    return (
      <form onSubmit={submit} className={cn('rounded-2xl border border-line bg-card p-2 shadow-md', className)} role="search">
        <div className="flex flex-col gap-2 md:flex-row">
          <TradePicker value={trade} onChange={setTrade} className="md:w-[16rem]" />
          {cityField}
          <button type="submit" className="btn-amber min-h-[56px] px-6">
            <Search className="h-5 w-5" aria-hidden />
            {t('search.submit')}
          </button>
        </div>
        {errorLine}
      </form>
    );
  }

  const featured = FEATURED_TRADES as readonly string[];
  const extraTrade = featured.includes(trade) ? null : trade;

  return (
    <form onSubmit={submit} className={cn('rounded-2xl bg-card p-3 shadow-lg md:p-4', className)} role="search">
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
              {t(tradeKey(slug))}
              {active && <span aria-hidden className="absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-amber" />}
            </button>
          );
        })}
        <TradePicker value={trade} onChange={setTrade} asTab />
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 md:flex-row">
        {cityField}
        <button type="submit" className="btn-amber min-h-[56px] px-7 text-base">
          <Search className="h-5 w-5" aria-hidden />
          {t('search.submit')}
        </button>
      </div>
      {errorLine}
    </form>
  );
}

/** "All services": popover on desktop, bottom sheet on phones. */
function TradePicker({
  value,
  onChange,
  asTab,
  className,
}: {
  value: string;
  onChange: (slug: string) => void;
  asTab?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const Icon = tradeIcon(value);

  const trigger = asTab ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      className={cn(
        'inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-slate1 transition-colors hover:bg-paper-2 hover:text-ink',
        className,
      )}
    >
      <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
      {t('search.allTrades')}
      <ChevronDown className="h-4 w-4" aria-hidden />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      aria-label={`${t('search.tradeLabel')} : ${t(tradeKey(value))}`}
      className={cn(
        'flex h-14 items-center gap-3 rounded-xl bg-paper-2 px-4 text-left text-[16px] font-semibold text-ink transition-colors hover:bg-line/60',
        className,
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-strong" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{t(tradeKey(value))}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-slate1" aria-hidden />
    </button>
  );

  const list = (
    <TradeList
      selected={value}
      onSelect={(slug) => {
        onChange(slug);
        setOpen(false);
      }}
    />
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
          <DrawerContent className="max-h-[88dvh] border-line bg-card">
            <DrawerTitle className="px-5 pb-1 pt-4 text-left font-display text-2xl font-semibold text-strong">{t('search.chooseTrade')}</DrawerTitle>
            <div className="overflow-y-auto px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
              <TradeList selected={value} columns={1} onSelect={(slug) => { onChange(slug); setOpen(false); }} />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" sideOffset={10} className="w-[min(56rem,calc(100vw-3rem))] rounded-2xl border-line bg-card p-5 shadow-lg">
        {list}
      </PopoverContent>
    </Popover>
  );
}
