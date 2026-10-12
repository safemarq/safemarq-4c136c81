import Seo from '@/components/Seo';
import SafemarqHeader from '@/components/safemarq/SafemarqHeader';
import SafemarqHero from '@/components/safemarq/SafemarqHero';
import PriceTruth from '@/components/safemarq/PriceTruth';
import RegionsBlock from '@/components/safemarq/RegionsBlock';
import TestimonialsBelgium from '@/components/safemarq/TestimonialsBelgium';
import TradesGrid from '@/components/safemarq/TradesGrid';
import Methodology from '@/components/safemarq/Methodology';
import ProSection from '@/components/safemarq/ProSection';
import SafemarqFooter from '@/components/safemarq/SafemarqFooter';
import { useLandingStats } from '@/hooks/useLandingStats';

const Index = () => {
  const { data: stats } = useLandingStats();
  const count = stats?.garages && stats.garages > 50 ? stats.garages : 8420;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo
        title="SafeMarq — La vérité sur les prix des garages belges"
        description="8 000+ garages, carrossiers et spécialistes auto comparés en Belgique. Prix transparents, avis Google vérifiés, score indépendant. Aucun garage ne paie pour mieux se classer."
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'SafeMarq',
            url: 'https://safemarq.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://safemarq.com/?service={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'SafeMarq',
            url: 'https://safemarq.com',
            description:
              'Comparateur indépendant de garages et carrossiers en Belgique. Prix transparents, avis vérifiés.',
            areaServed: 'BE',
          },
        ]}
      />
      <SafemarqHeader />
      <main id="contenu">
        <SafemarqHero count={count} />
        <PriceTruth />
        <RegionsBlock />
        <TestimonialsBelgium />
        <TradesGrid />
        <Methodology />
        <ProSection />
      </main>
      <SafemarqFooter />
    </div>
  );
};

export default Index;
