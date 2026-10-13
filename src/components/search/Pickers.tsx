import { useState } from 'react';
import { Check, ChevronDown, LayoutGrid } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useI18n } from '@/i18n/I18nProvider';
import { tradeLabelKey, vehicleKey } from '@/i18n/keys';
import { VEHICLES, type TradeSlug, type VehicleSlug } from '@/lib/taxonomy';
import { tradeIcon, vehicleIcon } from '@/lib/tradeMeta';
import { cn } from '@/lib/utils';
import { TradeList } from './TradeList';

export type PickerVariant = 'field' | 'pill' | 'tab';

/** Popover on desktop, bottom sheet on phones: shared shell of the two pickers. */
export function PickerShell({
  trigger,
  title,
  open,
  onOpenChange,
  wide,
  width = 'w-72 p-2',
  children,
}: {
  trigger: React.ReactElement;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wide?: boolean;
  /** Popover width classes when not wide. */
  width?: string;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
          <DrawerContent className="max-h-[88dvh] border-line bg-card">
            <DrawerTitle className="px-5 pb-1 pt-4 text-left font-display text-2xl font-semibold text-strong">{title}</DrawerTitle>
            <div className="overflow-y-auto px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">{children}</div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className={cn('max-h-[min(70vh,40rem,var(--radix-popover-content-available-height))] overflow-y-auto rounded-2xl border-line bg-card p-5 shadow-lg', wide ? 'w-[min(56rem,calc(100vw-3rem))]' : width)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

const fieldTrigger =
  'flex h-14 w-full min-w-0 items-center gap-2 rounded-xl bg-paper-2 px-3 text-left text-[16px] font-semibold text-ink transition-colors hover:bg-line/60 md:gap-3 md:px-4';

/** Rounded filter chip (search page). `active` = differs from the default. */
export const pillTrigger = (active = false) =>
  cn(
    'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-colors',
    active ? 'border-strong bg-strong text-paper' : 'border-line bg-card text-ink hover:border-ink/40',
  );

/** The seven vehicles as a list (inside a picker). */
export function VehicleList({ value, onPick }: { value: VehicleSlug; onPick: (v: VehicleSlug) => void }) {
  const { t } = useI18n();
  return (
    <ul className="space-y-0.5">
      {VEHICLES.map((v) => {
        const VIcon = vehicleIcon(v);
        const active = v === value;
        return (
          <li key={v}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onPick(v)}
              className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-paper-2', active && 'bg-paper-2')}
            >
              <VIcon className="h-5 w-5 shrink-0 text-strong" aria-hidden />
              <span className="flex-1 text-[15px] font-semibold text-ink">{t(vehicleKey(v, 'label'))}</span>
              {active && <Check className="h-4 w-4 text-strong" aria-hidden />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function VehiclePicker({
  value,
  onChange,
  variant = 'field',
}: {
  value: VehicleSlug;
  onChange: (v: VehicleSlug) => void;
  variant?: Exclude<PickerVariant, 'tab'>;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const Icon = vehicleIcon(value);
  return (
    <PickerShell
      title={t('search.chooseVehicle')}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`${t('search.vehicleLabel')} : ${t(vehicleKey(value, 'label'))}`}
          className={variant === 'pill' ? pillTrigger(value !== 'voiture') : fieldTrigger}
        >
          <Icon className={cn('shrink-0', variant === 'pill' ? 'h-[18px] w-[18px]' : 'h-5 w-5 text-strong')} aria-hidden />
          <span className={cn('min-w-0 truncate', variant === 'field' && 'flex-1')}>{t(vehicleKey(value, 'short'))}</span>
          <ChevronDown className={cn('h-4 w-4 shrink-0', variant === 'field' && 'text-slate1')} aria-hidden />
        </button>
      }
    >
      <VehicleList
        value={value}
        onPick={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </PickerShell>
  );
}

/** Every trade of the vehicle. As a tab ("All services") on the hero, as a field elsewhere. */
export function TradePicker({
  vehicle,
  value,
  onChange,
  variant = 'field',
  allowAll,
}: {
  vehicle: VehicleSlug;
  value: TradeSlug | null;
  onChange: (slug: TradeSlug | null) => void;
  variant?: PickerVariant;
  allowAll?: boolean;
}) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const Icon = value ? tradeIcon(value) : LayoutGrid;
  const label = value ? t(tradeLabelKey(value, vehicle)) : t('search.allTrades');

  const trigger = variant === 'pill' ? (
    <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${t('search.tradeLabel')} : ${label}`} className={pillTrigger(value !== null)}>
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
      <span className="max-w-[14rem] truncate">{label}</span>
      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
    </button>
  ) : variant === 'tab' ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-haspopup="dialog"
      className="inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-slate1 transition-colors hover:bg-paper-2 hover:text-ink"
    >
      <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
      {t('search.allTrades')}
      <ChevronDown className="h-4 w-4" aria-hidden />
    </button>
  ) : (
    <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${t('search.tradeLabel')} : ${label}`} className={fieldTrigger}>
      {/* Half-width on phones: the words matter more than the icon. */}
      <Icon className="hidden h-5 w-5 shrink-0 text-strong sm:block" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-slate1" aria-hidden />
    </button>
  );

  return (
    <PickerShell title={t('search.chooseTrade')} open={open} onOpenChange={setOpen} trigger={trigger} wide>
      <TradeList
        vehicle={vehicle}
        selected={value}
        allOption={allowAll}
        columns={isMobile ? 1 : 3}
        onSelect={(slug) => {
          onChange(slug);
          setOpen(false);
        }}
      />
    </PickerShell>
  );
}
