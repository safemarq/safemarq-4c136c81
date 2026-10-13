import { cn } from '@/lib/utils';

const WHEEL = Array.from({ length: 10 }, (_, n) => n);

/**
 * A number on counter wheels: when it changes, each digit rolls to its new
 * value. Purely visual (aria-hidden): say the value in text next to it.
 */
export function Odometer({ value, className }: { value: number; className?: string }) {
  const digits = String(Math.max(0, Math.round(value))).split('');
  return (
    <span aria-hidden className={cn('inline-flex leading-none num', className)}>
      {digits.map((d, i) => (
        // Keyed from the right, so the units wheel stays the units wheel when 99 becomes 100.
        <span key={digits.length - i} className="relative inline-block h-[1em] w-[1ch] overflow-hidden">
          <span
            className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ transform: `translateY(-${Number(d)}em)` }}
          >
            {WHEEL.map((n) => (
              <span key={n} className="block h-[1em] text-center leading-[1em]">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
