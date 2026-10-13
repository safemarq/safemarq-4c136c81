import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

export type ScoreGrade = 'excellent' | 'veryGood' | 'good' | 'fair' | 'weak';

export function scoreGrade(score: number): ScoreGrade {
  if (score >= 85) return 'excellent';
  if (score >= 75) return 'veryGood';
  if (score >= 65) return 'good';
  if (score >= 50) return 'fair';
  return 'weak';
}

const GRADE_TONE: Record<ScoreGrade, string> = {
  excellent: 'text-teal',
  veryGood: 'text-teal',
  good: 'text-strong',
  fair: 'text-amber-d dark:text-amber',
  weak: 'text-coral',
};

const SIZES = {
  sm: { box: 'h-10 w-10 text-[19px]', notch: 'h-2 w-2' },
  md: { box: 'h-14 w-14 text-[27px]', notch: 'h-2.5 w-2.5' },
  lg: { box: 'h-24 w-24 text-[48px]', notch: 'h-4 w-4' },
} as const;

/**
 * The SafeMarq hallmark: a navy square with the score and the amber punched
 * corner from the logo. Same on light and dark (navy reads as "SafeMarq").
 */
export function ScoreBadge({
  score,
  size = 'md',
  showGrade = true,
  onNavy = false,
  className,
}: {
  score: number;
  size?: keyof typeof SIZES;
  showGrade?: boolean;
  /** Placed on a navy band: gives the tile a light outline so it stays visible. */
  onNavy?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const grade = scoreGrade(score);
  const label = t(`score.grades.${grade}`);
  const s = SIZES[size];

  return (
    <div className={cn('inline-flex items-center gap-3', className)} role="img" aria-label={t('score.aria', { score, grade: label })}>
      <span
        aria-hidden
        className={cn(
          'relative grid shrink-0 place-items-center rounded-md bg-navy-900 font-display font-bold leading-none text-chalk num',
          onNavy ? 'ring-1 ring-inset ring-chalk/25' : 'dark:ring-1 dark:ring-inset dark:ring-chalk/15',
          s.box,
        )}
      >
        {score}
        <span className={cn('absolute bottom-0 right-0 rounded-br-md bg-amber', s.notch)} />
      </span>
      {showGrade && (
        <span aria-hidden className="leading-tight">
          <span className={cn('block font-display text-[17px] font-semibold', onNavy ? 'text-chalk' : GRADE_TONE[grade])}>{label}</span>
          <span className={cn('block text-[13px]', onNavy ? 'text-chalk/65' : 'text-slate1')}>{t('score.label')}</span>
        </span>
      )}
    </div>
  );
}
