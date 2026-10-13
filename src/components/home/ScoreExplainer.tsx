import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { scoreGrade } from '@/components/site/ScoreBadge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { calculateSAFEMARQScore } from '@/hooks/useGarages';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';
import { Odometer } from './Odometer';

// The review slider is logarithmic: 1, 10, 100 and 1 000 reviews sit at even distances.
const MAX_REVIEWS = 2000;
const LOG_MAX = Math.log10(MAX_REVIEWS + 1);
const toReviews = (pos: number) => Math.round(10 ** ((pos / 1000) * LOG_MAX) - 1);
const toPos = (reviews: number) => (Math.log10(reviews + 1) / LOG_MAX) * 1000;
const REVIEW_TICKS = [1, 10, 100, 500, 2000];
const CAP = 500;

const PRESETS = [
  { rating: 4.9, reviews: 8 },
  { rating: 4.6, reviews: 312 },
] as const;

/**
 * "A ranking that cannot be bought": instead of quoting the formula, the
 * visitor moves the rating and the number of reviews and watches the score.
 */
export function ScoreExplainer() {
  const { t, tp, formatNumber } = useI18n();
  const [rating, setRating] = useState(4.6);
  const [reviews, setReviews] = useState(312);

  const score = calculateSAFEMARQScore(rating, reviews);
  const ratingPart = (rating / 5) * 60;
  const reviewsPart = Math.min(Math.log10(reviews + 1) / Math.log10(CAP + 1), 1) * 40;
  const grade = t(`score.grades.${scoreGrade(score)}`);
  // Announce the result once the hand stops, not at every step of the slider.
  const spoken = useDebouncedValue(t('score.aria', { score, grade }), 500);

  const one = (n: number) => formatNumber(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <section aria-labelledby="score-title" className="bg-navy-900 text-chalk dark:border-y dark:border-line">
      <div className="container-editorial grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
        <div>
          <h2 id="score-title" className="text-[34px] font-bold text-chalk md:text-5xl">
            {t('home.scoreTitle')}
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-chalk/75">{t('home.scoreLead')}</p>
          <p className="mt-8 max-w-md border-l-2 border-amber pl-4 text-[17px] font-medium leading-relaxed text-chalk">{t('home.simMoney')}</p>
          <Link to="/about" className="mt-8 inline-flex min-h-[44px] items-center text-[16px] font-semibold text-amber underline-offset-4 hover:underline">
            {t('home.methodLink')}
          </Link>
        </div>

        <div>
          <Control
            label={t('home.simRating')}
            weight={t('home.simRatingWeight')}
            value={t('home.simRatingText', { rating: one(rating) })}
          >
            <Slider
              value={rating}
              min={1}
              max={5}
              step={0.1}
              onChange={(v) => setRating(Math.round(v * 10) / 10)}
              label={t('home.simRating')}
              valueText={t('home.simRatingText', { rating: one(rating) })}
            />
            <Ticks marks={[1, 2, 3, 4, 5].map((r) => ({ at: ((r - 1) / 4) * 100, label: formatNumber(r) }))} />
          </Control>

          <Control label={t('home.simReviews')} weight={t('home.simReviewsWeight')} value={tp('home.simReviewsText', reviews)} className="mt-10">
            <Slider
              value={toPos(reviews)}
              min={0}
              max={1000}
              step={1}
              onChange={(p) => setReviews(toReviews(p))}
              label={t('home.simReviews')}
              valueText={tp('home.simReviewsText', reviews)}
            />
            <Ticks
              marks={REVIEW_TICKS.map((n) => ({
                at: toPos(n) / 10,
                label: formatNumber(n),
                note: n === CAP ? t('home.simCap') : undefined,
              }))}
            />
          </Control>

          {/* The result, as a sum: what the rating brings, what the reviews bring, the score. */}
          <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-4 border-t border-chalk/15 pt-8 sm:gap-x-5 md:gap-x-7">
            <Part value={one(ratingPart)} label={t('home.simPartRating')} />
            <span aria-hidden className="font-display text-2xl text-chalk/40 sm:text-3xl">+</span>
            <Part value={one(reviewsPart)} label={t('home.simPartReviews')} />
            {/* "= score" stays together: on a phone it moves to its own line as one piece. */}
            <span className="flex items-center gap-x-3 sm:gap-x-5 md:gap-x-7">
              <span aria-hidden className="font-display text-2xl text-chalk/40 sm:text-3xl">=</span>
              <span
                aria-hidden
                className="relative grid h-[80px] w-[80px] place-items-center rounded-md bg-navy-900 font-display text-[42px] font-bold text-chalk ring-1 ring-inset ring-chalk/30 sm:h-[88px] sm:w-[88px] sm:text-[46px] md:h-[104px] md:w-[104px] md:text-[54px]"
              >
                <Odometer value={score} />
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-br-md bg-amber md:h-4 md:w-4" />
              </span>
              <span aria-hidden className="leading-tight">
                <span className="block font-display text-[22px] font-semibold text-chalk">{grade}</span>
                <span className="block text-[14px] text-chalk/65">{t('score.label')}</span>
              </span>
            </span>
            <p aria-live="polite" className="sr-only">
              {spoken}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]">
            <span className="text-chalk/65">{t('home.simCompare')}</span>
            {PRESETS.map((p) => {
              const active = p.rating === rating && p.reviews === reviews;
              return (
                <button
                  key={p.reviews}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setRating(p.rating);
                    setReviews(p.reviews);
                  }}
                  className={cn(
                    'min-h-[44px] font-semibold underline decoration-chalk/30 underline-offset-4 transition-colors hover:decoration-amber',
                    active ? 'text-amber decoration-amber' : 'text-chalk',
                  )}
                >
                  {t('home.simPreset', { rating: one(p.rating), count: formatNumber(p.reviews) })}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Control({
  label,
  weight,
  value,
  className,
  children,
}: {
  label: string;
  weight: string;
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[17px] font-semibold text-chalk">{label}</p>
          <p className="text-[14px] text-chalk/60">{weight}</p>
        </div>
        <p className="shrink-0 font-display text-[28px] font-semibold leading-none text-chalk num md:text-[32px]">{value}</p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  label,
  valueText,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label: string;
  valueText: string;
}) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
      className="relative flex h-11 w-full touch-none select-none items-center"
    >
      <SliderPrimitive.Track className="relative h-[3px] w-full grow rounded-full bg-chalk/15">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-amber" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={label}
        aria-valuetext={valueText}
        className="block h-6 w-6 cursor-grab rounded-full border-[3px] border-amber bg-chalk shadow-[0_2px_10px_hsl(var(--navy-900)/0.6)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber/40 active:cursor-grabbing"
      />
    </SliderPrimitive.Root>
  );
}

function Ticks({ marks }: { marks: { at: number; label: string; note?: string }[] }) {
  return (
    <div aria-hidden className="relative mx-3 h-9 text-[13px] text-chalk/55 num">
      {marks.map((m) => (
        <span
          key={m.label}
          className={cn('absolute top-0 -translate-x-1/2 whitespace-nowrap text-center leading-tight', m.note && 'text-chalk')}
          style={{ left: `${m.at}%` }}
        >
          {m.label}
          {m.note && <span className="block text-[12px] text-amber">{m.note}</span>}
        </span>
      ))}
    </div>
  );
}

function Part({ value, label }: { value: string; label: string }) {
  return (
    <span className="leading-none">
      <span className="block font-display text-[30px] font-semibold text-chalk num sm:text-[34px] md:text-[40px]">{value}</span>
      <span className="mt-1 block text-[14px] text-chalk/60">{label}</span>
    </span>
  );
}
