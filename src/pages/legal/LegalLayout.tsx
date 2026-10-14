import type { ReactNode } from 'react';
import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { useI18n } from '@/i18n/I18nProvider';

interface Props {
  title: string;
  description: string;
  /** Day the text last changed (YYYY-MM-DD). Never "today": a legal text keeps its real date. */
  updated: string;
  children: ReactNode;
}

/** Legal pages (French text): same header and footer as the rest of the site, a readable measure. */
const LegalLayout = ({ title, description, updated, children }: Props) => {
  const { t, formatDate } = useI18n();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo title={title} description={description} />
      <SiteHeader />
      <main id="contenu" className="container-editorial pb-20 pt-8 md:pt-12">
        <div lang="fr" className="mx-auto max-w-[68ch]">
          <Breadcrumbs items={[{ label: t('nav.home'), to: '/' }, { label: title }]} />
          <h1 className="mt-6 text-[38px] font-semibold leading-[1.05] text-strong [text-wrap:balance] md:text-[52px]">{title}</h1>
          <p className="mt-3 text-[15px] text-slate1">
            Dernière mise à jour : <time dateTime={updated}>{formatDate(updated)}</time>
          </p>
          <article
            className="mt-10 space-y-4 text-[17px] leading-[1.7] text-ink [&_a]:font-semibold [&_a]:text-strong [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-[24px] [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:text-strong [&_h3]:mt-6 [&_h3]:text-[18px] [&_h3]:font-semibold [&_h3]:text-ink [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-strong [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ul]:marker:text-strong"
          >
            {children}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default LegalLayout;
