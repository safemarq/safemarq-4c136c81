import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, List, Loader2, Map as MapIcon, SearchX } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { GarageRow } from '@/components/ranking/GarageRow';
import { CityChooser, FilterBar } from '@/components/search/FilterBar';
import { Omnibox, type OmniboxPick } from '@/components/search/Omnibox';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePlaces } from '@/hooks/usePlaces';
import { DEFAULT_RADIUS, RADIUS_OPTIONS, useRankingPages, type RankingSort } from '@/hooks/useRanking';
import { useI18n } from '@/i18n/I18nProvider';
import { cityName, getCity, lastCity, loadPlaces, rememberCity, type City } from '@/lib/cities';
import type { Suggestion } from '@/lib/searchQuery';
import { DEFAULT_VEHICLE, FEATURED_TRADES, isVehicle, offers, type TradeSlug, type VehicleSlug } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

const SearchMap = lazy(() => import('@/components/search/SearchMap'));

/**
 * /recherche — one field that understands "pneus liège", filters as chips,
 * results as a list next to a map (a list/map switch on phones).
 * Every filter lives in the URL: a search can be shared or bookmarked.
 */
const SearchPage = () => {
  const { t, tp, locale, formatNumber } = useI18n();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // Side-by-side list and map from 1280 px; below, a list/map switch.
  const wide = useMediaQuery('(min-width: 1280px)');

  // ---- Filters from the URL -------------------------------------------------
  const vehicleParam = params.get('vehicule');
  const vehicle: VehicleSlug = isVehicle(vehicleParam) ? vehicleParam : DEFAULT_VEHICLE;
  const tradeParam = params.get('metier');
  const trade: TradeSlug | null = tradeParam && offers(vehicle, tradeParam) ? tradeParam : null;
  const defaultRadius = DEFAULT_RADIUS[vehicle];
  const radiusParam = Number(params.get('rayon'));
  const radius = (RADIUS_OPTIONS as readonly number[]).includes(radiusParam) ? radiusParam : defaultRadius;
  const sort: RankingSort = params.get('tri') === 'distance' ? 'distance' : 'score';
  const verifiedOnly = params.get('verifies') === '1';

  const citySlug = params.get('ville');
  const featured = getCity(citySlug);
  const { data: places, isError: placesError } = usePlaces(!!citySlug && !featured);
  const remembered = useMemo(() => lastCity(), []);
  const city: City | null = citySlug ? featured ?? places?.get(citySlug) ?? null : remembered;
  const cityPending = !!citySlug && !featured && !places && !placesError;

  const update = useCallback(
    (patch: Record<string, string | null>, push = false) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === '') next.delete(k);
            else next.set(k, v);
          }
          return next;
        },
        { replace: !push },
      ),
    [setParams],
  );

  const setVehicle = (v: VehicleSlug) =>
    update({ vehicule: v === DEFAULT_VEHICLE ? null : v, metier: trade && offers(v, trade) ? trade : null, rayon: null }, true);
  const setTrade = (tr: TradeSlug | null) => update({ metier: tr }, true);
  const setCity = (c: City) => {
    rememberCity(c);
    update({ ville: c.slug }, true);
  };

  // ---- "Around me" ----------------------------------------------------------
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<'denied' | 'failed' | null>(null);
  const locate = (then?: (c: City) => void) => {
    if (!('geolocation' in navigator)) return setLocateError('failed');
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const c = (await loadPlaces()).nearest(pos.coords.latitude, pos.coords.longitude);
          (then ?? setCity)(c);
        } catch {
          setLocateError('failed');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocateError(err.code === err.PERMISSION_DENIED ? 'denied' : 'failed');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60_000 },
    );
  };

  // ---- Omnibox --------------------------------------------------------------
  const [text, setText] = useState('');
  const omniboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Arriving from the header's search button: ready to type.
    if (!citySlug && !tradeParam) omniboxRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySearch = (s: Extract<Suggestion, { kind: 'search' }>) => {
    const patch = { vehicule: s.vehicle === DEFAULT_VEHICLE ? null : s.vehicle, metier: s.trade };
    if (s.nearMe) return locate((c) => {
      rememberCity(c);
      update({ ...patch, ville: c.slug }, true);
    });
    if (s.city) rememberCity(s.city);
    update({ ...patch, ville: s.city?.slug ?? citySlug }, true);
  };

  const onPick = (pick: OmniboxPick) => {
    setText('');
    omniboxRef.current?.blur();
    if (pick.kind === 'garage') return navigate(`/garage/${pick.garage.slug}`);
    if (pick.kind === 'city') return setCity(pick.city);
    if (pick.kind === 'trade') return update({ vehicule: pick.vehicle === DEFAULT_VEHICLE ? null : pick.vehicle, metier: pick.trade }, true);
    applySearch(pick);
  };

  const idleSuggestions = useMemo<Suggestion[]>(() => {
    const list: Suggestion[] = [{ kind: 'search', vehicle, trade, city: null, nearMe: true }];
    for (const tr of FEATURED_TRADES[vehicle]) {
      if (tr === trade) continue;
      list.push(city ? { kind: 'search', vehicle, trade: tr, city } : { kind: 'trade', vehicle, trade: tr });
    }
    return list;
  }, [vehicle, trade, city]);

  // ---- Results ----------------------------------------------------------------
  const query = city ? { vehicle, trade, lat: city.lat, lng: city.lng, radiusKm: radius, sort, verifiedOnly } : null;
  const { data, isLoading, isError, refetch, isFetching, isPlaceholderData, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRankingPages(query);
  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const total = data?.pages[0]?.total ?? 0;
  const points = useMemo(
    () => items.map((g) => ({ id: g.id, name: g.name, lat: g.lat, lng: g.lng, score: g.score, precise: g.precise })),
    [items],
  );

  // List ↔ map: hovering a row lights its pin; tapping a pin brings its row.
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const selectFromMap = (id: string) => {
    setSelected(id);
    if (wide) document.getElementById(`r-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  useEffect(() => setSelected(null), [vehicle, trade, city?.slug, radius, sort, verifiedOnly]);
  const selectedListing = items.find((g) => g.id === selected) ?? null;

  const cityLabel = city ? cityName(city, locale) : '';
  const isDefault = vehicle === DEFAULT_VEHICLE && !trade && radius === defaultRadius && sort === 'score' && !verifiedOnly;
  const showMap = !!city && (wide || view === 'map');

  const filterBar = (
    <FilterBar
      vehicle={vehicle}
      trade={trade}
      city={city}
      radius={radius}
      sort={sort}
      verifiedOnly={verifiedOnly}
      defaultRadius={defaultRadius}
      onVehicle={setVehicle}
      onTrade={setTrade}
      onCity={setCity}
      onLocate={() => locate()}
      locating={locating}
      onRadius={(km) => update({ rayon: km === defaultRadius ? null : String(km) })}
      onSort={(s) => update({ tri: s === 'score' ? null : s })}
      onVerified={(on) => update({ verifies: on ? '1' : null })}
      onReset={isDefault ? undefined : () => update({ vehicule: null, metier: null, rayon: null, tri: null, verifies: null }, true)}
    />
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo title={t('searchPage.metaTitle')} description={t('searchPage.metaDescription')} noindex />
      <SiteHeader wide />

      <main id="contenu">
        <section className="border-b border-line bg-paper-2/70">
          <div className="mx-auto max-w-[1440px] px-4 py-4 md:px-6 md:py-6">
            <h1 className="sr-only">{t('searchPage.title')}</h1>
            <Omnibox
              ref={omniboxRef}
              value={text}
              onChange={setText}
              onPick={onPick}
              currentCity={city}
              idleSuggestions={idleSuggestions}
              className="max-w-3xl"
            />
            <div className="-mx-4 mt-3 px-4 md:mx-0 md:px-0">{filterBar}</div>
            {locateError && (
              <p role="alert" className="mt-2 text-sm font-medium text-destructive">
                {t(locateError === 'denied' ? 'search.locateDenied' : 'search.locateFailed')}
              </p>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,42%)] xl:gap-6 xl:px-6">
          <section
            aria-live="polite"
            aria-busy={isFetching}
            className={cn('px-4 pb-28 pt-5 md:px-6 xl:px-0 xl:pb-12', !wide && view === 'map' && 'hidden')}
          >
            {!city ? (
              cityPending ? (
                <div className="h-48 animate-pulse rounded-2xl bg-paper-2" />
              ) : (
                <div className="max-w-xl rounded-2xl border border-line bg-card p-6 md:p-8">
                  <h2 className="text-[28px] font-semibold text-strong">{t('searchPage.whereTitle')}</h2>
                  <p className="mb-5 mt-2 text-[16px] text-slate1">{t('searchPage.whereBody')}</p>
                  <CityChooser onCity={setCity} onLocate={() => locate()} locating={locating} />
                </div>
              )
            ) : (
              <>
                <p className="flex flex-wrap items-center gap-x-2 text-[15px] text-slate1">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-label={t('ranking.loading')} />
                  ) : (
                    <span className="font-semibold text-ink">{tp('searchPage.results', total)}</span>
                  )}
                  <span>{t('searchPage.around', { km: radius, city: cityLabel })}</span>
                  {isFetching && !isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                </p>

                <div className={cn('mt-4 transition-opacity', isPlaceholderData && 'opacity-60')}>
                  {isLoading ? (
                    <ul className="space-y-3">
                      {[0, 1, 2, 3].map((i) => (
                        <li key={i} className="h-32 animate-pulse rounded-2xl bg-paper-2" />
                      ))}
                    </ul>
                  ) : isError ? (
                    <div role="alert" className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-6">
                      <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
                      <p className="flex-1 text-[16px] text-ink">{t('ranking.error')}</p>
                      <button type="button" onClick={() => refetch()} className="btn-ghost-navy min-h-[44px] px-4">
                        {t('common.retry')}
                      </button>
                    </div>
                  ) : items.length === 0 ? (
                    <NoResults
                      radius={radius}
                      verifiedOnly={verifiedOnly}
                      onWiden={(km) => update({ rayon: String(km) })}
                      onAllListings={() => update({ verifies: null })}
                      cityLabel={cityLabel}
                    />
                  ) : (
                    <>
                      <ol className="space-y-3">
                        {items.map((g) => (
                          <li
                            key={g.id}
                            id={`r-${g.id}`}
                            onMouseEnter={() => setHovered(g.id)}
                            onMouseLeave={() => setHovered(null)}
                            onFocus={() => setHovered(g.id)}
                            className={cn('scroll-mt-24 rounded-2xl transition-shadow', selected === g.id && 'ring-2 ring-amber ring-offset-2 ring-offset-paper')}
                          >
                            <GarageRow garage={g} cityLabel={cityLabel} />
                          </li>
                        ))}
                      </ol>
                      {hasNextPage && (
                        <button
                          type="button"
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          className="btn-ghost-navy mx-auto mt-6 flex min-h-[48px] px-6"
                        >
                          {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                          {t('ranking.loadMore')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </section>

          {showMap && city && (
            <aside
              className={cn(
                wide
                  ? 'sticky top-[calc(72px+1rem)] my-5 h-[calc(100dvh-72px-2.5rem)] overflow-hidden rounded-2xl border border-line'
                  : 'fixed inset-x-0 bottom-0 top-16 z-30 flex flex-col bg-paper md:top-[72px]',
              )}
            >
              {/* Phones: the filters stay reachable over the full-screen map. */}
              {!wide && <div className="border-b border-line bg-paper px-4 py-2 md:px-6">{filterBar}</div>}
              <Suspense fallback={<div className="h-full w-full animate-pulse bg-paper-2" />}>
                <SearchMap
                  center={{ lat: city.lat, lng: city.lng }}
                  radiusKm={radius}
                  points={points}
                  activeId={hovered ?? selected}
                  onSelect={selectFromMap}
                  label={t('searchPage.mapLabel')}
                  className="z-0 h-full w-full flex-1"
                />
              </Suspense>
              {!wide && selectedListing && (
                <div className="absolute inset-x-3 bottom-24 z-[500] mx-auto max-w-xl">
                  <GarageRow garage={selectedListing} cityLabel={cityLabel} compact />
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Phones: one thumb-sized switch between the list and the map. */}
        {city && !wide && (
          <button
            type="button"
            onClick={() => setView((v) => (v === 'list' ? 'map' : 'list'))}
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 inline-flex min-h-[48px] -translate-x-1/2 items-center gap-2 rounded-full bg-strong px-5 text-[15px] font-semibold text-paper shadow-lg"
          >
            {view === 'list' ? <MapIcon className="h-5 w-5" aria-hidden /> : <List className="h-5 w-5" aria-hidden />}
            {view === 'list' ? t('searchPage.showMap') : t('searchPage.showList')}
            {view === 'map' && total > 0 && <span className="rounded-full bg-paper/15 px-2 text-[13px] num">{formatNumber(total)}</span>}
          </button>
        )}
      </main>

      {(wide || view === 'list') && <SiteFooter />}
    </div>
  );
};

function NoResults({
  radius,
  verifiedOnly,
  cityLabel,
  onWiden,
  onAllListings,
}: {
  radius: number;
  verifiedOnly: boolean;
  cityLabel: string;
  onWiden: (km: number) => void;
  onAllListings: () => void;
}) {
  const { t } = useI18n();
  const next = RADIUS_OPTIONS.find((r) => r > radius);
  return (
    <div className="rounded-2xl border border-line bg-card p-6 md:p-8">
      <SearchX className="h-8 w-8 text-slate1" aria-hidden />
      <h2 className="mt-4 max-w-[28ch] text-[26px] font-semibold text-strong">{t('ranking.emptyTitle', { km: radius })}</h2>
      <p className="mt-2 max-w-xl text-[16px] text-slate1">{t('searchPage.noResultsBody')}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {next && (
          <button type="button" onClick={() => onWiden(next)} className="btn-amber min-h-[48px] px-5">
            {t('ranking.widen', { km: next })}
          </button>
        )}
        {verifiedOnly && (
          <button type="button" onClick={onAllListings} className="btn-ghost-navy min-h-[48px] px-5">
            {t('searchPage.allListings')}
          </button>
        )}
      </div>
      <Link to="/pro/connexion" className="mt-6 inline-flex font-semibold text-strong underline underline-offset-4">
        {t('ranking.emptyPro', { city: cityLabel })}
      </Link>
    </div>
  );
}

export default SearchPage;
