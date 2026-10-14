import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { VehicleTabs } from '@/components/site/VehicleTabs';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeLabelKey } from '@/i18n/keys';
import { tradeHref } from '@/lib/links';
import { VEHICLE_PHOTOS, photoSrcSet, photoUrl } from '@/lib/photos';
import { DEFAULT_VEHICLE, groupedTrades, type TradeGroupId, type VehicleSlug } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

/**
 * Every trade of every vehicle: one vehicle at a time, its photo, and its
 * trades by kind of problem. Each trade leads to the ranking in the visitor's
 * town (or to the search when we don't know it yet).
 */
export function TradeDirectory() {
  const { t } = useI18n();
  const ids = useId();
  const wide = useMediaQuery('(min-width: 768px)');
  const [vehicle, setVehicle] = useState<VehicleSlug>(DEFAULT_VEHICLE);
  // Phones show one group at a time; the first one starts open.
  const [openGroup, setOpenGroup] = useState<TradeGroupId | null>('care');
  const groups = groupedTrades(vehicle);

  const choose = (v: VehicleSlug) => {
    setVehicle(v);
    setOpenGroup(groupedTrades(v)[0]?.id ?? null);
  };

  return (
    <section aria-labelledby="directory-title" className="container-editorial py-16 md:py-24">
      <div className="max-w-2xl">
        <h2 id="directory-title" className="text-[34px] font-bold text-strong md:text-5xl">
          {t('home.directoryTitle')}
        </h2>
        <p className="mt-3 text-lg text-slate1">{t('home.directoryLead')}</p>
      </div>

      <VehicleTabs value={vehicle} onChange={choose} idBase={ids} className="mt-8 md:mt-10" />

      <div
        role="tabpanel"
        id={`${ids}-panel`}
        aria-labelledby={`${ids}-${vehicle}`}
        className="mt-8 grid gap-8 md:mt-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,9fr)] lg:gap-14"
      >
        <VehiclePhoto vehicle={vehicle} />

        <div className="md:columns-2 md:gap-x-8 xl:columns-3">
          {groups.map((g) => {
            const open = wide || openGroup === g.id;
            const listId = `${ids}-${g.id}`;
            const heading = t(`tradeGroups.${g.id}`);
            return (
              <div key={g.id} className="break-inside-avoid border-b border-line md:mb-8 md:border-b-0">
                {wide ? (
                  <h3 className="pb-2 font-display text-[19px] font-semibold leading-tight text-strong">{heading}</h3>
                ) : (
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={listId}
                      onClick={() => setOpenGroup(open ? null : g.id)}
                      className="flex min-h-[56px] w-full items-center gap-3 text-left"
                    >
                      <span className="flex-1 font-display text-[21px] font-semibold text-strong">{heading}</span>
                      <span className="text-[15px] text-slate1 num">{g.trades.length}</span>
                      <ChevronDown className={cn('h-5 w-5 text-slate1 transition-transform', open && 'rotate-180')} aria-hidden />
                    </button>
                  </h3>
                )}
                <ul id={listId} className={cn('pb-3 md:pb-0', !open && 'hidden')}>
                  {g.trades.map((slug) => (
                    <li key={slug} className="md:border-t md:border-line">
                      <Link
                        to={tradeHref(slug, vehicle)}
                        className="block py-2.5 text-[16px] text-ink underline-offset-4 transition-colors hover:text-strong hover:underline md:py-2"
                      >
                        {t(tradeLabelKey(slug, vehicle))}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VehiclePhoto({ vehicle }: { vehicle: VehicleSlug }) {
  const { t } = useI18n();
  const photo = VEHICLE_PHOTOS[vehicle];
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-paper-2 md:sticky md:top-24 md:aspect-[4/5] md:self-start">
      <AnimatePresence initial={false}>
        <motion.picture
          key={vehicle}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <source media="(min-width: 768px)" srcSet={photoSrcSet(photo, [420, 640, 840, 1100], 4 / 5)} sizes="(min-width: 1200px) 420px, 36vw" />
          <img
            src={photoUrl(photo, 780, 488)}
            srcSet={photoSrcSet(photo, [390, 780, 1170], 16 / 10)}
            sizes="100vw"
            alt={t(`home.photoAlt.vehicles.${vehicle}`)}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </motion.picture>
      </AnimatePresence>
    </div>
  );
}
