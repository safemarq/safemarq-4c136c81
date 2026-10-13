import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nProvider';

/** The S block with its punched amber corner: the SafeMarq hallmark. */
export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-[7px] bg-navy-900 dark:ring-1 dark:ring-inset dark:ring-chalk/15', className)}
      style={{ width: size, height: size }}
    >
      <span className="font-display leading-none text-chalk" style={{ fontSize: size * 0.5, fontWeight: 600 }}>
        S
      </span>
      <span className="absolute bottom-0 right-0 bg-amber" style={{ width: size * 0.22, height: size * 0.22 }} />
    </span>
  );
}

export function BrandLink({ to = '/', className, onDark }: { to?: string; className?: string; onDark?: boolean }) {
  const { t } = useI18n();
  return (
    <Link to={to} className={cn('flex shrink-0 items-center gap-2.5 rounded-md', className)} aria-label={`SafeMarq, ${t('nav.home')}`}>
      <BrandMark />
      <span className={cn('font-display text-[23px] font-bold leading-none', onDark ? 'text-chalk' : 'text-strong')}>
        SafeMarq
      </span>
    </Link>
  );
}
