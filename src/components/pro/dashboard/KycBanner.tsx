import { Link } from 'react-router-dom';
import { AlertCircle, Clock, XCircle } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import type { ProAccount } from '@/hooks/useProAccount';
import { SUPPORT_EMAIL } from '@/lib/site';
import { cn } from '@/lib/utils';

const STATUS_STYLE = {
  pending: { icon: Clock, tone: 'border-amber/50 bg-amber/10', iconTone: 'text-amber' },
  needs_info: { icon: AlertCircle, tone: 'border-amber/50 bg-amber/10', iconTone: 'text-amber' },
  rejected: { icon: XCircle, tone: 'border-coral/40 bg-coral/5', iconTone: 'text-coral' },
} as const;

/** What the pro must know (and do) about their verification. Nothing when approved. */
export function KycBanner({ pro }: { pro: ProAccount }) {
  const { t } = useI18n();
  if (pro.kyc_status === 'approved') return null;
  const style = STATUS_STYLE[pro.kyc_status];
  const Icon = style.icon;

  return (
    <section role="status" className={cn('mb-8 rounded-xl border p-4 md:p-5', style.tone)}>
      <div className="flex gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.iconTone)} aria-hidden />
        <div className="min-w-0">
          <h2 className="font-sans text-base font-semibold text-ink">{t(`pro.status.${pro.kyc_status}`)}</h2>
          {pro.kyc_status === 'pending' && <p className="mt-1 text-[15px] leading-relaxed text-slate1">{t('pro.status.pendingBody')}</p>}
          {pro.kyc_status === 'needs_info' && (
            <>
              <p className="mt-1 text-[15px] text-slate1">{t('pro.status.needsInfoBody')}</p>
              {pro.review_note && <blockquote className="mt-2 border-l-2 border-amber pl-3 text-[15px] text-ink">{pro.review_note}</blockquote>}
              <Link to="/pro/inscription" className="btn-amber mt-4 min-h-[44px]">
                {t('pro.status.needsInfoAction')}
              </Link>
            </>
          )}
          {pro.kyc_status === 'rejected' && (
            <>
              <p className="mt-1 text-[15px] text-slate1">{t('pro.status.rejectedBody')}</p>
              {pro.review_note && <blockquote className="mt-2 border-l-2 border-coral pl-3 text-[15px] text-ink">{pro.review_note}</blockquote>}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="btn-ghost-navy mt-4 min-h-[44px]">
                {t('pro.status.rejectedAction')}
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function StatusChip({ status }: { status: ProAccount['kyc_status'] }) {
  const { t } = useI18n();
  const tone = {
    approved: 'bg-teal/10 text-teal',
    pending: 'bg-amber/15 text-amber-d dark:text-amber',
    needs_info: 'bg-amber/15 text-amber-d dark:text-amber',
    rejected: 'bg-coral/10 text-coral',
  }[status];
  return <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[13px] font-semibold', tone)}>{t(`pro.status.${status}`)}</span>;
}
