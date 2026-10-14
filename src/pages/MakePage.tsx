import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs, breadcrumbJsonLd, type Crumb } from '@/components/site/Breadcrumbs';
import { CitySentence } from '@/components/search/CitySentence';
import { PickerShell } from '@/components/search/Pickers';
import { CityChooser } from '@/components/search/FilterBar';
import { SlotButton, Swap } from '@/components/search/SlotButton';
import { NationalList, NationalListSkeleton } from '@/components/catalog/NationalList';
import { ProNote } from '@/components/catalog/ProNote';
import { GarageRow } from '@/components/ranking/GarageRow';
import { LoadError, RankingFilters, chipClass } from '@/components/ranking/RankingControls';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { useTopGarages } from '@/hooks/useCatalog';
import { useLocateCity } from '@/hooks/useLocateCity';
import { usePlaces } from '@/hooks/usePlaces';
import { DEFAULT_RADIUS, RADIUS_OPTIONS, useRanking, type RankingSort } from '@/hooks/useRanking';
import { useI18n } from '@/i18n/I18nProvider';
import { vehicleKey } from '@/i18n/keys';
import { CITIES, cityName, getCity, lastCity, nearbyCities, rememberCity, type City } from '@/lib/cities';
import { makePath, rankingPath, vehicleHref } from '@/lib/links';
import { getMake, relatedMakes, type Make } from '@/lib/makes';
import { isVehicle, type VehicleSlug } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

const ORIGIN = 'https://safemarq.com';
/** The EU rules on servicing outside the dealer network cover cars, vans and motorhomes. */
const WARRANTY_VEHICLES: readonly VehicleSlug[] = ['voiture', 'utilitaire', 'camping-car'];

/** /marques/:make and /marques/:make/:city */
export default function MakePage() {
  const { make: slug, city } = useParams<{ make: string; city?: string }>();
  const make = getMake(slug);
  if (!make) return <Navigate to="/404" replace />;
  return city ? <WithCity make={make} citySlug={city} /> : <MakeOverview make={make} />;
}

// ── Whole country ────────────────────────────────────────────────────────────

