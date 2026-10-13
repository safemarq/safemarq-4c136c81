import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import { ScoreBadge } from '@/components/site/ScoreBadge';
import { useI18n } from '@/i18n/I18nProvider';
import type { Listing } from '@/hooks/useRanking';
import { cn } from '@/lib/utils';

export type RowGarage = Pick<Listing, 'slug' | 'name' | 'rating' | 'reviews' | 'verified' | 'address' | 'score' | 'rank'> & {
  distanceKm?: number | null;
};

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block h-4 w-4">
            <Star className="absolute inset-0 h-4 w-4 text-line" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="h-4 w-4 text-amber" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** One line of a ranking: rank, SafeMarq score, Google rating, address and actions. */
export function GarageRow({ garage, cityLabel, compact = false }: { garage: RowGarage; cityLabel: string; compact?: boolean }) {
  const { t, tp, formatNumber } = useI18n();
  const top = garage.rank === 1 && !compact;

  return (
    <article
      className={cn(
        'relative grid gap-4 rounded-2xl border bg-card p-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6 md:p-5',
        top ? 'border-amber/70 shadow-md' : 'border-line',
      )}
    >
      {top && (
        <span className="absolute -top-3 left-4 rounded-md bg-amber px-2.5 py-1 text-[13px] font-semibold text-amber-d">
          {t('ranking.bestChoice', { city: cityLabel })}
        </span>
      )}

      <div className="flex items-center gap-4">
        <span className="w-9 text-center font-display text-[28px] font-bold leading-none text-slate2 num" aria-label={t('ranking.rank', { rank: garage.rank })}>
          {garage.rank}
        </span>
        <ScoreBadge score={garage.score} size={compact ? 'sm' : 'md'} showGrade={false} />
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-[22px] font-semibold leading-tight text-strong">
          <Link to={`/garage/${garage.slug}`} className="after:absolute after:inset-0 md:after:content-none hover:underline">
            {garage.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-slate1">
          <Stars value={garage.rating} />
          <span className="font-semibold text-ink">{formatNumber(garage.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          <span>{tp('ranking.googleReviews', garage.reviews)}</span>
          {garage.verified && (
            <span className="inline-flex items-center gap-1 font-semibold text-teal">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              {t('ranking.verified')}
            </span>
          )}
        </p>
        {!compact && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-slate1">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{garage.address}</span>
            {garage.distanceKm != null && (
              <span className="shrink-0 font-semibold text-ink">
                · {t('ranking.distance', { km: formatNumber(garage.distanceKm, { maximumFractionDigits: 1 }) })}
              </span>
            )}
          </p>
        )}
      </div>

      {!compact && (
        <div className="relative z-10 flex gap-2 md:flex-col md:items-stretch">
          <Link to={`/garage/${garage.slug}#devis`} className="btn-amber min-h-[44px] flex-1 px-4 text-[15px]">
            {t('ranking.requestQuote')}
          </Link>
          <Link to={`/garage/${garage.slug}`} className="btn-ghost-navy min-h-[44px] flex-1 px-4 text-[15px]">
            {t('ranking.viewListing')}
          </Link>
        </div>
      )}
    </article>
  );
}
