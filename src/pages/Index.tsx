import Seo from '@/components/Seo';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { HomeHero } from '@/components/home/HomeHero';
import { TradeDirectory } from '@/components/home/TradeDirectory';
import { TopRated } from '@/components/home/TopRated';
import { ScoreExplainer } from '@/components/home/ScoreExplainer';
import { CityIndex } from '@/components/home/CityIndex';
import { ProBand } from '@/components/home/ProBand';
import { useLandingStats } from '@/hooks/useLandingStats';
import { useI18n } from '@/i18n/I18nProvider';

const Index = () => {
  const { t } = useI18n();
  const { data: stats } = useLandingStats();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title={t('home.metaTitle')}
        description={t('home.metaDescription')}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'SafeMarq',
          url: 'https://safemarq.com',
          description: t('home.metaDescription'),
          areaServed: 'BE',
        }}
      />
      <SiteHeader overlay />
      <main id="contenu">
        <HomeHero />
        <TradeDirectory />
        <TopRated />
        <ScoreExplainer />
        <CityIndex garageCount={stats?.garages} />
        <ProBand />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
