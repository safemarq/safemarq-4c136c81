import { useCallback } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs, breadcrumbJsonLd, type Crumb } from '@/components/site/Breadcrumbs';
import { CitySentence } from '@/components/search/CitySentence';
import { NationalList, NationalListSkeleton } from '@/components/catalog/NationalList';
import { GarageRow } from '@/components/ranking/GarageRow';
import { LoadError, RankingFilters } from '@/components/ranking/RankingControls';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { ProNote } from '@/components/catalog/ProNote';
import { useTopGarages } from '@/hooks/useCatalog';
import { usePlaces } from '@/hooks/usePlaces';
import { RADIUS_OPTIONS, useRanking, type RankingSort } from '@/hooks/useRanking';
import { useI18n } from '@/i18n/I18nProvider';
import { cityName, getCity, type City } from '@/lib/cities';
import { brandsOfKind, getToolBrand, type ToolBrand } from '@/lib/equipment';
import { toolPath } from '@/lib/links';
import { cn } from '@/lib/utils';

const ORIGIN = 'https://safemarq.com';
const LOCAL_RADIUS = 25;

/** /outillage/:brand, optionally ?ville=namur (same page, narrowed to a town). */
export default function ToolBrandPage() {
  const { brand: slug } = useParams<{ brand: string }>();
  const brand = getToolBrand(slug);
  const [params] = useSearchParams();
  const ville = params.get('ville');
  const featured = getCity(ville);
  const { data: places } = usePlaces(!!ville && !featured);

  if (!brand) return <Navigate to="/404" replace />;
  const city = featured ?? places?.get(ville) ?? null;
  // A town we cannot resolve (yet, or at all): the national list stays shown.
  return <BrandView brand={brand} city={city} />;
}

