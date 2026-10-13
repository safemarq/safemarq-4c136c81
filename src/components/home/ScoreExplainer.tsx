import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { ScoreBadge } from '@/components/site/ScoreBadge';
import { calculateSAFEMARQScore } from '@/hooks/useGarages';
import { useI18n } from '@/i18n/I18nProvider';

// Illustration only: the badge below is computed live from these inputs with the real formula.
const EXAMPLE = { rating: 4.6, reviews: 312 };

export function ScoreExplainer() {
  const { t, formatNumber } = useI18n();
  const score = calculateSAFEMARQScore(EXAMPLE.rating, EXAMPLE.reviews);
  const ratingPart = (EXAMPLE.rating / 5) * 100 * 0.6;
  const volumePart = Math.min((Math.log10(EXAMPLE.reviews + 1) / Math.log10(501)) * 100, 100) * 0.4;

  const parts = [
    { pct: 60, label: t('home.scoreRating'), hint: t('home.scoreRatingHint') },
    { pct: 40, label: t('home.scoreVolume'), hint: t('home.scoreVolumeHint') },
    { pct: 0, label: t('home.scoreMoney'), hint: t('home.scoreMoneyHint') },
  ];

  return (
    <section aria-labelledby="score-title" className="bg-navy-900 text-chalk dark:border-y dark:border-line">
      <div className="container-editorial grid gap-12 py-16 md:py-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-16">
        <div>
          <h2 id="score-title" className="max-w-[16ch] text-[34px] font-bold text-chalk md:text-5xl">
            {t('home.scoreTitle')}
          </h2>
          <p className="mt-4 max-w-xl text-lg text-chalk/75">{t('home.scoreLead')}</p>

          <dl className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {parts.map((p) => (
              <div key={p.pct} className="border-t border-chalk/15 pt-5">
                <dt>
                  <span className={`block font-display text-[56px] font-bold leading-none num ${p.pct === 0 ? 'text-chalk' : 'text-amber'}`}>
                    {formatNumber(p.pct)}&nbsp;%
                  </span>
                  <span className="mt-2 block text-[17px] font-semibold text-chalk">{p.label}</span>
                </dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-chalk/70">{p.hint}</dd>
              </div>
            ))}
          </dl>

          <Link to="/about" className="mt-10 inline-flex items-center gap-2 text-[16px] font-semibold text-amber hover:text-chalk">
            {t('home.methodLink')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <figure className="rounded-2xl border border-chalk/15 bg-chalk/[0.04] p-6 md:p-8">
          <figcaption className="text-sm font-semibold text-chalk/70">{t('home.exampleLabel')}</figcaption>
          <p className="mt-3 flex items-center gap-2 text-[17px] text-chalk">
            <Star className="h-5 w-5 fill-amber text-amber" aria-hidden />
            {t('home.exampleInput', {
              rating: formatNumber(EXAMPLE.rating, { minimumFractionDigits: 1 }),
              count: formatNumber(EXAMPLE.reviews),
            })}
          </p>
          <dl className="mt-6 space-y-2 border-y border-chalk/15 py-4 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-chalk/75">{t('home.scoreRating')}</dt>
              <dd className="font-semibold">{formatNumber(ratingPart, { maximumFractionDigits: 1 })} / 60</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-chalk/75">{t('home.scoreVolume')}</dt>
              <dd className="font-semibold">{formatNumber(volumePart, { maximumFractionDigits: 1 })} / 40</dd>
            </div>
          </dl>
          <ScoreBadge score={score} size="lg" onNavy className="mt-6" />
        </figure>
      </div>
    </section>
  );
}
