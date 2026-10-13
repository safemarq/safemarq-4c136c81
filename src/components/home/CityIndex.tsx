import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BELGIUM, projectBelgium } from '@/data/belgium';
import { useI18n } from '@/i18n/I18nProvider';
import { CITIES, cityName, rememberCity, type City } from '@/lib/cities';
import { rankingPath } from '@/lib/links';
import { cn } from '@/lib/utils';

// Room around the outline so dots and labels near the border are not cut.
const PAD = 24;
const VIEW = { x: -PAD, y: -PAD, w: BELGIUM.width + PAD * 2, h: BELGIUM.height + PAD * 2 };

/** Where each name sits next to its dot, so close towns don't overlap. */
const LABEL_SIDE: Record<string, 'left' | 'right' | 'above' | 'below'> = {
  ostende: 'above',
  bruges: 'right',
  gand: 'right',
  courtrai: 'right',
  tournai: 'right',
  anvers: 'right',
  malines: 'right',
  bruxelles: 'left',
  louvain: 'right',
  wavre: 'below',
  mons: 'above',
  'la-louviere': 'right',
  charleroi: 'below',
  namur: 'right',
  hasselt: 'above',
  genk: 'below',
  liege: 'left',
  verviers: 'below',
};
// Names always written on the map; the others need room (phones and laptops show them on hover only).
const ALWAYS = new Set(['bruxelles', 'anvers', 'gand', 'liege', 'charleroi', 'namur', 'bruges', 'mons']);

/** The big towns on a map of Belgium, and the same towns as a list (the way in for keyboards and screen readers). */
export function CityIndex({ garageCount }: { garageCount?: number }) {
  const { t, locale, formatNumber } = useI18n();
  const [active, setActive] = useState<string | null>(null);
  const collator = new Intl.Collator(locale);
  const href = (c: City) => rankingPath({ vehicle: 'voiture', trade: null, city: c.slug });

  return (
    <section aria-labelledby="cities-title" className="container-editorial py-16 md:py-24">
      {/* Phones: title, map, list. Wide: the map on the left, title and list on the right. */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-8">
        <div className="lg:col-start-2 lg:self-end">
          <h2 id="cities-title" className="text-[34px] font-bold text-strong md:text-5xl">
            {t('home.citiesTitle')}
          </h2>
          <p className="mt-3 max-w-md text-lg text-slate1">{t('home.citiesLead')}</p>
          {garageCount !== undefined && garageCount >= 50 && (
            <p className="mt-2 text-[15px] font-semibold text-strong">{t('home.heroCount', { count: formatNumber(garageCount) })}</p>
          )}
        </div>
        <div
          className="relative lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center"
          style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}
          onMouseLeave={() => setActive(null)}
        >
          <svg aria-hidden viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 h-full w-full overflow-visible">
            <path d={BELGIUM.outline} className="fill-paper-2 stroke-strong" strokeWidth={1.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d={BELGIUM.languageBorder} className="fill-none stroke-slate2" strokeWidth={1} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
            <path d={BELGIUM.brussels} className="fill-line stroke-slate2" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </svg>
          {CITIES.map((c) => {
            const { x, y } = projectBelgium(c.lat, c.lng);
            const on = active === c.slug;
            const side = LABEL_SIDE[c.slug] ?? 'right';
            return (
              <Link
                key={c.slug}
                to={href(c)}
                onClick={() => rememberCity(c)}
                onMouseEnter={() => setActive(c.slug)}
                // The list beside the map is the accessible way in; the dots are a shortcut for the mouse.
                tabIndex={-1}
                aria-hidden
                className={cn('group absolute hidden -translate-x-1/2 -translate-y-1/2 p-2 md:block', on ? 'z-10' : 'z-[1]')}
                style={{ left: `${((x - VIEW.x) / VIEW.w) * 100}%`, top: `${((y - VIEW.y) / VIEW.h) * 100}%` }}
              >
                <Dot on={on} />
                {/* In the narrow column of a laptop screen only the big names fit; the rest show when pointed at. */}
                <Label side={side} on={on} className={on || ALWAYS.has(c.slug) ? undefined : 'lg:hidden xl:block'}>
                  {cityName(c, locale)}
                </Label>
              </Link>
            );
          })}
          {/* Phones: the same dots, not clickable (too small to tap); the list below does the work. */}
          {CITIES.map((c) => {
            const { x, y } = projectBelgium(c.lat, c.lng);
            return (
              <span
                key={c.slug}
                aria-hidden
                className="absolute -translate-x-1/2 -translate-y-1/2 md:hidden"
                style={{ left: `${((x - VIEW.x) / VIEW.w) * 100}%`, top: `${((y - VIEW.y) / VIEW.h) * 100}%` }}
              >
                <Dot on={false} />
                {ALWAYS.has(c.slug) && (
                  <Label side={LABEL_SIDE[c.slug] ?? 'right'} on={false}>
                    {cityName(c, locale)}
                  </Label>
                )}
              </span>
            );
          })}
        </div>

        <div className="lg:col-start-2 lg:self-start">
          <ul className="grid grid-cols-2 gap-x-6 border-t border-line sm:grid-cols-3">
            {[...CITIES]
              .sort((a, b) => collator.compare(cityName(a, locale), cityName(b, locale)))
              .map((c) => {
                const name = cityName(c, locale);
                return (
                  <li key={c.slug} className="border-b border-line">
                    <Link
                      to={href(c)}
                      onClick={() => rememberCity(c)}
                      onMouseEnter={() => setActive(c.slug)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(c.slug)}
                      onBlur={() => setActive(null)}
                      title={t('home.cityLink', { city: name })}
                      className={cn(
                        'block py-3 text-[16px] underline-offset-4 transition-colors hover:text-strong hover:underline',
                        active === c.slug ? 'text-strong underline' : 'text-ink',
                      )}
                    >
                      {name}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Dot({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        'block rounded-full ring-2 ring-paper transition-all duration-200',
        on ? 'h-3.5 w-3.5 bg-amber' : 'h-2 w-2 bg-strong group-hover:h-3 group-hover:w-3 md:h-2.5 md:w-2.5',
      )}
    />
  );
}

function Label({
  side,
  on,
  className,
  children,
}: {
  side: 'left' | 'right' | 'above' | 'below';
  on: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute whitespace-nowrap text-[12px] leading-none md:text-[13px]',
        className,
        side === 'right' && 'left-full top-1/2 ml-1 -translate-y-1/2',
        side === 'left' && 'right-full top-1/2 mr-1 -translate-y-1/2',
        side === 'above' && 'bottom-full left-1/2 mb-0.5 -translate-x-1/2',
        side === 'below' && 'left-1/2 top-full mt-0.5 -translate-x-1/2',
        on ? 'font-semibold text-strong' : 'text-slate1',
      )}
    >
      {children}
    </span>
  );
}
