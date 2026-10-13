import { useEffect } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ChevronRight, Map as MapIcon, SearchX } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { SearchPanel } from '@/components/search/SearchPanel';
import { GarageRow } from '@/components/ranking/GarageRow';
import { usePlaces } from '@/hooks/usePlaces';
import { DEFAULT_RADIUS, RADIUS_OPTIONS, useRanking, type RankingSort } from '@/hooks/useRanking';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeLabelKey, vehicleKey } from '@/i18n/keys';
import { getCity, cityName, nearbyCities, rememberCity, type City } from '@/lib/cities';
import { parseRankingPath, rankingPath, searchPageHref, type RankingTarget } from '@/lib/links';
import { PHOTOS, photoSrcSet, photoUrl, tradePhoto } from '@/lib/photos';
import { DEFAULT_VEHICLE, FEATURED_TRADES } from '@/lib/taxonomy';
import { tradeIcon, vehicleIcon } from '@/lib/tradeMeta';
import { cn } from '@/lib/utils';

/** /:a/:b and /:a/:b/:c — see lib/links.ts for the URL scheme. */
const RankingPage = () => {
  const { a, b, c } = useParams<{ a: string; b: string; c?: string }>();
  const parsed = parseRankingPath(a, b, c);
  if (parsed.kind === 'redirect') return <Navigate to={parsed.to} replace />;
  if (parsed.kind === 'none') return <Navigate to="/404" replace />;
  return <WithCity target={parsed.target} />;
};

/** Big towns resolve at once; other localities wait for the place list. */
function WithCity({ target }: { target: RankingTarget }) {
  const featured = getCity(target.city);
  const { data: places, isError, refetch } = usePlaces(!featured);
  const city = featured ?? places?.get(target.city);

  if (city) return <Ranking target={target} city={city} />;
  if (places) return <Navigate to="/404" replace />;
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main id="contenu" className="container-editorial py-16" aria-busy={!isError}>
        {isError ? <LoadError onRetry={() => refetch()} /> : <div className="h-48 animate-pulse rounded-2xl bg-paper-2" />}
      </main>
    </div>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-6">
      <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
      <p className="flex-1 text-[16px] text-ink">{t('ranking.error')}</p>
      <button type="button" onClick={onRetry} className="btn-ghost-navy min-h-[44px] px-4">
        {t('common.retry')}
      </button>
    </div>
  );
}

