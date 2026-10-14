import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { useI18n } from '@/i18n/I18nProvider';
import { cityName } from '@/lib/cities';
import { rankingPath, vehicleHref } from '@/lib/links';
import { VEHICLES } from '@/lib/taxonomy';
import { vehicleKey } from '@/i18n/keys';
import { cn } from '@/lib/utils';

const FEATURED_CITIES = ['bruxelles', 'anvers', 'liege', 'namur', 'gand'] as const;

/** Navy band in both themes; text on it uses `chalk`, never `paper`. */
export default function SiteFooter({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  const columns: { title: string; links: { label: string; to: string }[] }[] = [
    {
      title: t('footer.explore'),
      links: FEATURED_CITIES.map((c) => ({
        label: t('footer.cityLink', { city: cityName(c, locale) }),
        to: rankingPath({ vehicle: 'voiture', trade: null, city: c }),
      })),
    },
    {
      title: t('footer.vehicles'),
      links: VEHICLES.filter((v) => v !== 'voiture').map((v) => ({ label: t(vehicleKey(v, 'label')), to: vehicleHref(v) })),
    },
    {
      title: t('footer.resources'),
      links: [
        { label: t('footer.makes'), to: '/marques' },
        { label: t('footer.equipment'), to: '/outillage' },
        { label: t('footer.guides'), to: '/blog' },
        { label: t('footer.scoreMethod'), to: '/about' },
        { label: t('footer.businessModel'), to: '/pricing' },
      ],
    },
    {
      title: t('footer.forPros'),
      links: [
        { label: t('footer.proSpace'), to: '/pro/connexion' },
        { label: t('footer.claim'), to: '/pro' },
        { label: t('footer.pricing'), to: '/pricing' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.terms'), to: '/legal/terms' },
        { label: t('footer.privacy'), to: '/legal/privacy' },
        { label: t('footer.cookies'), to: '/legal/cookies' },
        { label: t('footer.imprint'), to: '/legal/mentions' },
      ],
    },
  ];

  return (
    <footer className={cn('bg-navy-900 text-chalk', className)}>
      <div className="container-editorial pb-28 pt-14 md:pb-12">
        <div className="grid gap-12 lg:grid-cols-[17rem_1fr] xl:grid-cols-[20rem_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark className="ring-1 ring-inset ring-chalk/20" />
              <span className="font-display text-2xl text-chalk" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
                SafeMarq
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-chalk/70">{t('footer.tagline')}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="font-sans text-sm font-semibold text-amber">{col.title}</h2>
                <ul className="mt-3 space-y-0.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="inline-block py-1.5 text-[15px] text-chalk/75 transition-colors hover:text-chalk">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-chalk/10 pt-6 text-sm text-chalk/60 md:flex-row md:justify-between">
          <p>{t('footer.rights', { year })}</p>
          <p>{t('footer.dataCredit')}</p>
        </div>
      </div>
    </footer>
  );
}
