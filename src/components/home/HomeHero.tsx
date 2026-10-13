import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchPanel } from '@/components/search/SearchPanel';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeKey } from '@/i18n/keys';
import { cityName, rememberCity } from '@/lib/cities';
import { PHOTOS, photoSrcSet, photoUrl } from '@/lib/photos';
import { getTrade } from '@/lib/trades';

const POPULAR: { trade: string; city: string }[] = [
  { trade: 'carrosserie', city: 'namur' },
  { trade: 'pneus', city: 'liege' },
  { trade: 'entretien', city: 'bruxelles' },
  { trade: 'controle-technique', city: 'charleroi' },
  { trade: 'pare-brise', city: 'gand' },
];

// React 18 does not know the camelCase prop yet; pass the HTML attribute as is.
const HIGH_PRIORITY = { fetchpriority: 'high' } as Record<string, string>;

export function HomeHero({ garageCount }: { garageCount?: number }) {
  const { t, locale, formatNumber } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedTrade = getTrade(params.get('metier') ?? undefined)?.slug;
  const photo = PHOTOS.hero;

  return (
    <section className="relative isolate overflow-hidden bg-navy-900">
      <picture>
        <source media="(max-width: 767px)" srcSet={photoSrcSet(photo, [390, 780, 1170], 390 / 760)} sizes="100vw" />
        <img
          src={photoUrl(photo, 1920)}
          srcSet={[960, 1440, 1920, 2560].map((w) => `${photoUrl(photo, w)} ${w}w`).join(', ')}
          sizes="100vw"
          alt={t('home.photoAlt.hero')}
          decoding="async"
          {...HIGH_PRIORITY}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_55%]"
        />
      </picture>
      {/* Phones: dark at the bottom where the search sits. Desktop: dark on the left for the headline. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(var(--navy-900)/0.55)_0%,hsl(var(--navy-900)/0.25)_30%,hsl(var(--navy-900)/0.92)_68%,hsl(var(--navy-900))_100%)] md:hidden" />
      <div aria-hidden className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,hsl(var(--navy-900)/0.94)_0%,hsl(var(--navy-900)/0.8)_34%,hsl(var(--navy-900)/0.28)_68%,hsl(var(--navy-900)/0.12)_100%),linear-gradient(0deg,hsl(var(--navy-900)/0.75)_0%,transparent_45%)] md:block" />

      <div className="container-editorial flex min-h-[100svh] flex-col justify-end pb-8 pt-28 md:min-h-[min(94svh,900px)] md:pb-14 md:pt-36">
        <h1 className="max-w-[14ch] text-[44px] font-bold leading-[0.98] text-chalk sm:text-[56px] md:text-[76px] lg:text-[84px]">
          {t('home.heroTitle')}
        </h1>
        <p className="mt-4 max-w-[34rem] text-[17px] leading-relaxed text-chalk/85 md:mt-5 md:text-xl">{t('home.heroLead')}</p>
        {garageCount !== undefined && garageCount >= 50 && (
          <p className="mt-2 text-[15px] font-semibold text-amber">{t('home.heroCount', { count: formatNumber(garageCount) })}</p>
        )}

        <div id="recherche" className="mt-7 max-w-4xl scroll-mt-24 md:mt-10">
          <SearchPanel initialTrade={requestedTrade} autoFocusCity={!!requestedTrade} />
        </div>

        <div className="mt-5 max-w-4xl">
          <p className="sr-only">{t('search.popular')}</p>
          <ul className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {POPULAR.map((p) => (
              <li key={`${p.trade}-${p.city}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    rememberCity(p.city);
                    navigate(`/${p.trade}/${p.city}`);
                  }}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-chalk/25 bg-navy-900/35 px-4 text-sm font-medium text-chalk backdrop-blur-sm transition-colors hover:border-chalk/60 hover:bg-navy-900/60"
                >
                  {t('search.popularItem', { trade: t(tradeKey(p.trade)), city: cityName(p.city, locale) })}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
