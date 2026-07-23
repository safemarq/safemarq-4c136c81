import { motion, useMotionValue, useTransform, animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from './motion';

interface ScoreSealProps {
  score: number;
  grade?: string;
  size?: number;
  label?: string;
  compact?: boolean;
}

function colorFor(score: number) {
  if (score >= 80) return 'hsl(var(--teal))';
  if (score >= 60) return 'hsl(var(--amber))';
  return 'hsl(var(--coral))';
}

export default function ScoreSeal({ score, grade, size = 220, label = 'Score SafeMarq', compact = false }: ScoreSealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const stroke = size * 0.055;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [display, setDisplay] = useState(reduce ? score : 0);
  const dash = useMotionValue(reduce ? c * (1 - score / 100) : c);
  const color = colorFor(score);

  useEffect(() => {
    if (!inView || reduce) return;
    const ctrlNum = animate(0, score, {
      duration: 1.2, ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    const ctrlDash = animate(dash, c * (1 - score / 100), { duration: 1.2, ease: EASE });
    return () => { ctrlNum.stop(); ctrlDash.stop(); };
  }, [inView, score, c, dash, reduce]);

  return (
    <div ref={ref} className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="hsl(var(--line))" strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} style={{ strokeDashoffset: dash }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display num text-ink leading-none" style={{ fontSize: size * 0.32, fontWeight: 600 }}>
            {display}
          </span>
          <span className="text-[10px] tracking-[0.18em] uppercase text-slate1 mt-1 font-semibold">/ 100</span>
        </div>
      </div>
      {!compact && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border hairline bg-white">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-xs font-semibold text-ink">{grade ?? 'Évalué'}</span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate1 mt-3 font-semibold">{label}</p>
        </div>
      )}
    </div>
  );
}
