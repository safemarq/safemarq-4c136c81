import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** A changeable part of the sentence: underlined in amber, opens its picker. */
export const SlotButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & { label: string; drawn: boolean; order: number }
>(function SlotButton({ label, drawn, order, children, className, ...rest }, ref) {
  return (
    // Popover triggers pass their own props (ref, onClick, aria-expanded…): spread them on the button.
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      {...rest}
      className={cn('group relative inline-flex max-w-full rounded-sm text-left align-baseline focus-visible:outline-offset-4', className)}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 -bottom-[0.07em] h-[3px] origin-left rounded-full bg-amber transition-[transform,height] duration-500 ease-out group-hover:h-[5px] md:h-[4px] md:group-hover:h-[6px]',
          drawn ? 'scale-x-100' : 'scale-x-0',
        )}
        style={{ transitionDelay: drawn ? `${order * 90}ms` : '0ms' }}
      />
    </button>
  );
});

/** Text that rolls up when it changes, like a counter wheel: the old word leaves upwards, the new one rises. */
export function Swap({ text, nowrap }: { text: string; nowrap?: boolean }) {
  const [state, setState] = useState({ current: text, previous: null as string | null, turn: 0 });
  // Derived during render, so the new word and the leaving one appear in the same frame.
  if (state.current !== text) setState({ current: text, previous: state.current, turn: state.turn + 1 });
  return (
    // Padding gives accents and descenders room inside the clip; the negative margin keeps the line height.
    <span className="relative -my-[0.12em] inline-grid max-w-full overflow-hidden py-[0.12em]">
      {state.previous !== null && (
        <span
          key={`out-${state.turn}`}
          aria-hidden
          className="sm-roll-out absolute left-0 top-[0.12em] whitespace-nowrap"
          onAnimationEnd={() => setState((s) => (s.turn === state.turn ? { ...s, previous: null } : s))}
        >
          {state.previous}
        </span>
      )}
      <span key={`in-${state.turn}`} className={cn(state.turn > 0 && 'sm-roll-in', nowrap && 'whitespace-nowrap')}>
        {state.current}
      </span>
    </span>
  );
}
