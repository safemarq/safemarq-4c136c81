import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nProvider';
import { CITIES, cityName, rememberCity, type Region } from '@/lib/cities';

const REGIONS: Region[] = ['brussels', 'wallonia', 'flanders'];

/** Every covered town, by region: one link per town to its garage ranking. */
export function CityIndex() {
  const { t, locale } = useI18n();
  const collator = new Intl.Collator(locale);

  return (
    <section aria-labelledby="cities-title" className="container-editorial py-16 md:py-24">
      <h2 id="cities-title" className="text-[34px] font-bold text-strong md:text-5xl">
        {t('home.citiesTitle')}
      </h2>
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_2fr_2fr] md:gap-8">
        {REGIONS.map((region) => {
          const cities = CITIES.filter((c) => c.region === region).sort((a, b) =>
            collator.compare(cityName(a.slug, locale), cityName(b.slug, locale)),
          );
          return (
            <div key={region}>
              <h3 className="border-b-2 border-strong pb-2 text-2xl font-semibold text-strong">{t(`home.regions.${region}`)}</h3>
              <ul className={`mt-2 grid gap-x-6 ${cities.length > 1 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-1'}`}>
                {cities.map((c) => {
                  const name = cityName(c.slug, locale);
                  return (
                    <li key={c.slug}>
                      <Link
                        to={`/mecanique/${c.slug}`}
                        onClick={() => rememberCity(c.slug)}
                        className="block border-b border-line py-3 text-[16px] font-medium text-ink transition-colors hover:text-strong hover:underline"
                        title={t('home.cityLink', { city: name })}
                      >
                        {name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
