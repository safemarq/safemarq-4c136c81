import type { ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

export function StepHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-[26px] leading-tight text-strong md:text-[30px]">{title}</h2>
      {lead && <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-slate1">{lead}</p>}
    </div>
  );
}

/** Large radio card: whole surface is the hit target. Use inside a role="radiogroup". */
export function ChoiceCard({
  checked,
  onSelect,
  title,
  hint,
  icon,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors',
        checked ? 'border-strong ring-1 ring-strong' : 'border-line hover:border-ink/30',
      )}
    >
      {icon && <span className="mt-0.5 text-slate1">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink">{title}</span>
        {hint && <span className="mt-0.5 block text-sm leading-snug text-slate1">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border',
          checked ? 'border-strong bg-strong text-paper' : 'border-ink/30',
        )}
      >
        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
    </button>
  );
}

/** Back / continue bar; sticks to the bottom on phones so the action is always in reach. */
export function StepActions({
  onBack,
  primaryLabel,
  busy,
  primaryType = 'submit',
  onPrimary,
}: {
  onBack?: () => void;
  primaryLabel: string;
  busy?: boolean;
  primaryType?: 'submit' | 'button';
  onPrimary?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="sticky bottom-0 -mx-4 mt-10 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-12 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-slate1 hover:bg-paper-2 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('common.previous')}
          </button>
        )}
        <button type={primaryType} onClick={onPrimary} disabled={busy} className="btn-amber ml-auto min-w-[10rem] flex-1 sm:flex-none">
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

export function Progress({ labels, current }: { labels: string[]; current: number }) {
  const { t } = useI18n();
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-slate1">
        {t('pro.onboarding.progress', { current: current + 1, total: labels.length })}
        <span className="text-ink sm:hidden"> · {labels[current]}</span>
      </p>
      <ol className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
        {labels.map((label, i) => (
          <li key={label} aria-current={i === current ? 'step' : undefined}>
            <span className={cn('block h-1 rounded-full', i <= current ? 'bg-strong' : 'bg-line')} />
            <span className={cn('mt-2 hidden text-[13px] sm:block', i === current ? 'font-semibold text-ink' : 'text-slate1')}>{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
