import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GarageRow } from '@/components/ranking/GarageRow';
import { useGarages } from '@/hooks/useGarages';
import { useI18n } from '@/i18n/I18nProvider';
import { CITIES, cityFromAddress, cityName, lastCity } from '@/lib/cities';
import { rankGarages, type RankedGarage } from '@/lib/ranking';
import { cn } from '@/lib/utils';

const MIN_GARAGES = 3;

/**
 * Real rankings per town. Renders nothing until the database holds enough
 * garages: an empty "top rated" block would hurt trust more than no block.
 */
export function TopRated() {
  const { t, locale } = useI18n();
  const { data: garages = [] } = useGarages();

  const byCity = useMemo(() => {
    const map = new Map<string, RankedGarage[]>();
    const groups = new Map<string, typeof garages>();
    for (const g of garages) {
      const slug = cityFromAddress(g.address);
      if (!slug) continue;
      groups.set(slug, [...(groups.get(slug) ?? []), g]);
    }
    for (const [slug, list] of groups) map.set(slug, rankGarages(list).slice(0, 5));
    return map;
  }, [garages]);

  const cities = CITIES.filter((c) => byCity.has(c.slug))
    .sort((a, b) => (byCity.get(b.slug)?.length ?? 0) - (byCity.get(a.slug)?.length ?? 0))
    .slice(0, 6);
  const preferred = lastCity();
  const [selected, setSelected] = useState<string | null>(null);
  const current = selected ?? (preferred && byCity.has(preferred.slug) ? preferred.slug : cities[0]?.slug);

  if (garages.length < MIN_GARAGES || !current) return null;
  const list = byCity.get(current) ?? [];
  const label = cityName(current, locale);

  return (
    <section aria-labelledby="top-title" className="bg-paper-2">
      <div className="container-editorial py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="top-title" className="text-[34px] font-bold text-strong md:text-5xl">
              {t('home.topTitle', { city: label })}
            </h2>
            <p className="mt-3 text-lg text-slate1">{t('home.topLead')}</p>
          </div>
          <Link to={`/mecanique/${current}`} className="inline-flex items-center gap-2 font-semibold text-strong hover:underline">
            {t('home.topSeeAll')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {cities.length > 1 && (
          <div role="tablist" aria-label={t('search.cityLabel')} className="scrollbar-hide -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {cities.map((c) => (
              <button
                key={c.slug}
                type="button"
                role="tab"
                aria-selected={c.slug === current}
                onClick={() => setSelected(c.slug)}
                className={cn(
                  'min-h-[40px] shrink-0 rounded-full border px-4 text-[15px] font-semibold transition-colors',
                  c.slug === current ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-slate1 hover:text-ink',
                )}
              >
                {cityName(c.slug, locale)}
              </button>
            ))}
          </div>
        )}

        <ol className="mt-6 space-y-3">
          {list.map((g) => (
            <li key={g.id}>
              <GarageRow garage={g} cityLabel={label} compact />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
