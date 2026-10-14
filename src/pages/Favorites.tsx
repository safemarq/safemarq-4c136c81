import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Heart, X } from 'lucide-react';
import { toast } from 'sonner';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { ScoreBadge } from '@/components/site/ScoreBadge';
import { Stars } from '@/components/ranking/GarageRow';
import { LoadError } from '@/components/ranking/RankingControls';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { useCatalogs, useGarageSummaries, type GarageSummary } from '@/hooks/useGarageSummaries';
import { useI18n } from '@/i18n/I18nProvider';
import { getToolBrand } from '@/lib/equipment';
import { getMake } from '@/lib/makes';
import { cn } from '@/lib/utils';

const MAX_COMPARE = 3;

/** /favoris: saved establishments, with or without an account, and a side-by-side comparison. */
export default function Favorites() {
  const { t, tp } = useI18n();
  const { ids, signedIn, isLoading: favLoading, isError: favError } = useFavorites();
  const { data: garages = [], isLoading, isError, refetch } = useGarageSummaries(ids);
  const [selected, setSelected] = useState<string[]>([]);
  const tableRef = useRef<HTMLElement>(null);
  const [tableVisible, setTableVisible] = useState(false);

  // Forget selections of establishments removed from favourites.
  useEffect(() => {
    setSelected((s) => s.filter((id) => ids.includes(id)));
  }, [ids]);

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= MAX_COMPARE) {
        toast(t('favorites.compareMax'));
        return s;
      }
      return [...s, id];
    });

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return setTableVisible(false);
    const io = new IntersectionObserver(([entry]) => setTableVisible(entry.isIntersecting), { rootMargin: '0px 0px -30% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [selected.length, garages.length]);

  const compared = useMemo(() => selected.map((id) => garages.find((g) => g.id === id)).filter((g): g is GarageSummary => !!g), [selected, garages]);
  const loading = favLoading || (ids.length > 0 && isLoading);
  const empty = !loading && ids.length === 0;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo title={t('favorites.metaTitle')} noindex />
      <SiteHeader />

      <main id="contenu" className="container-editorial pb-28 pt-10 md:pb-20 md:pt-14">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 className="text-[44px] font-semibold leading-none text-strong md:text-[64px]">{t('favorites.title')}</h1>
          {ids.length > 0 && <p className="pb-1 text-[16px] text-slate1">{tp('favorites.count', ids.length)}</p>}
        </header>

        {!signedIn && ids.length > 0 && (
          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-paper-2 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <h2 className="font-display text-[22px] font-semibold text-strong">{t('favorites.deviceTitle')}</h2>
              <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-slate1">{t('favorites.deviceBody')}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link to="/auth?retour=/favoris&mode=inscription" className="btn-amber min-h-[44px] px-5">
                {t('favorites.deviceCta')}
              </Link>
              <Link to="/auth?retour=/favoris" className="btn-ghost-navy min-h-[44px] px-4">
                {t('favorites.deviceSignIn')}
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <ul className="space-y-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-24 animate-pulse rounded-2xl bg-paper-2" />
              ))}
            </ul>
          ) : favError || isError ? (
            <LoadError onRetry={() => refetch()} message={t('favorites.loadError')} />
          ) : empty ? (
            <div className="max-w-xl py-6">
              <Heart className="h-9 w-9 text-slate2" aria-hidden />
              <h2 className="mt-4 text-[30px] font-semibold leading-tight text-strong">{t('favorites.emptyTitle')}</h2>
              <p className="mt-2 text-[17px] leading-relaxed text-slate1">{t('favorites.emptyBody')}</p>
              <Link to="/recherche" className="btn-amber mt-6 min-h-[48px] px-6">
                {t('favorites.emptyCta')}
              </Link>
            </div>
          ) : (
            <>
              {garages.length >= 2 && <p className="mb-4 text-[15px] text-slate1">{t('favorites.compareHint')}</p>}
              <ul className="divide-y divide-line border-y border-line">
                {garages.map((g) => (
                  <FavoriteRow key={g.id} garage={g} selectable={garages.length >= 2} selected={selected.includes(g.id)} onSelect={() => toggleSelect(g.id)} />
                ))}
              </ul>
            </>
          )}
        </div>

        <AnimatePresence>
          {compared.length >= 2 && (
            <motion.section
              ref={tableRef}
              id="comparaison"
              aria-labelledby="compare-title"
              className="mt-14 scroll-mt-24"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="compare-title" className="text-[32px] font-semibold leading-tight text-strong md:text-[40px]">
                  {t('favorites.compareTitle')}
                </h2>
                <button type="button" onClick={() => setSelected([])} className="text-[15px] font-semibold text-slate1 underline-offset-4 hover:text-strong hover:underline">
                  {t('favorites.compareClear')}
                </button>
              </div>
              <CompareTable garages={compared} onRemove={(id) => setSelected((s) => s.filter((x) => x !== id))} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Phones: the table sits below a long list; a bar brings it into view. */}
      {compared.length >= 2 && !tableVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-3 backdrop-blur md:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <button type="button" className="btn-amber min-h-[48px] w-full" onClick={() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            {tp('favorites.compareCta', compared.length)}
          </button>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function FavoriteRow({ garage: g, selectable, selected, onSelect }: { garage: GarageSummary; selectable: boolean; selected: boolean; onSelect: () => void }) {
  const { t, tp, formatNumber } = useI18n();
  const checkboxId = `cmp-${g.id}`;
  return (
    <li className={cn('relative grid grid-cols-[auto_auto_1fr_auto] items-center gap-x-4 py-4 transition-colors md:gap-x-5', selected && 'bg-paper-2/70')}>
      {selectable ? (
        <span className="relative z-10 flex h-11 w-11 items-center justify-center">
          <input
            id={checkboxId}
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-5 w-5 cursor-pointer rounded border-line accent-[hsl(var(--strong))]"
          />
          <label htmlFor={checkboxId} className="sr-only">
            {t('favorites.compareSelect', { name: g.name })}
          </label>
        </span>
      ) : (
        <span aria-hidden className="w-0" />
      )}
      <ScoreBadge score={g.score} size="sm" showGrade={false} />
      <div className="min-w-0">
        <h3 className="truncate text-[19px] font-semibold leading-tight text-strong">
          <Link to={`/garage/${g.slug}`} className="hover:underline">
            {g.name}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[15px] text-slate1">
          {g.locality && <span className="font-semibold text-ink">{g.locality}</span>}
          <Stars value={g.rating} />
          <span>{formatNumber(g.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <span>{tp('ranking.googleReviews', g.reviews)}</span>
          {g.verified && (
            <span className="inline-flex items-center gap-1 font-semibold text-teal">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              {t('ranking.verified')}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Link to={`/garage/${g.slug}`} className="hidden min-h-[44px] items-center rounded-lg px-3 text-[15px] font-semibold text-strong hover:bg-paper-2 sm:inline-flex">
          {t('ranking.viewListing')}
        </Link>
        <FavoriteButton garageId={g.id} garageName={g.name} />
      </div>
    </li>
  );
}

/** Two or three establishments side by side; the best figure of each row is marked. */
function CompareTable({ garages, onRemove }: { garages: GarageSummary[]; onRemove: (id: string) => void }) {
  const { t, formatNumber, locale } = useI18n();
  const { data: catalogs } = useCatalogs(garages.map((g) => g.id));

  const best = (values: number[]) => Math.max(...values);
  const bestScore = best(garages.map((g) => g.score));
  const bestRating = best(garages.map((g) => g.rating));
  const bestReviews = best(garages.map((g) => g.reviews));

  const mark = (isBest: boolean, content: React.ReactNode) => (
    <span className={cn(isBest && 'font-semibold text-teal')}>
      {content}
      {isBest && <span className="sr-only"> ({t('favorites.best')})</span>}
    </span>
  );

  const rows: { label: string; cell: (g: GarageSummary) => React.ReactNode }[] = [
    { label: t('favorites.rows.score'), cell: (g) => <ScoreBadge score={g.score} size="sm" showGrade={false} className={cn(g.score === bestScore && 'ring-2 ring-teal ring-offset-2 ring-offset-card rounded-md')} /> },
    {
      label: t('favorites.rows.rating'),
      cell: (g) =>
        mark(
          g.rating === bestRating,
          <span className="inline-flex items-center gap-2">
            {formatNumber(g.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            <Stars value={g.rating} />
          </span>,
        ),
    },
    { label: t('favorites.rows.reviews'), cell: (g) => mark(g.reviews === bestReviews, formatNumber(g.reviews)) },
    { label: t('favorites.rows.verified'), cell: (g) => (g.verified ? t('favorites.yes') : t('favorites.no')) },
    { label: t('favorites.rows.locality'), cell: (g) => [g.postalCode, g.locality].filter(Boolean).join(' ') || '—' },
    { label: t('favorites.rows.type'), cell: (g) => (g.type === 'dealer' ? t('favorites.typeDealer') : t('favorites.typeIndependent')) },
    { label: t('favorites.rows.price'), cell: (g) => g.priceLevel || t('favorites.unknown') },
    { label: t('favorites.rows.makes'), cell: (g) => <CatalogList items={catalogs?.makes[g.id]?.map((m) => getMake(m.make)?.name ?? m.make)} locale={locale} /> },
    { label: t('favorites.rows.equipment'), cell: (g) => <CatalogList items={catalogs?.tools[g.id]?.map((b) => getToolBrand(b)?.name ?? b)} locale={locale} /> },
    {
      label: t('favorites.rows.phone'),
      cell: (g) =>
        g.phone ? (
          <a href={`tel:${g.phone.replace(/\s+/g, '')}`} className="font-semibold text-strong underline underline-offset-4">
            {g.phone}
          </a>
        ) : (
          t('favorites.unknown')
        ),
    },
  ];

  const nameCell = (g: GarageSummary, size: 'sm' | 'lg') => (
    <div className="flex items-start justify-between gap-1">
      <Link
        to={`/garage/${g.slug}`}
        className={cn('font-display font-semibold leading-tight text-strong hover:underline', size === 'lg' ? 'text-[20px]' : 'text-[17px] [overflow-wrap:anywhere]')}
      >
        {g.name}
      </Link>
      <button
        type="button"
        onClick={() => onRemove(g.id)}
        aria-label={t('favorites.compareSelect', { name: g.name })}
        aria-pressed
        className="-mr-2 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate1 hover:bg-paper-2 hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
  const quote = (g: GarageSummary) => (
    <Link to={`/garage/${g.slug}#devis`} className="btn-amber min-h-[44px] w-full px-3 text-[14px]">
      {t('ranking.requestQuote')}
    </Link>
  );

  return (
    <>
      {/* Phones: each criterion as a caption over the values, so two or three columns fit. */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card md:hidden">
        <table className="w-full table-fixed border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-line">
              {garages.map((g) => (
                <th key={g.id} scope="col" className="p-3 align-top">
                  {nameCell(g, 'sm')}
                </th>
              ))}
            </tr>
          </thead>
          {rows.map((r) => (
            <tbody key={r.label} className="border-b border-line">
              <tr>
                <th scope="colgroup" colSpan={garages.length} className="px-3 pb-1 pt-3 text-[13px] font-semibold text-slate1">
                  {r.label}
                </th>
              </tr>
              <tr>
                {garages.map((g) => (
                  <td key={g.id} className="px-3 pb-3 align-top text-ink [overflow-wrap:anywhere]">
                    {r.cell(g)}
                  </td>
                ))}
              </tr>
            </tbody>
          ))}
          <tbody>
            <tr>
              {garages.map((g) => (
                <td key={g.id} className="p-3">
                  {quote(g)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-line bg-card md:block">
        <table className="w-full table-fixed border-collapse text-left text-[15px]">
          <colgroup>
            <col className="w-[12rem]" />
            {garages.map((g) => (
              <col key={g.id} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="p-4">
                <span className="sr-only">{t('favorites.compareTitle')}</span>
              </th>
              {garages.map((g) => (
                <th key={g.id} scope="col" className="p-4 align-top">
                  {nameCell(g, 'lg')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-b-0">
                <th scope="row" className="p-4 align-top text-[14px] font-semibold text-slate1">
                  {r.label}
                </th>
                {garages.map((g) => (
                  <td key={g.id} className="p-4 align-top text-ink">
                    {r.cell(g)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className="p-4">
                <span className="sr-only">{t('ranking.requestQuote')}</span>
              </th>
              {garages.map((g) => (
                <td key={g.id} className="p-4">
                  {quote(g)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function CatalogList({ items, locale }: { items: string[] | undefined; locale: string }) {
  const { t } = useI18n();
  if (!items || items.length === 0) return <span className="text-slate1">{t('favorites.unknown')}</span>;
  const sorted = [...items].sort((a, b) => a.localeCompare(b, locale, { sensitivity: 'base' }));
  return <span>{sorted.join(', ')}</span>;
}

