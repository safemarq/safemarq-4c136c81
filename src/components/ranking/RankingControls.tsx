import { AlertCircle } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { RADIUS_OPTIONS, type RankingSort } from '@/hooks/useRanking';
import { cn } from '@/lib/utils';

export function LoadError({ onRetry, message }: { onRetry: () => void; message?: string }) {
  const { t } = useI18n();
  return (
    <div role="alert" className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-6">
      <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
      <p className="flex-1 text-[16px] text-ink">{message ?? t('ranking.error')}</p>
      <button type="button" onClick={onRetry} className="btn-ghost-navy min-h-[44px] px-4">
        {t('common.retry')}
      </button>
    </div>
  );
}

export const chipClass = (active: boolean) =>
  cn(
    'min-h-[40px] shrink-0 rounded-full border px-3.5 text-[14px] font-semibold transition-colors',
    active ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-slate1 hover:text-ink',
  );

/** Radius and sort, as two rows of chips (radio groups). */
export function RankingFilters({
  radius,
  sort,
  onRadius,
  onSort,
}: {
  radius: number;
  sort: RankingSort;
  onRadius: (km: number) => void;
  onSort: (sort: RankingSort) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div role="radiogroup" aria-label={t('ranking.radiusLabel')} className="scrollbar-hide -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <span className="shrink-0 text-[14px] font-semibold text-slate1">{t('ranking.radiusLabel')}</span>
        {RADIUS_OPTIONS.map((km) => (
          <button key={km} type="button" role="radio" aria-checked={km === radius} onClick={() => onRadius(km)} className={chipClass(km === radius)}>
            {t('ranking.radiusValue', { km })}
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label={t('ranking.sortLabel')} className="flex items-center gap-2">
        <span className="shrink-0 text-[14px] font-semibold text-slate1">{t('ranking.sortLabel')}</span>
        {(['score', 'distance'] as const).map((s) => (
          <button key={s} type="button" role="radio" aria-checked={s === sort} onClick={() => onSort(s)} className={chipClass(s === sort)}>
            {s === 'score' ? t('ranking.sortScore') : t('ranking.sortDistance')}
          </button>
        ))}
      </div>
    </div>
  );
}
