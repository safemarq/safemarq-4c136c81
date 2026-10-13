import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronRight, SearchX } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { SearchPanel } from '@/components/search/SearchPanel';
import { GarageRow } from '@/components/ranking/GarageRow';
import { useGarages } from '@/hooks/useGarages';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeKey } from '@/i18n/keys';
import { CITY_SLUGS, cityName, getCity, nearbyCities, rememberCity } from '@/lib/cities';
import { PHOTOS, photoSrcSet, photoUrl, tradePhoto } from '@/lib/photos';
import { filterAndRank } from '@/lib/ranking';
import { TRADE_SLUGS } from '@/lib/trades';

const TradeCity = () => {
  const { trade: tradeSlug = '', city: citySlug = '' } = useParams<{ trade: string; city: string }>();
  const valid = TRADE_SLUGS.includes(tradeSlug) && CITY_SLUGS.includes(citySlug);
  return valid ? <Ranking tradeSlug={tradeSlug} citySlug={citySlug} /> : <Navigate to="/404" replace />;
};

function Ranking({ tradeSlug, citySlug }: { tradeSlug: string; citySlug: string }) {
  const { t, tp, locale } = useI18n();
  const { data: garages, isLoading } = useGarages();
  const ranked = garages ? filterAndRank(garages, tradeSlug, citySlug) : [];

  useEffect(() => rememberCity(citySlug), [citySlug]);

  const trade = t(tradeKey(tradeSlug));
  const city = cityName(citySlug, locale);
  const photo = tradePhoto(tradeSlug) ?? PHOTOS.hero;
  const region = getCity(citySlug)?.region;

  const jsonLd = ranked.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: t('ranking.title', { trade, city }),
        itemListElement: ranked.slice(0, 20).map((g) => ({
          '@type': 'ListItem',
          position: g.rank,
          name: g.name,
          url: `https://safemarq.com/garage/${g.slug}`,
        })),
      }
    : undefined;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo title={t('ranking.metaTitle', { trade, city })} description={t('ranking.metaDescription', { trade, city })} jsonLd={jsonLd} />
      <SiteHeader overlay />

      <main id="contenu">
        <section className="relative isolate overflow-hidden bg-navy-900 text-chalk">
          <img
            src={photoUrl(photo, 1920, 640)}
            srcSet={photoSrcSet(photo, [640, 1280, 1920, 2560], 3)}
            sizes="100vw"
            alt=""
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,hsl(var(--navy-900)/0.94)_0%,hsl(var(--navy-900)/0.78)_45%,hsl(var(--navy-900)/0.45)_100%)]" />
          <div className="container-editorial pb-24 pt-28 md:pb-28 md:pt-36">
            <nav aria-label={t('ranking.breadcrumbLabel')} className="flex flex-wrap items-center gap-1.5 text-sm text-chalk/75">
              <Link to="/" className="hover:text-chalk hover:underline">
                {t('nav.home')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <span>{trade}</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <span className="font-semibold text-chalk" aria-current="page">
                {city}
              </span>
            </nav>
            <h1 className="mt-4 max-w-[18ch] text-[40px] font-bold leading-[1.02] text-chalk md:text-[64px]">{t('ranking.title', { trade, city })}</h1>
            <p className="mt-3 text-lg text-chalk/80">
              {t('ranking.subtitle')}
              {!isLoading && ranked.length > 0 && <> {tp('ranking.count', ranked.length)}.</>}
            </p>
          </div>
        </section>

        <div className="container-editorial relative z-10 -mt-14 md:-mt-16">
          <SearchPanel key={`${tradeSlug}-${citySlug}`} variant="compact" initialTrade={tradeSlug} initialCity={citySlug} className="max-w-4xl" />
        </div>

        <section aria-live="polite" className="container-editorial py-10 md:py-14">
          {isLoading ? (
            <ul className="space-y-3" aria-label={t('ranking.loading')}>
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-32 animate-pulse rounded-2xl bg-paper-2" />
              ))}
            </ul>
          ) : ranked.length === 0 ? (
            <div className="rounded-2xl border border-line bg-card p-6 md:p-10">
              <SearchX className="h-8 w-8 text-slate1" aria-hidden />
              <h2 className="mt-4 max-w-[26ch] text-[28px] font-semibold text-strong">{t('ranking.emptyTitle', { trade, city })}</h2>
              <p className="mt-2 max-w-xl text-[16px] text-slate1">{t('ranking.emptyBody')}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {nearbyCities(citySlug, 4).map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={`/${tradeSlug}/${c.slug}`}
                      className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-[15px] font-semibold text-ink hover:border-ink/40"
                    >
                      {t('search.popularItem', { trade, city: cityName(c.slug, locale) })}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/pro/connexion" className="mt-6 inline-flex font-semibold text-strong underline underline-offset-4">
                {t('ranking.emptyPro', { city })}
              </Link>
            </div>
          ) : (
            <ol className="space-y-4">
              {ranked.map((g) => (
                <li key={g.id}>
                  <GarageRow garage={g} cityLabel={city} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="border-t border-line bg-paper-2">
          <div className="container-editorial grid gap-12 py-14 md:grid-cols-2 md:py-20">
            <div>
              <h2 className="text-[30px] font-bold text-strong md:text-4xl">{t('ranking.guideTitle', { city })}</h2>
              <ul className="mt-6 space-y-4">
                {(['guide1', 'guide2', 'guide3'] as const).map((k) => (
                  <li key={k} className="flex gap-3 text-[16px] leading-relaxed text-ink">
                    <span aria-hidden className="mt-[9px] h-2 w-2 shrink-0 bg-amber" />
                    {t(`ranking.${k}`)}
                  </li>
                ))}
              </ul>
              {region && (
                <p className="mt-6 text-sm text-slate1">
                  {city}, {t(`home.regions.${region}`)}
                </p>
              )}
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

export default TradeCity;
