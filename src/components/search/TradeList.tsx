import { Check } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeKey } from '@/i18n/keys';
import type { MessageKey } from '@/i18n/types';
import { TRADE_GROUPS, tradeIcon } from '@/lib/tradeMeta';
import { cn } from '@/lib/utils';

/**
 * All 13 trades, grouped by the kind of problem, each with icon and a short
 * description. Used by the search picker and the header mega-menu.
 */
export function TradeList({
  selected,
  onSelect,
  renderItem,
  columns = 3,
  className,
}: {
  selected?: string;
  onSelect?: (slug: string) => void;
  /** Render each entry as something else (a link, for the menu). */
  renderItem?: (slug: string, content: React.ReactNode, className: string) => React.ReactNode;
  columns?: 1 | 3;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={cn('grid gap-x-6 gap-y-6', columns === 3 ? 'md:grid-cols-3' : 'grid-cols-1', className)}>
      {TRADE_GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`trade-group-${group.id}`}>
          <h3 id={`trade-group-${group.id}`} className="mb-2 px-2 font-sans text-[13px] font-semibold text-slate1">
            {t(`tradeGroups.${group.id}`)}
          </h3>
          <ul className="space-y-0.5">
            {group.trades.map((slug) => {
              const Icon = tradeIcon(slug);
              const active = selected === slug;
              const itemClass = cn(
                'group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none',
                active && 'bg-paper-2',
              );
              const content = (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition-colors',
                      active ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-strong group-hover:border-ink/25',
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold leading-tight text-ink">{t(tradeKey(slug))}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-slate1">{t(`tradeInfo.${slug}` as MessageKey)}</span>
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-strong" aria-hidden />}
                </>
              );
              return (
                <li key={slug}>
                  {renderItem ? (
                    renderItem(slug, content, itemClass)
                  ) : (
                    <button type="button" className={itemClass} aria-pressed={active} onClick={() => onSelect?.(slug)}>
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
