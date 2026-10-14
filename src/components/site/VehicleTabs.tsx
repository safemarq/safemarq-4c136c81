import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';
import { vehicleKey } from '@/i18n/keys';
import { VEHICLES, type VehicleSlug } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

interface Props {
  value: VehicleSlug;
  onChange: (v: VehicleSlug) => void;
  /** Ids: tabs are `${idBase}-${vehicle}`, the panel is `${idBase}-panel`. */
  idBase: string;
  /** Subset to show (default: all seven). */
  vehicles?: readonly VehicleSlug[];
  size?: 'lg' | 'sm';
  className?: string;
}

/** The vehicles as words; the amber line slides to the one chosen ("you can change this"). */
export function VehicleTabs({ value, onChange, idBase, vehicles = VEHICLES, size = 'lg', className }: Props) {
  const { t } = useI18n();
  const refs = useRef(new Map<VehicleSlug, HTMLButtonElement>());

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const edge = e.key === 'Home' ? 0 : e.key === 'End' ? vehicles.length - 1 : null;
    if (!step && edge === null) return;
    e.preventDefault();
    const next = vehicles[edge ?? (vehicles.indexOf(value) + step + vehicles.length) % vehicles.length];
    onChange(next);
    refs.current.get(next)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={t('search.vehicleLabel')}
      onKeyDown={onKeyDown}
      className={cn(
        'scrollbar-hide -mx-4 flex overflow-x-auto border-b border-line px-4 [mask-image:linear-gradient(90deg,#000_86%,transparent)] sm:mx-0 sm:px-0 md:[mask-image:none]',
        size === 'lg' ? 'gap-x-6 md:gap-x-9' : 'gap-x-5',
        className,
      )}
    >
      {vehicles.map((v) => {
        const selected = v === value;
        return (
          <button
            key={v}
            ref={(el) => {
              if (el) refs.current.set(v, el);
            }}
            type="button"
            role="tab"
            id={`${idBase}-${v}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(v)}
            className={cn(
              'relative shrink-0 whitespace-nowrap pb-3 pt-1 font-display font-semibold transition-colors',
              size === 'lg' ? 'text-[22px] md:text-[26px]' : 'text-[18px]',
              selected ? 'text-strong' : 'text-slate2 hover:text-ink',
            )}
          >
            {t(vehicleKey(v, 'short'))}
            {selected && (
              <motion.span
                layoutId={`${idBase}-line`}
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-amber"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
