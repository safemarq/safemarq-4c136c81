import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeKey } from '@/i18n/keys';
import type { MessageKey } from '@/i18n/types';
import { tradeHref } from '@/lib/links';
import { PHOTOS, photoSrcSet, photoUrl } from '@/lib/photos';
import { PHOTO_TRADES, tradeIcon } from '@/lib/tradeMeta';
import { TRADES } from '@/lib/trades';

/** "Every car service": four photo tiles for the common jobs, then the rest as a list. */
export function TradesShowcase() {
  const { t } = useI18n();
  const others = TRADES.filter((tr) => !(PHOTO_TRADES as readonly string[]).includes(tr.slug));

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
      <ul className="mt-3 grid border-t border-line sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
        {others.map((tr) => {
          const Icon = tradeIcon(tr.slug);
          return (
            <li key={tr.slug} className="border-b border-line">
              <Link to={tradeHref(tr.slug)} className="group flex items-center gap-4 py-4">
                <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-paper-2 text-strong transition-colors group-hover:bg-strong group-hover:text-paper">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-ink">{t(tradeKey(tr.slug))}</span>
                  <span className="block truncate text-sm text-slate1">{t(`tradeInfo.${tr.slug}` as MessageKey)}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate2 transition-transform group-hover:translate-x-0.5 group-hover:text-strong" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