function BrandView({ brand, city }: { brand: ToolBrand; city: City | null }) {
  const { t } = useI18n();
  const [, setParams] = useSearchParams();

  const setCity = useCallback(
    (c: City | null) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (c) next.set('ville', c.slug);
          else next.delete('ville');
          next.delete('rayon');
          next.delete('tri');
          return next;
        },
        { replace: false },
      ),
    [setParams],
  );

  const crumbs: Crumb[] = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.equipment'), to: '/outillage' },
    { label: brand.name, to: toolPath(brand.slug) },
  ];
  const kindLabels = brand.kinds.map((k) => t(`equipment.kinds.${k}.label`));

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader overlay />

      <main id="contenu">
        <section className="bg-navy-900 text-chalk">
          <div className="container-editorial pb-12 pt-28 md:pb-16 md:pt-36">
            <Breadcrumbs items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c))} onDark />
            <h1 className="mt-5 break-words font-display text-[64px] font-semibold leading-[0.95] tracking-[-0.015em] text-chalk md:text-[112px]">
              {brand.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-chalk/75">{t('equipment.brandLead', { brand: brand.name })}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {kindLabels.map((label, i) => (
                <li key={brand.kinds[i]}>
                  <a
                    href={`#${brand.kinds[i]}`}
                    className="inline-flex min-h-[36px] items-center rounded-full border border-chalk/30 px-3.5 text-[14px] font-semibold text-chalk/90 hover:bg-chalk/10"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <CitySentence
              key={city?.slug ?? 'none'}
              className="mt-10 border-t border-chalk/15 pt-8 md:mt-12"
              start={t('equipment.sentenceStart', { brand: brand.name })}
              startNoCity={t('equipment.sentenceStartNoCity', { brand: brand.name })}
              // The sentence states the filter in force: no town until one is picked.
              city={city}
              cta={t('makes.sentenceCta')}
              instant
              onGo={(c) => setCity(c)}
            />
          </div>
        </section>

        {city ? <NearCity brand={brand} city={city} onClear={() => setCity(null)} /> : <Nationwide brand={brand} />}

        <section className="border-t border-line">
          <div className="container-editorial py-10 md:py-14">
            <h2 className="text-[28px] font-semibold leading-tight text-strong md:text-[32px]">{t('equipment.sameKind')}</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {brand.kinds.map((k) => (
                <div key={k} id={k} className="grid scroll-mt-24 gap-3 py-6 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-12">
                  <h3 className="font-display text-[24px] font-semibold text-strong">{t(`equipment.kinds.${k}.label`)}</h3>
                  <div>
                    <p className="max-w-[62ch] text-[16px] leading-relaxed text-slate1">{t(`equipment.kinds.${k}.body`)}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                      {brandsOfKind(k)
                        .filter((b) => b.slug !== brand.slug)
                        .map((b) => (
                          <li key={b.slug}>
                            <Link to={toolPath(b.slug, city?.slug)} className="text-[17px] font-semibold text-ink underline-offset-4 hover:text-strong hover:underline">
                              {b.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/outillage" className="mt-6 inline-flex text-[16px] font-semibold text-strong underline underline-offset-4">
              {t('equipment.title')}
            </Link>
          </div>
        </section>

        <ProNote title={t('equipment.proTitle', { brand: brand.name })} body={t('equipment.proBody')} cta={t('equipment.proCta')} />
      </main>

      <SiteFooter />
      {/* Seo last: its noindex depends on the list state, set by the sections above. */}
      <BrandSeo brand={brand} city={city} crumbs={crumbs} />
    </div>
  );
}

function BrandSeo({ brand, city, crumbs }: { brand: ToolBrand; city: City | null; crumbs: Crumb[] }) {
  const { t } = useI18n();
  const { data, isLoading } = useTopGarages({ tool: brand.slug }, 10);
  const empty = !isLoading && (data?.total ?? 0) === 0;
  return (
    <Seo
      title={t('equipment.brandMetaTitle', { brand: brand.name })}
      description={t('equipment.brandMetaDescription', { brand: brand.name })}
      canonical={`${ORIGIN}${toolPath(brand.slug)}`}
      // The town variant is a view of this page, not a page of its own.
      noindex={empty || !!city}
      jsonLd={breadcrumbJsonLd(crumbs, ORIGIN)}
    />
  );
}

function Nationwide({ brand }: { brand: ToolBrand }) {
  const { t } = useI18n();
  const { data, isLoading, isError, refetch } = useTopGarages({ tool: brand.slug }, 10);
  const empty = !isLoading && !isError && (data?.total ?? 0) === 0;

  return (
    <section className="container-editorial py-12 md:py-16" aria-live="polite" aria-busy={isLoading}>
      {empty ? (
        <div className="max-w-2xl">
          <SearchX className="h-8 w-8 text-slate1" aria-hidden />
          <h2 className="mt-4 text-[28px] font-semibold leading-tight text-strong md:text-[32px]">{t('equipment.emptyTitle', { brand: brand.name })}</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-slate1">{t('equipment.emptyBody')}</p>
          <Link to="/recherche" className="btn-ghost-navy mt-6 min-h-[48px] px-5">
            {t('equipment.emptyCta')}
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-[30px] font-semibold leading-tight text-strong md:text-4xl">{t('equipment.topTitle')}</h2>
          <div className="mt-6 max-w-4xl">
            {isLoading ? <NationalListSkeleton /> : isError ? <LoadError onRetry={() => refetch()} /> : <NationalList items={data?.items ?? []} />}
          </div>
        </>
      )}
    </section>
  );
}

function NearCity({ brand, city, onClear }: { brand: ToolBrand; city: City; onClear: () => void }) {
  const { t, tp, locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const radiusParam = Number(params.get('rayon'));
  const radius = (RADIUS_OPTIONS as readonly number[]).includes(radiusParam) ? radiusParam : LOCAL_RADIUS;
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
    vehicle: null,
    trade: null,
    lat: city.lat,
    lng: city.lng,
    radiusKm: radius,
    sort,
    tool: brand.slug,
  });
  const items = data?.items ?? [];
  const cityLabel = cityName(city, locale);
  const nextRadius = RADIUS_OPTIONS.find((r) => r > radius);

  return (
    <section className="container-editorial py-10 md:py-14" aria-live="polite" aria-busy={isLoading || isPlaceholderData}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[30px] font-semibold leading-tight text-strong md:text-4xl">{t('equipment.nearTitle', { city: cityLabel })}</h2>
        <button type="button" onClick={onClear} className="text-[15px] font-semibold text-strong underline underline-offset-4">
          {t('equipment.wholeCountry')}
        </button>
      </div>
      {!isLoading && items.length > 0 && (
        <p className="mt-2 text-[16px] text-slate1">
          {tp('ranking.count', data?.total ?? items.length)} {t('ranking.within', { km: radius })}.
        </p>
      )}
      <div className="mt-6">
        <RankingFilters
          radius={radius}
          sort={sort}
          onRadius={(r) => setParam('rayon', r === LOCAL_RADIUS ? null : String(r))}
          onSort={(s) => setParam('tri', s === 'score' ? null : s)}
        />
      </div>
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
            <h3 className="mt-4 max-w-[30ch] text-[26px] font-semibold text-strong">{t('equipment.nearEmptyTitle', { brand: brand.name, km: radius })}</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {nextRadius && (
                <button type="button" onClick={() => setParam('rayon', String(nextRadius))} className="btn-amber min-h-[48px] px-5">
                  {t('ranking.widen', { km: nextRadius })}
                </button>
              )}
              <button type="button" onClick={onClear} className="btn-ghost-navy min-h-[48px] px-5">
                {t('equipment.wholeCountry')}
              </button>
            </div>
          </div>
        ) : (
          <ol className="space-y-4">
            {items.map((g) => (
              <li key={g.id}>
                <GarageRow garage={g} cityLabel={cityLabel} action={<FavoriteButton garageId={g.id} garageName={g.name} />} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
