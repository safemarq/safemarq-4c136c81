import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeKey, tradeLabelKey, vehicleKey } from '@/i18n/keys';
import type { MessageKey } from '@/i18n/types';
import { tradeHref, vehicleHref } from '@/lib/links';
import { PHOTOS, photoSrcSet, photoUrl } from '@/lib/photos';
import { FEATURED_TRADES, VEHICLES, VEHICLE_TRADES, groupedTrades } from '@/lib/taxonomy';
import { PHOTO_TRADES, tradeIcon, vehicleIcon } from '@/lib/tradeMeta';

/** "Every car service": four photo tiles for the common jobs, then every other trade by group. */
export function TradesShowcase() {
  const { t } = useI18n();
  const photo = new Set<string>(PHOTO_TRADES);
  const groups = groupedTrades('voiture')
    .map((g) => ({ ...g, trades: g.trades.filter((s) => !photo.has(s)) }))
    .filter((g) => g.trades.length > 0);

  return (
    <section aria-labelledby="trades-title" className="container-editorial py-16 md:py-24">
      <div className="max-w-2xl">
        <h2 id="trades-title" className="text-[34px] font-bold text-strong md:text-5xl">
          {t('home.tradesTitle')}
        </h2>
        <p className="mt-3 text-lg text-slate1">{t('home.tradesLead')}</p>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-4 md:gap-4">
        {PHOTO_TRADES.map((slug) => {
          const photo = PHOTOS[slug];
          const Icon = tradeIcon(slug);
          return (
            <li key={slug}>
              <Link
                to={tradeHref(slug)}
                className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-navy-900 p-4 text-chalk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 md:p-5"
              >
                <img
                  src={photoUrl(photo, 600, 750)}
                  srcSet={photoSrcSet(photo, [320, 480, 640, 960], 4 / 5)}
                  sizes="(min-width: 1200px) 290px, (min-width: 768px) 24vw, 46vw"
                  alt={t(`home.photoAlt.${slug}` as MessageKey)}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-900/95 via-navy-900/35 to-transparent" />
                <span aria-hidden className="mb-auto grid h-10 w-10 place-items-center rounded-lg bg-chalk/95 text-navy-900">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="font-display text-[22px] font-semibold leading-tight md:text-[26px]">{t(tradeKey(slug))}</span>
                <span className="mt-1 hidden text-sm text-chalk/80 sm:block">{t(`tradeInfo.${slug}` as MessageKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-12 font-sans text-sm font-semibold text-slate1 md:mt-14">{t('home.tradesMore')}</h3>
      <div className="mt-4 gap-x-8 sm:columns-2 lg:columns-3">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`home-group-${g.id}`} className="break-inside-avoid pb-8">
            <h4 id={`home-group-${g.id}`} className="border-b-2 border-strong pb-2 font-sans text-[15px] font-semibold text-strong">
              {t(`tradeGroups.${g.id}`)}
            </h4>
            <ul>
              {g.trades.map((slug) => {
                const Icon = tradeIcon(slug);
                return (
                  <li key={slug} className="border-b border-line">
                    <Link to={tradeHref(slug)} className="group flex items-center gap-3 py-3">
                      <Icon className="h-[18px] w-[18px] shrink-0 text-slate1 transition-colors group-hover:text-strong" strokeWidth={1.9} aria-hidden />
                      <span className="min-w-0 flex-1 text-[16px] font-medium text-ink group-hover:text-strong group-hover:underline">{t(tradeKey(slug))}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate2 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

/** The six other vehicles: same ranking, their own specialists. */
export function VehiclesShowcase() {
  const { t, tp } = useI18n();
  const others = VEHICLES.filter((v) => v !== 'voiture');
  return (
    <section aria-labelledby="vehicles-title" className="border-t border-line bg-paper-2">
      <div className="container-editorial py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 id="vehicles-title" className="text-[34px] font-bold text-strong md:text-5xl">
            {t('home.vehiclesTitle')}
          </h2>
          <p className="mt-3 text-lg text-slate1">{t('home.vehiclesLead')}</p>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-10 lg:grid-cols-3">
          {others.map((v) => {
            const Icon = vehicleIcon(v);
            return (
              <li key={v}>
                <Link
                  to={vehicleHref(v)}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-line bg-card p-5 transition-colors hover:border-ink/30"
                >
                  <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-strong text-paper">
                    <Icon className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-[22px] font-semibold leading-tight text-strong">{t(vehicleKey(v, 'label'))}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate2 transition-transform group-hover:translate-x-0.5 group-hover:text-strong" aria-hidden />
                    </span>
                    <span className="mt-1 block text-[15px] text-slate1">
                      {FEATURED_TRADES[v].slice(0, 3).map((tr) => t(tradeLabelKey(tr, v))).join(' · ')}
                    </span>
                    <span className="mt-2 block text-[13px] font-semibold text-slate1">{tp('home.vehiclesCount', VEHICLE_TRADES[v].length)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
