import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { ScoreBadge } from '@/components/site/ScoreBadge';
import { OfficialTag, Stars } from '@/components/ranking/GarageRow';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { useI18n } from '@/i18n/I18nProvider';
import type { TopGarage } from '@/hooks/useCatalog';

/**
 * Best-rated establishments across Belgium, as an index: rank, hallmark, name,
 * town. Lighter than the ranking cards, since the visitor has not chosen a town yet.
 */
export function NationalList({ items, officialLabel }: { items: TopGarage[]; officialLabel?: string }) {
  const { t, tp, formatNumber } = useI18n();
  return (
    <ol className="divide-y divide-line border-y border-line">
      {items.map((g) => (
        <li key={g.id} className="relative grid grid-cols-[2rem_auto_1fr_auto] items-center gap-x-4 py-4 md:gap-x-5">
          <span className="text-center font-display text-[24px] font-semibold leading-none text-slate2 num" aria-label={t('ranking.rank', { rank: g.rank })}>
            {g.rank}
          </span>
          <ScoreBadge score={g.score} size="sm" showGrade={false} />
          <div className="min-w-0">
            {g.official && officialLabel && <OfficialTag label={officialLabel} className="mb-1" />}
            <h3 className="truncate text-[19px] font-semibold leading-tight text-strong">
              <Link to={`/garage/${g.slug}`} className="after:absolute after:inset-0 hover:underline">
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
          <div className="relative z-10">
            <FavoriteButton garageId={g.id} garageName={g.name} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function NationalListSkeleton() {
  return (
    <ul className="divide-y divide-line border-y border-line" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-4 py-4">
          <span className="h-6 w-6 animate-pulse rounded bg-paper-2" />
          <span className="h-10 w-10 animate-pulse rounded-md bg-paper-2" />
          <span className="h-10 flex-1 animate-pulse rounded bg-paper-2" />
        </li>
      ))}
    </ul>
  );
}