function MakeOverview({ make }: { make: Make }) {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useTopGarages({ make: make.slug }, 10);
  const total = data?.total ?? 0;
  const empty = !isLoading && !isError && total === 0;
  const remembered = useMemo(() => lastCity(), []);

  const crumbs: Crumb[] = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.makes'), to: '/marques' },
    { label: make.name, to: makePath(make.slug) },
  ];
  const jsonLd = [
    breadcrumbJsonLd(crumbs, ORIGIN),
    ...(data?.items.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: t('makes.pageMetaTitle', { make: make.name }),
            itemListElement: data.items.map((g) => ({ '@type': 'ListItem', position: g.rank, name: g.name, url: `${ORIGIN}/garage/${g.slug}` })),
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title={t('makes.pageMetaTitle', { make: make.name })}
        description={t('makes.pageMetaDescription', { make: make.name })}
        canonical={`${ORIGIN}${makePath(make.slug)}`}
        noindex={empty}
        jsonLd={jsonLd}
      />
      <SiteHeader overlay />

      <main id="contenu">
        <section className="bg-navy-900 text-chalk">
          <div className="container-editorial pb-12 pt-28 md:pb-16 md:pt-36">
            <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c))} onDark />
            <h1 className="mt-5 break-words font-display text-[64px] font-semibold leading-[0.95] tracking-[-0.015em] text-chalk md:text-[112px]">
              {make.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-chalk/75">{t('makes.pageLead', { make: make.name })}</p>
            <CitySentence
              className="mt-10 border-t border-chalk/15 pt-8 md:mt-12"
              start={t('makes.sentenceStart', { make: make.name })}
              startNoCity={t('makes.sentenceStartNoCity', { make: make.name })}
              city={remembered}
              cta={t('makes.sentenceCta')}
              onGo={(c) => navigate(makePath(make.slug, c.slug))}
            />
          </div>
        </section>

        <section className="container-editorial grid gap-12 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
          <div aria-live="polite" aria-busy={isLoading}>
            {empty ? (
              <div className="max-w-2xl">
                <SearchX className="h-8 w-8 text-slate1" aria-hidden />
                <h2 className="mt-4 text-[28px] font-semibold leading-tight text-strong md:text-[32px]">{t('makes.emptyTitle', { make: make.name })}</h2>
                <p className="mt-3 text-[17px] leading-relaxed text-slate1">{t('makes.emptyBody')}</p>
                <Link to={vehicleHref(make.vehicles[0])} className="btn-ghost-navy mt-6 min-h-[48px] px-5">
                  {t('makes.emptyCta')}
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-[30px] font-semibold leading-tight text-strong md:text-4xl">{t('makes.topTitle')}</h2>
                <p className="mt-2 text-[16px] text-slate1">{t('makes.topLead', { make: make.name })}</p>
                <div className="mt-6">
                  {isLoading ? (
                    <NationalListSkeleton />
                  ) : isError ? (
                    <LoadError onRetry={() => refetch()} />
                  ) : (
                    <NationalList items={data?.items ?? []} officialLabel={t('makes.officialOf', { make: make.name })} />
                  )}
                </div>
              </>
            )}
          </div>

          <aside aria-labelledby="by-city">
            <h2 id="by-city" className="font-display text-[24px] font-semibold text-strong">
              {t('makes.byCity')}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-1">
              {CITIES.map((c) => (
                <li key={c.slug} className="border-t border-line">
                  <Link to={makePath(make.slug, c.slug)} className="block py-2.5 text-[16px] text-ink underline-offset-4 hover:text-strong hover:underline">
                    {t('makes.cityLink', { make: make.name, city: cityName(c, locale) })}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        {make.vehicles.some((v) => WARRANTY_VEHICLES.includes(v)) && <DealerOrIndependent />}

        <OtherMakes make={make} />
        <ProNote title={t('makes.proTitle', { make: make.name })} body={t('makes.proBody')} cta={t('makes.proCta')} />
      </main>

      <SiteFooter />
    </div>
  );
}

function DealerOrIndependent() {
  const { t } = useI18n();
  const points = [
    { title: t('makes.guide1Title'), body: t('makes.guide1Body') },
    { title: t('makes.guide2Title'), body: t('makes.guide2Body') },
    { title: t('makes.guide3Title'), body: t('makes.guide3Body') },
  ];
  return (
    <section className="border-y border-line bg-paper-2">
      <div className="container-editorial py-12 md:py-16">
        <h2 className="text-[30px] font-semibold leading-tight text-strong md:text-4xl">{t('makes.guideTitle')}</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {points.map((p) => (
            <div key={p.title} className="border-t-2 border-strong pt-4">
              <h3 className="font-display text-[22px] font-semibold leading-tight text-strong">{p.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-slate1">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OtherMakes({ make }: { make: Make }) {
  const { t, locale } = useI18n();
  const others = relatedMakes(make, locale, 14);
  if (others.length === 0) return null;
  return (
    <section className="container-editorial py-12 md:py-16">
      <h2 className="font-display text-[24px] font-semibold text-strong">{t('makes.otherMakes')}</h2>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {others.map((m) => (
          <li key={m.slug}>
            <Link to={makePath(m.slug)} className="font-display text-[22px] font-semibold text-ink underline-offset-4 hover:text-strong hover:underline">
              {m.name}
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/marques" className="mt-6 inline-flex text-[16px] font-semibold text-strong underline underline-offset-4">
        {t('makes.allMakes')}
      </Link>
    </section>
  );
}

// ── One town ─────────────────────────────────────────────────────────────────

/** Big towns resolve at once; other localities wait for the place list. */
function WithCity({ make, citySlug }: { make: Make; citySlug: string }) {
  const featured = getCity(citySlug);
  const { data: places, isError, refetch } = usePlaces(!featured);
  const city = featured ?? places?.get(citySlug);

  if (city) return <MakeCity make={make} city={city} />;
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

function MakeCity({ make, city }: { make: Make; city: City }) {
  const { t, tp, locale } = useI18n();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const multi = make.vehicles.length > 1;

  const vehicleParam = params.get('vehicule');
  const vehicle: VehicleSlug | null = multi && isVehicle(vehicleParam) && make.vehicles.includes(vehicleParam) ? vehicleParam : null;
  const baseRadius = Math.max(25, DEFAULT_RADIUS[vehicle ?? make.vehicles[0]]);
  const radiusParam = Number(params.get('rayon'));
  const radius = (RADIUS_OPTIONS as readonly number[]).includes(radiusParam) ? radiusParam : baseRadius;
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
    trade: null,
    lat: city.lat,
    lng: city.lng,
    radiusKm: radius,
    sort,
    make: make.slug,
  });
  const items = data?.items ?? [];
  const empty = !isLoading && !isError && items.length === 0;

  useEffect(() => rememberCity(city), [city]);

  const cityLabel = cityName(city, locale);
  const title = t('makes.cityTitle', { make: make.name, city: cityLabel });
  const nextRadius = RADIUS_OPTIONS.find((r) => r > radius);
  const crumbs: Crumb[] = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.makes'), to: '/marques' },
    { label: make.name, to: makePath(make.slug) },
    { label: cityLabel, to: makePath(make.slug, city.slug) },
  ];
  const jsonLd = [
    breadcrumbJsonLd(crumbs, ORIGIN),
    ...(items.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: title,
            itemListElement: items.slice(0, 20).map((g) => ({ '@type': 'ListItem', position: g.rank, name: g.name, url: `${ORIGIN}/garage/${g.slug}` })),
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title={t('makes.cityMetaTitle', { make: make.name, city: cityLabel })}
        description={t('makes.cityMetaDescription', { make: make.name, city: cityLabel })}
        canonical={`${ORIGIN}${makePath(make.slug, city.slug)}`}
        noindex={empty || !!vehicle}
        jsonLd={jsonLd}
      />
      <SiteHeader overlay />

      <main id="contenu">
        <section className="bg-navy-900 text-chalk">
          <div className="container-editorial pb-10 pt-28 md:pb-14 md:pt-36">
            <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c))} onDark />
            <h1 className="mt-5 max-w-[18ch] text-[40px] font-semibold leading-[1.04] text-chalk md:text-[64px]">
              <CityTitle template={t('makes.cityTitle', { make: make.name })} city={city} onCity={(c) => navigate(makePath(make.slug, c.slug))} />
            </h1>
            <p className="mt-4 text-lg text-chalk/80">
              {t('makes.cityLead', { make: make.name })}
              {!isLoading && items.length > 0 && (
                <>
                  {' '}
                  {tp('ranking.count', data?.total ?? items.length)} {t('ranking.within', { km: radius })}.
                </>
              )}
            </p>
          </div>
        </section>

        <section aria-live="polite" aria-busy={isLoading || isPlaceholderData} className="container-editorial py-8 md:py-12">
          {multi && (
            <div role="radiogroup" aria-label={t('search.vehicleLabel')} className="scrollbar-hide -mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <span className="shrink-0 text-[14px] font-semibold text-slate1">{t('search.vehicleLabel')}</span>
              {[null, ...make.vehicles].map((v) => (
                <button
                  key={v ?? 'all'}
                  type="button"
                  role="radio"
                  aria-checked={v === vehicle}
                  onClick={() => setParam('vehicule', v)}
                  className={chipClass(v === vehicle)}
                >
                  {v ? t(vehicleKey(v, 'short')) : t('makes.vehicleAll')}
                </button>
              ))}
            </div>
          )}
          <RankingFilters
            radius={radius}
            sort={sort}
            onRadius={(r) => setParam('rayon', r === baseRadius ? null : String(r))}
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
            ) : empty ? (
              <div className="rounded-2xl border border-line bg-card p-6 md:p-10">
                <SearchX className="h-8 w-8 text-slate1" aria-hidden />
                <h2 className="mt-4 max-w-[30ch] text-[28px] font-semibold text-strong">{t('makes.cityEmptyTitle', { make: make.name, km: radius })}</h2>
                <p className="mt-2 max-w-xl text-[16px] text-slate1">{t('makes.cityEmptyBody')}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {nextRadius && (
                    <button type="button" onClick={() => setParam('rayon', String(nextRadius))} className="btn-amber min-h-[48px] px-5">
                      {t('ranking.widen', { km: nextRadius })}
                    </button>
                  )}
                  <Link to={rankingPath({ vehicle: vehicle ?? make.vehicles[0], trade: null, city: city.slug })} className="btn-ghost-navy min-h-[48px] px-5">
                    {t('makes.cityAll', { city: cityLabel })}
                  </Link>
                </div>
                <p className="mt-6 text-[15px] font-semibold text-ink">{t('ranking.tryNearby')}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {nearbyCities(city, 4).map((n) => (
                    <li key={n.slug}>
                      <Link
                        to={makePath(make.slug, n.slug)}
                        className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-[15px] font-semibold text-ink hover:border-ink/40"
                      >
                        {cityName(n, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ol className="space-y-4">
                {items.map((g) => (
                  <li key={g.id}>
                    <GarageRow
                      garage={g}
                      cityLabel={cityLabel}
                      officialLabel={t('makes.officialOf', { make: make.name })}
                      action={<FavoriteButton garageId={g.id} garageName={g.name} />}
                    />
                  </li>
                ))}
              </ol>
            )}
          </div>

          {!empty && (
            <p className="mt-8 text-[15px] text-slate1">
              <Link to={rankingPath({ vehicle: vehicle ?? make.vehicles[0], trade: null, city: city.slug })} className="font-semibold text-strong underline underline-offset-4">
                {t('makes.cityAll', { city: cityLabel })}
              </Link>
            </p>
          )}
        </section>

        <section className="border-t border-line">
          <div className="container-editorial py-10 md:py-14">
            <h2 className="font-display text-[24px] font-semibold text-strong">{t('makes.otherCities')}</h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
                <li key={c.slug}>
                  <Link to={makePath(make.slug, c.slug)} className="inline-block py-1.5 text-[16px] text-ink underline-offset-4 hover:text-strong hover:underline">
                    {t('makes.cityLink', { make: make.name, city: cityName(c, locale) })}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ProNote title={t('makes.proTitle', { make: make.name })} body={t('makes.proBody')} cta={t('makes.proCta')} />
      </main>

      <SiteFooter />
    </div>
  );
}

/**
 * The page title with the town as its changeable word: "Garages BMW à [Namur]".
 * The template keeps {city} as a placeholder; the rest is plain text.
 */
function CityTitle({ template, city, onCity }: { template: string; city: City; onCity: (c: City) => void }) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const pick = (c: City) => {
    setOpen(false);
    rememberCity(c);
    onCity(c);
  };
  const { locate, locating, error } = useLocateCity(pick);
  const label = cityName(city, locale);
  const [before, after = ''] = template.split('{city}');
  return (
    <>
      {before}
      <PickerShell
        title={t('searchPage.whereTitle')}
        open={open}
        onOpenChange={setOpen}
        width="w-[24rem] p-4"
        trigger={
          <SlotButton label={`${t('search.cityLabel')} : ${label}`} drawn order={0} onClick={() => setOpen(true)}>
            <Swap text={label} />
          </SlotButton>
        }
      >
        <CityChooser autoFocus onCity={pick} onLocate={locate} locating={locating} error={error && t(error)} />
      </PickerShell>
      {after}
    </>
  );
}
