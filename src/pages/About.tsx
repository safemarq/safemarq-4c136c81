import { Link } from 'react-router-dom';
import { BadgeCheck, FileCheck2 } from 'lucide-react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs, breadcrumbJsonLd } from '@/components/site/Breadcrumbs';
import { ScoreExplainer } from '@/components/home/ScoreExplainer';
import { OfficialTag } from '@/components/ranking/GarageRow';
import { useI18n } from '@/i18n/I18nProvider';
import { keepPunctuation } from '@/lib/typography';
import { cn } from '@/lib/utils';

/**
 * /about, "Méthode": how the score is computed (the same formula as the
 * database column garages.safemarq_score), what never moves a garage up, and
 * what the labels on listings mean.
 */
export default function About() {
  const { t } = useI18n();
  const crumbs = [{ label: t('nav.home'), to: '/' }, { label: t('about.crumb') }];

  const ingredients = [
    { points: 60, title: t('about.ratingTitle'), body: t('about.ratingBody') },
    { points: 40, title: t('about.reviewsTitle'), body: t('about.reviewsBody') },
  ];
  const neverCounts = [
    { title: t('about.notMoneyTitle'), body: t('about.notMoneyBody') },
    { title: t('about.notAdsTitle'), body: t('about.notAdsBody') },
    { title: t('about.notOwnReviewsTitle'), body: t('about.notOwnReviewsBody') },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title={t('about.metaTitle')}
        description={t('about.metaDescription')}
        canonical="https://safemarq.com/about"
        jsonLd={breadcrumbJsonLd([
          { label: t('nav.home'), to: '/' },
          { label: t('about.crumb'), to: '/about' },
        ])}
      />
      <SiteHeader />

      <main id="contenu">
        <section className="container-editorial pb-14 pt-8 md:pb-20 md:pt-12">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-6 max-w-[17ch] text-[44px] font-semibold leading-[1.02] text-strong [text-wrap:balance] md:text-[72px]">
            {keepPunctuation(t('about.title'))}
          </h1>
          <p className="mt-5 max-w-[58ch] text-[19px] leading-relaxed text-slate1 md:text-[21px]">{keepPunctuation(t('about.lead'))}</p>

          {/* The two ingredients of the score, weighted as in the formula. */}
          <dl className="mt-12 grid border-t border-line md:mt-16 md:grid-cols-2">
            {ingredients.map((x, i) => (
              <div key={x.points} className={cn('border-b border-line py-7 md:py-9', i === 0 ? 'md:border-r md:pr-10' : 'md:pl-10')}>
                <dt>
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-[64px] font-bold leading-none text-strong num md:text-[80px]">{x.points}</span>
                    <span className="text-[18px] font-semibold text-slate1">{t('about.pointsUnit')}</span>
                  </span>
                  <span className="mt-3 block text-[21px] font-semibold text-ink">{x.title}</span>
                </dt>
                <dd className="mt-2 max-w-[46ch] text-[17px] leading-relaxed text-slate1">{keepPunctuation(x.body)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 max-w-[72ch] text-[15px] leading-relaxed text-slate1">
            <p>{keepPunctuation(t('about.formulaLabel'))}</p>
            <p className="mt-1 font-semibold text-ink">{t('about.formulaExpr')}</p>
            <p className="mt-1">{keepPunctuation(t('about.formulaNote'))}</p>
          </div>
          <p className="mt-6 max-w-[60ch] border-l-2 border-strong pl-4 text-[18px] font-medium leading-relaxed text-ink">{keepPunctuation(t('about.why'))}</p>
        </section>

        <ScoreExplainer methodLink={false} />

        <section className="container-editorial grid gap-14 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <h2 className="text-[30px] font-semibold leading-tight text-strong md:text-[40px]">{keepPunctuation(t('about.notTitle'))}</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {neverCounts.map((x) => (
                <li key={x.title} className="py-5">
                  <p className="text-[18px] font-semibold text-ink">{x.title}</p>
                  <p className="mt-1 text-[16px] leading-relaxed text-slate1">{keepPunctuation(x.body)}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[16px] leading-relaxed text-slate1">{keepPunctuation(t('about.tie'))}</p>
          </div>

          <div>
            <h2 className="text-[30px] font-semibold leading-tight text-strong md:text-[40px]">{keepPunctuation(t('about.marksTitle'))}</h2>
            {/* Each label exactly as it appears on listings and reviews. */}
            <dl className="mt-6 divide-y divide-line border-y border-line">
              <div className="py-5">
                <dt className="inline-flex items-center gap-1.5 text-[16px] font-semibold text-teal">
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  {t('ranking.verified')}
                </dt>
                <dd className="mt-2 text-[16px] leading-relaxed text-slate1">{keepPunctuation(t('about.markVerifiedBody'))}</dd>
              </div>
              <div className="py-5">
                <dt>
                  <OfficialTag label={t('about.markOfficial')} />
                </dt>
                <dd className="mt-2 text-[16px] leading-relaxed text-slate1">{keepPunctuation(t('about.markOfficialBody'))}</dd>
              </div>
              <div className="py-5">
                <dt className="inline-flex items-center gap-1 text-[16px] font-semibold text-teal">
                  <FileCheck2 className="h-4 w-4" aria-hidden />
                  {t('reviews.verified')}
                </dt>
                <dd className="mt-2 text-[16px] leading-relaxed text-slate1">{keepPunctuation(t('about.markInvoiceBody'))}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="container-editorial pb-16 md:pb-24">
          <div className="grid gap-6 border-t border-line pt-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12">
            <div>
              <h2 className="text-[28px] font-semibold leading-tight text-strong md:text-[34px]">{keepPunctuation(t('about.prosTitle'))}</h2>
              <p className="mt-2 max-w-[60ch] text-[17px] leading-relaxed text-slate1">{keepPunctuation(t('about.prosBody'))}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link to="/pro" className="btn-ghost-navy min-h-[48px] px-5">
                {t('footer.proSpace')}
              </Link>
              <Link to="/pricing" className="inline-flex min-h-[44px] items-center text-[16px] font-semibold text-strong underline underline-offset-4 hover:decoration-2">
                {t('footer.businessModel')}
              </Link>
            </div>
          </div>

          <div className="relative mt-14 overflow-hidden rounded-2xl bg-navy-900 p-6 text-chalk md:p-10">
            <span aria-hidden className="absolute bottom-0 right-0 h-5 w-5 bg-amber" />
            <h2 className="text-[28px] font-semibold leading-tight text-chalk md:text-[34px]">{t('blog.ctaTitle')}</h2>
            <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-chalk/75">{keepPunctuation(t('blog.ctaBody'))}</p>
            <Link to="/recherche" className="btn-amber mt-6 min-h-[48px] px-6">
              {t('blog.ctaButton')}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
