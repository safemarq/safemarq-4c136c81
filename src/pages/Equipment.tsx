import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs, breadcrumbJsonLd } from '@/components/site/Breadcrumbs';
import { useI18n } from '@/i18n/I18nProvider';
import { EQUIPMENT_KINDS, brandsOfKind } from '@/lib/equipment';
import { toolPath } from '@/lib/links';

/** /outillage: the kinds of workshop equipment, what each changes for the customer, and the brands. */
export default function Equipment() {
  const { t } = useI18n();
  const crumbs = [{ label: t('nav.home'), to: '/' }, { label: t('nav.equipment') }];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title={t('equipment.metaTitle')}
        description={t('equipment.metaDescription')}
        canonical="https://safemarq.com/outillage"
        jsonLd={breadcrumbJsonLd([{ label: t('nav.home'), to: '/' }, { label: t('nav.equipment'), to: '/outillage' }])}
      />
      <SiteHeader overlay />

      <main id="contenu">
        <section className="bg-navy-900 text-chalk">
          <div className="container-editorial pb-12 pt-28 md:pb-16 md:pt-36">
            <Breadcrumbs items={crumbs} onDark />
            <h1 className="mt-5 max-w-[16ch] text-[44px] font-semibold leading-[1.02] text-chalk md:text-[72px]">{t('equipment.title')}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-chalk/75">{t('equipment.lead')}</p>
            <nav aria-label={t('equipment.title')} className="mt-8">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {EQUIPMENT_KINDS.map((k) => (
                  <li key={k}>
                    <a href={`#${k}`} className="text-[16px] font-semibold text-chalk/85 underline-offset-4 hover:text-chalk hover:underline">
                      {t(`equipment.kinds.${k}.label`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        <div className="container-editorial py-6 md:py-10">
          {EQUIPMENT_KINDS.map((k) => (
            <section
              key={k}
              id={k}
              aria-labelledby={`${k}-title`}
              className="grid scroll-mt-24 gap-4 border-b border-line py-9 last:border-b-0 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-12 md:py-12"
            >
              <h2 id={`${k}-title`} className="text-[30px] font-semibold leading-tight text-strong md:text-[36px]">
                {t(`equipment.kinds.${k}.label`)}
              </h2>
              <div>
                <p className="max-w-[62ch] text-[17px] leading-relaxed text-slate1">{t(`equipment.kinds.${k}.body`)}</p>
                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {brandsOfKind(k).map((b) => (
                    <li key={b.slug}>
                      <Link to={toolPath(b.slug)} className="font-display text-[24px] font-semibold text-strong underline-offset-[5px] hover:underline">
                        {b.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        <section className="border-t border-line bg-paper-2">
          <div className="container-editorial flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between md:py-12">
            <p className="max-w-xl text-[17px] text-slate1">{t('makes.lead')}</p>
            <Link to="/marques" className="btn-ghost-navy min-h-[48px] self-start px-5 md:self-auto">
              {t('equipment.makesLink')}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
