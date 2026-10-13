import { Check, LayoutGrid } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeInfoKey, tradeLabelKey } from '@/i18n/keys';
import { DEFAULT_VEHICLE, groupedTrades, type TradeSlug, type VehicleSlug } from '@/lib/taxonomy';
import { tradeIcon } from '@/lib/tradeMeta';
import { cn } from '@/lib/utils';

/**
 * The trades of one vehicle, grouped by the kind of problem, each with icon
 * and a short description. Used by the search picker and the header menu.
 */
export function TradeList({
  vehicle = DEFAULT_VEHICLE,
  selected,
  onSelect,
  renderItem,
  allOption = false,
  columns = 3,
  dense = false,
  className,
}: {
  vehicle?: VehicleSlug;
  /** null = "every trade" (when allOption is on). */
  selected?: TradeSlug | null;
  onSelect?: (slug: TradeSlug | null) => void;
  /** Render each entry as something else (a link, for the menu). */
  renderItem?: (slug: TradeSlug, content: React.ReactNode, className: string) => React.ReactNode;
  /** Offer "every trade" first. */
  allOption?: boolean;
  columns?: 1 | 2 | 3;
  /** One line per trade, no description (menus). */
  dense?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const itemClass = (active: boolean) =>
    cn(
      'group flex w-full items-center rounded-lg px-2 text-left transition-colors hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none',
      dense ? 'min-h-[40px] gap-2.5 py-1' : 'gap-3 py-2',
      active && 'bg-paper-2',
    );
  const tile = (active: boolean) =>
    cn(
      'grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition-colors',
      active ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-strong group-hover:border-ink/25',
    );

  return (
    <div className={className}>
      {allOption && (
        <button type="button" className={cn(itemClass(selected === null), 'mb-3')} aria-pressed={selected === null} onClick={() => onSelect?.(null)}>
          <span aria-hidden className={tile(selected === null)}>
            <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </span>
          <span className="min-w-0 flex-1 text-[15px] font-semibold text-ink">{t('search.allTrades')}</span>
          {selected === null && <Check className="h-4 w-4 shrink-0 text-strong" aria-hidden />}
        </button>
      )}
      {/* Columns, not a grid: groups of very different lengths flow without gaps. */}
      <div className={cn('gap-x-6', columns === 3 ? 'md:columns-3' : columns === 2 ? 'sm:columns-2' : '')}>
        {groupedTrades(vehicle).map((group) => (
          <section
            key={group.id}
            aria-labelledby={`trade-group-${vehicle}-${group.id}`}
            className={cn('break-inside-avoid', dense ? 'pb-4' : 'pb-6')}
          >
            <h3 id={`trade-group-${vehicle}-${group.id}`} className={cn('px-2 font-sans text-[13px] font-semibold text-slate1', dense ? 'mb-1' : 'mb-2')}>
              {t(`tradeGroups.${group.id}`)}
            </h3>
            <ul className="space-y-0.5">
              {group.trades.map((slug) => {
                const Icon = tradeIcon(slug);
                const active = selected === slug;
                const content = dense ? (
                  <>
                    <Icon className="h-[17px] w-[17px] shrink-0 text-slate1 group-hover:text-strong" strokeWidth={1.9} aria-hidden />
                    <span className="min-w-0 flex-1 text-[15px] font-medium leading-tight text-ink">{t(tradeLabelKey(slug, vehicle))}</span>
                    {active && <Check className="h-4 w-4 shrink-0 text-strong" aria-hidden />}
                  </>
                ) : (
                  <>
                    <span aria-hidden className={tile(active)}>
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold leading-tight text-ink">{t(tradeLabelKey(slug, vehicle))}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-slate1">{t(tradeInfoKey(slug, vehicle))}</span>
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0 text-strong" aria-hidden />}
                  </>
                );
                return (
                  <li key={slug}>
                    {renderItem ? (
                      renderItem(slug, content, itemClass(active))
                    ) : (
                      <button type="button" className={itemClass(active)} aria-pressed={active} onClick={() => onSelect?.(slug)}>
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
    </div>
  );
}
