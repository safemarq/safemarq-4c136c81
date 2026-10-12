import { motion, useMotionValue, useTransform, animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { EASE } from './motion';

interface ScoreSealProps {
  score: number;
  grade?: string;
  size?: number;
  label?: string;
  compact?: boolean;
  /** "onNavy" when the seal sits on a navy band (fixed light text). */
  tone?: 'default' | 'onNavy';
}

function colorFor(score: number) {
  if (score >= 80) return 'hsl(var(--teal))';
  if (score >= 60) return 'hsl(var(--amber))';
  return 'hsl(var(--coral))';
}

export default function ScoreSeal({ score, grade, size = 220, label = 'Score SafeMarq', compact = false, tone = 'default' }: ScoreSealProps) {
  const onNavy = tone === 'onNavy';
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
            fill="none" stroke={onNavy ? 'hsl(var(--chalk) / 0.14)' : 'hsl(var(--line))'} strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} style={{ strokeDashoffset: dash }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display num leading-none ${onNavy ? 'text-chalk' : 'text-ink'}`} style={{ fontSize: size * 0.32, fontWeight: 600 }}>
            {display}
          </span>
          <span className={`mt-1 text-xs font-semibold num ${onNavy ? 'text-chalk/60' : 'text-slate1'}`}>/ 100</span>
        </div>
      </div>
      {!compact && (
        <div className="mt-4 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${onNavy ? 'border-chalk/15 bg-chalk/5' : 'hairline bg-card'}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className={`text-xs font-semibold ${onNavy ? 'text-chalk' : 'text-ink'}`}>{grade ?? 'Évalué'}</span>
          </div>
          <p className={`mt-3 text-[13px] font-semibold ${onNavy ? 'text-chalk/70' : 'text-slate1'}`}>{label}</p>
        </div>
      )}
    </div>
  );
}
