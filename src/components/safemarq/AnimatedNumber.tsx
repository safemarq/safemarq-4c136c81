import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from './motion';

interface Props {
  value: number;
  duration?: number;
  format?: (v: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedNumber({ value, duration = 1.4, format, className, prefix = '', suffix = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const ctrl = animate(0, value, {
      duration, ease: EASE,
      onUpdate: (x) => setV(Math.round(x)),
    });
    return () => ctrl.stop();
  }, [inView, value, duration, reduce]);

  const formatted = format ? format(v) : v.toLocaleString('fr-BE').replace(/\s/g, '\u202F');
  return <span ref={ref} className={`num ${className ?? ''}`}>{prefix}{formatted}{suffix}</span>;
}
