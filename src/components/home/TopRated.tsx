import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { GarageRow } from '@/components/ranking/GarageRow';
import { useRanking } from '@/hooks/useRanking';
import { useI18n } from '@/i18n/I18nProvider';
import { CITIES, cityName, lastCity } from '@/lib/cities';
import { rankingPath } from '@/lib/links';

const MIN_GARAGES = 3;

/**
 * The best-rated garages around the visitor's town (Brussels by default).
 * Renders nothing until there are enough: an empty "top rated" block would
 * hurt trust more than no block.
 */
export function TopRated() {
  const { t, locale } = useI18n();
  const city = lastCity() ?? CITIES[0];
  const { data } = useRanking({ vehicle: 'voiture', trade: null, lat: city.lat, lng: city.lng, radiusKm: 15, limit: 5 });

  if (!data || data.items.length < MIN_GARAGES) return null;
  const label = cityName(city, locale);

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
          <Link to={rankingPath({ vehicle: 'voiture', trade: null, city: city.slug })} className="inline-flex items-center gap-2 font-semibold text-strong hover:underline">
            {t('home.topSeeAll')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ol className="mt-6 space-y-3">
          {data.items.map((g) => (
            <li key={g.id}>
              <GarageRow garage={g} cityLabel={label} compact />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