function Ranking({ target, city }: { target: RankingTarget; city: City }) {
  const { t, tp, locale } = useI18n();
  const { vehicle, trade } = target;
  const [params, setParams] = useSearchParams();

  // Radius and sort live in the URL so a filtered ranking can be shared.
  const radiusParam = Number(params.get('rayon'));
  const radius = (RADIUS_OPTIONS as readonly number[]).includes(radiusParam) ? radiusParam : DEFAULT_RADIUS[vehicle];
  const sort: RankingSort = params.get('tri') === 'distance' ? 'distance' : 'score';
  const setParam = (key: string, value: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === null) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );

  const { data, isLoading, isError, refetch, isPlaceholderData } = useRanking({
    vehicle,
    trade,
    lat: city.lat,
    lng: city.lng,
    radiusKm: radius,
    sort,
  });
  const items = data?.items ?? [];

  useEffect(() => rememberCity(city), [city]);

  const cityLabel = cityName(city, locale);
  const tradeLabel = trade ? t(tradeLabelKey(trade, vehicle)) : null;
  const vehicleInline = t(vehicleKey(vehicle, 'inline'));
  const title = !tradeLabel
    ? t('ranking.titleAll', { pros: t(vehicleKey(vehicle, 'pros')), city: cityLabel })
    : vehicle === DEFAULT_VEHICLE
      ? t('ranking.title', { trade: tradeLabel, city: cityLabel })
      : t('ranking.titleVehicle', { trade: tradeLabel, vehicle: vehicleInline, city: cityLabel });

  const photo = vehicle === DEFAULT_VEHICLE ? (trade && tradePhoto(trade)) || PHOTOS.hero : null;
  const VehicleIcon = vehicleIcon(vehicle);
  const nextRadius = RADIUS_OPTIONS.find((r) => r > radius);

  const jsonLd = items.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: title,
        itemListElement: items.slice(0, 20).map((g) => ({
          '@type': 'ListItem',
          position: g.rank,
          name: g.name,
          url: `https://safemarq.com/garage/${g.slug}`,
        })),
      }
    : undefined;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo title={t('ranking.metaTitle', { title })} description={t('ranking.metaDescription', { title })} jsonLd={jsonLd} />
      <SiteHeader overlay />

      <main id="contenu">
        <section className="relative isolate overflow-hidden bg-navy-900 text-chalk">
          {photo ? (
            <>
              <img
                src={photoUrl(photo, 1920, 640)}
                srcSet={photoSrcSet(photo, [640, 1280, 1920, 2560], 3)}
                sizes="100vw"
                alt=""
                decoding="async"
                className="absolute inset-0 -z-20 h-full w-full object-cover"
              />
              <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(var(--navy-900)/0.94)_0%,hsl(var(--navy-900)/0.78)_45%,hsl(var(--navy-900)/0.45)_100%)]" />
            </>
          ) : (
            // No stock photo of boats or scooters: the vehicle's own mark, large and quiet.
            <VehicleIcon aria-hidden strokeWidth={1.1} className="absolute -right-10 bottom-0 -z-10 h-[22rem] w-[22rem] text-chalk/[0.06] md:right-[6%] md:h-[30rem] md:w-[30rem]" />
          )}
          <div className="container-editorial pb-24 pt-28 md:pb-28 md:pt-36">
            <nav aria-label={t('ranking.breadcrumbLabel')} className="flex flex-wrap items-center gap-1.5 text-sm text-chalk/75">
              <Link to="/" className="hover:text-chalk hover:underline">
                {t('nav.home')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              {trade ? (
                <Link to={rankingPath({ vehicle, trade: null, city: city.slug })} className="hover:text-chalk hover:underline">
                  {t(vehicleKey(vehicle, 'label'))}
                </Link>
              ) : (
                <span>{t(vehicleKey(vehicle, 'label'))}</span>
              )}
              {tradeLabel && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  <span>{tradeLabel}</span>
                </>
              )}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <span className="font-semibold text-chalk" aria-current="page">
                {cityLabel}
              </span>
            </nav>
            <h1 className="mt-4 max-w-[20ch] text-[40px] font-bold leading-[1.02] text-chalk md:text-[64px]">{title}</h1>
            <p className="mt-3 text-lg text-chalk/80">
              {t('ranking.subtitle')}
              {!isLoading && items.length > 0 && (
                <>
                  {' '}
                  {tp('ranking.count', data?.total ?? items.length)} {t('ranking.within', { km: radius })}.
                </>
              )}
            </p>
          </div>
        </section>

        <div className="container-editorial relative z-10 -mt-14 md:-mt-16">
          <SearchPanel
            key={`${vehicle}-${trade}-${city.slug}`}
            variant="compact"
            initialVehicle={vehicle}
            initialTrade={trade}
            initialCity={city}
            className="max-w-5xl"
          />
        </div>

        <section aria-live="polite" aria-busy={isLoading || isPlaceholderData} className="container-editorial py-8 md:py-12">
          {!trade && (
            <div className="mb-6">
              <h2 className="sr-only">{t('ranking.refine')}</h2>
              <ul className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {FEATURED_TRADES[vehicle].map((slug) => {
                  const Icon = tradeIcon(slug);
                  return (
                    <li key={slug} className="shrink-0">
                      <Link
                        to={rankingPath({ vehicle, trade: slug, city: city.slug })}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-card px-4 text-[15px] font-semibold text-ink hover:border-ink/40"
                      >
                        <Icon className="h-4 w-4 text-strong" aria-hidden />
                        {t(tradeLabelKey(slug, vehicle))}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <Link
            to={searchPageHref({ vehicle, trade, city: city.slug, radiusKm: radius === DEFAULT_RADIUS[vehicle] ? undefined : radius })}
            className="mb-4 inline-flex min-h-[44px] items-center gap-2 font-semibold text-strong underline underline-offset-4"
          >
            <MapIcon className="h-5 w-5" aria-hidden />
            {t('ranking.seeOnMap')}
          </Link>

          <Filters
            radius={radius}
            sort={sort}
            onRadius={(r) => setParam('rayon', r === DEFAULT_RADIUS[vehicle] ? null : String(r))}
            onSort={(s) => setParam('tri', s === 'score' ? null : s)}
          />

          <div className={cn('mt-5 transition-opacity', isPlaceholderData && 'opacity-60')}>
            {isLoading ? (
              <ul className="space-y-3" aria-label={t('ranking.loading')}>
                {[0, 1, 2].map((i) => (
                  <li key={i} className="h-32 animate-pulse rounded-2xl bg-paper-2" />
                ))}
              </ul>
            ) : isError ? (
              <LoadError onRetry={() => refetch()} />
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-line bg-card p-6 md:p-10">
                <SearchX className="h-8 w-8 text-slate1" aria-hidden />
                <h2 className="mt-4 max-w-[28ch] text-[28px] font-semibold text-strong">{t('ranking.emptyTitle', { km: radius })}</h2>
                <p className="mt-2 max-w-xl text-[16px] text-slate1">{t('ranking.emptyBody')}</p>
                {nextRadius && (
                  <button type="button" onClick={() => setParam('rayon', String(nextRadius))} className="btn-amber mt-5 min-h-[48px] px-5">
                    {t('ranking.widen', { km: nextRadius })}
                  </button>
                )}
                <p className="mt-6 text-[15px] font-semibold text-ink">{t('ranking.tryNearby')}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {nearbyCities(city, 4).map((n) => (
                    <li key={n.slug}>
                      <Link
                        to={rankingPath({ vehicle, trade, city: n.slug })}
                        className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-[15px] font-semibold text-ink hover:border-ink/40"
                      >
                        {cityName(n, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to="/pro/connexion" className="mt-6 inline-flex font-semibold text-strong underline underline-offset-4">
                  {t('ranking.emptyPro', { city: cityLabel })}
                </Link>
              </div>
            ) : (
              <ol className="space-y-4">
                {items.map((g) => (
                  <li key={g.id}>
                    <GarageRow garage={g} cityLabel={cityLabel} />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        <section className="border-t border-line bg-paper-2">
          <div className="container-editorial grid gap-12 py-14 md:grid-cols-2 md:py-20">
            <div>
              <h2 className="text-[30px] font-bold text-strong md:text-4xl">{t('ranking.guideTitle', { city: cityLabel })}</h2>
              <ul className="mt-6 space-y-4">
                {(['guide1', 'guide2', 'guide3'] as const).map((k) => (
                  <li key={k} className="flex gap-3 text-[16px] leading-relaxed text-ink">
                    <span aria-hidden className="mt-[9px] h-2 w-2 shrink-0 bg-amber" />
                    {t(`ranking.${k}`)}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-slate1">
                {cityLabel} ({city.zips[0]}), {t(`home.regions.${city.region}`)}
              </p>
            </div>
            <div>
              <h2 className="text-[30px] font-bold text-strong md:text-4xl">{t('ranking.faqTitle')}</h2>
              <div className="mt-6 divide-y divide-line border-y border-line">
                {(['1', '2', '3'] as const).map((n) => (
                  <details key={n} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold text-ink">
                      {t(`ranking.faq${n}q`)}
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate1 transition-transform group-open:rotate-90" aria-hidden />
                    </summary>
                    <p className="mt-3 text-[16px] leading-relaxed text-slate1">{t(`ranking.faq${n}a`)}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Filters({
  radius,
  sort,
  onRadius,
  onSort,
}: {
  radius: number;
  sort: RankingSort;
  onRadius: (km: number) => void;
  onSort: (sort: RankingSort) => void;
}) {
  const { t } = useI18n();
  const chip = (active: boolean) =>
    cn(
      'min-h-[40px] shrink-0 rounded-full border px-3.5 text-[14px] font-semibold transition-colors',
      active ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-slate1 hover:text-ink',
    );
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div role="radiogroup" aria-label={t('ranking.radiusLabel')} className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <span className="shrink-0 text-[14px] font-semibold text-slate1">{t('ranking.radiusLabel')}</span>
        {RADIUS_OPTIONS.map((km) => (
          <button key={km} type="button" role="radio" aria-checked={km === radius} onClick={() => onRadius(km)} className={chip(km === radius)}>
            {t('ranking.radiusValue', { km })}
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label={t('ranking.sortLabel')} className="flex items-center gap-2">
        <span className="shrink-0 text-[14px] font-semibold text-slate1">{t('ranking.sortLabel')}</span>
        {(['score', 'distance'] as const).map((s) => (
          <button key={s} type="button" role="radio" aria-checked={s === sort} onClick={() => onSort(s)} className={chip(s === sort)}>
            {s === 'score' ? t('ranking.sortScore') : t('ranking.sortDistance')}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RankingPage;
