import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs, breadcrumbJsonLd } from '@/components/site/Breadcrumbs';
import { VehicleTabs } from '@/components/site/VehicleTabs';
import { useI18n } from '@/i18n/I18nProvider';
import { vehicleKey } from '@/i18n/keys';
import { fold } from '@/lib/cities';
import { makePath } from '@/lib/links';
import { MAKES, byLetter, makesFor, type Make } from '@/lib/makes';
import { DEFAULT_VEHICLE, type VehicleSlug } from '@/lib/taxonomy';

/** /marques: every make, by kind of vehicle, as a typographic index. */
export default function Makes() {
  const { t, tp, locale } = useI18n();
  const ids = useId();
  const [vehicle, setVehicle] = useState<VehicleSlug>(DEFAULT_VEHICLE);
  const [query, setQuery] = useState('');

  const list = useMemo(() => makesFor(vehicle, locale), [vehicle, locale]);
  const common = list.filter((m) => m.top);
  const q = fold(query);
  const matches = useMemo(
    () =>
      q
        ? MAKES.filter((m) => fold(m.name).includes(q) || m.slug.includes(q.replace(/\s+/g, '-'))).sort((a, b) =>
            a.name.localeCompare(b.name, locale, { sensitivity: 'base' }),
          )
        : [],
    [q, locale],
  );

  const crumbs = [{ label: t('nav.home'), to: '/' }, { label: t('nav.makes') }];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title={t('makes.metaTitle')}
        description={t('makes.metaDescription')}
        canonical="https://safemarq.com/marques"
        jsonLd={breadcrumbJsonLd([{ label: t('nav.home'), to: '/' }, { label: t('nav.makes'), to: '/marques' }])}
      />
      <SiteHeader overlay />

      <main id="contenu">
        <section className="bg-navy-900 text-chalk">
          <div className="container-editorial pb-12 pt-28 md:pb-16 md:pt-36">
            <Breadcrumbs items={crumbs} onDark />
            <h1 className="mt-5 max-w-[14ch] text-[44px] font-semibold leading-[1.02] text-chalk md:text-[72px]">{t('makes.title')}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-chalk/75">{t('makes.lead')}</p>

            <div className="relative mt-8 max-w-md">
              <label htmlFor={`${ids}-q`} className="sr-only">
                {t('makes.filterLabel')}
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate1" aria-hidden />
              <input
                id={`${ids}-q`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('makes.filterPlaceholder')}
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                className="h-14 w-full rounded-xl border-0 bg-card pl-12 pr-12 text-[17px] text-ink placeholder:text-slate2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={t('searchPage.clear')}
                  className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate1 hover:bg-paper-2 hover:text-ink"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="container-editorial py-10 md:py-16" aria-live="polite">
          {q ? (
            <FilterResults query={query} matches={matches} countLabel={tp('makes.results', matches.length)} />
          ) : (
            <>
              <VehicleTabs value={vehicle} onChange={setVehicle} idBase={ids} />
              <div role="tabpanel" id={`${ids}-panel`} aria-labelledby={`${ids}-${vehicle}`} className="pt-8 md:pt-10">
                {common.length > 0 && (
                  <div className="mb-12 md:mb-14">
                    <h2 className="font-display text-[22px] font-semibold text-slate1">{t('makes.common')}</h2>
                    <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-2 md:gap-x-10">
                      {common.map((m) => (
                        <li key={m.slug}>
                          <Link
                            to={makePath(m.slug)}
                            className="font-display text-[30px] font-semibold leading-tight text-strong underline-offset-[6px] hover:underline md:text-[40px]"
                          >
                            {m.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <h2 className="sr-only">{t('makes.all')}</h2>
                <LetterIndex makes={list} />
              </div>
            </>
          )}
        </section>

        <section className="border-t border-line bg-paper-2">
          <div className="container-editorial grid gap-6 py-12 md:grid-cols-[1fr_auto] md:items-end md:gap-12 md:py-16">
            <div className="max-w-2xl">
              <h2 className="text-[30px] font-semibold leading-tight text-strong md:text-4xl">{t('makes.equipmentTitle')}</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-slate1">{t('makes.equipmentBody')}</p>
            </div>
            <Link to="/outillage" className="btn-ghost-navy min-h-[48px] self-start px-5 md:self-auto">
              {t('makes.equipmentLink')}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/** A to Z, a letter per block, flowing in columns like the index of a catalogue. */
function LetterIndex({ makes }: { makes: Make[] }) {
  const groups = byLetter(makes);
  return (
    <div className="columns-2 gap-x-8 sm:columns-3 lg:columns-4">
      {groups.map(({ letter, makes: items }) => (
        <div key={letter} className="mb-7 break-inside-avoid border-t border-line pt-3">
          <p aria-hidden className="font-display text-[28px] font-semibold leading-none text-slate2">
            {letter}
          </p>
          <ul className="mt-2">
            {items.map((m) => (
              <li key={m.slug}>
                <Link to={makePath(m.slug)} className="block py-1.5 text-[17px] text-ink underline-offset-4 hover:text-strong hover:underline">
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FilterResults({ query, matches, countLabel }: { query: string; matches: Make[]; countLabel: string }) {
  const { t } = useI18n();
  if (matches.length === 0) {
    return <p className="text-[17px] text-slate1">{t('makes.noMatch', { query: query.trim() })}</p>;
  }
  return (
    <div>
      <p className="text-[15px] font-semibold text-slate1">{countLabel}</p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {matches.map((m) => (
          <li key={m.slug}>
            <Link to={makePath(m.slug)} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 hover:bg-paper-2/60">
              <span className="font-display text-[26px] font-semibold leading-tight text-strong">{m.name}</span>
              <span className="text-[15px] text-slate1">{m.vehicles.map((v) => t(vehicleKey(v, 'short'))).join(', ')}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

