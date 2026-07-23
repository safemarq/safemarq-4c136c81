import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Search as SearchIcon } from 'lucide-react';
import Seo from '@/components/Seo';
import SafemarqHeader from '@/components/safemarq/SafemarqHeader';
import SafemarqFooter from '@/components/safemarq/SafemarqFooter';
import RankedGarageRow from '@/components/safemarq/RankedGarageRow';
import TradeCityFilterBar from '@/components/safemarq/TradeCityFilterBar';
import EmptyState from '@/components/EmptyState';
import { useGarages } from '@/hooks/useGarages';
import { getTrade, TRADE_SLUGS } from '@/lib/trades';
import { getCity, CITY_SLUGS } from '@/lib/cities';
import { filterAndRank } from '@/lib/ranking';
import { staggerParent, fadeUp, inViewProps } from '@/components/safemarq/motion';

const TradeCity = () => {
  const { trade: tradeSlug, city: citySlug } = useParams<{ trade: string; city: string }>();

  // Strict allow-list to avoid capturing unrelated 2-segment URLs.
  if (!tradeSlug || !citySlug || !TRADE_SLUGS.includes(tradeSlug) || !CITY_SLUGS.includes(citySlug)) {
    return <Navigate to="/404" replace />;
  }

  const trade = getTrade(tradeSlug)!;
  const city = getCity(citySlug)!;
  const { data: garages, isLoading } = useGarages();
  const ranked = garages ? filterAndRank(garages, tradeSlug, citySlug) : [];

  const title = `Les meilleurs ${trade.labelPlural} à ${city.name}`;
  const description = `Classement indépendant des ${trade.labelPlural} à ${city.name} basé sur les avis Google vérifiés et le score SafeMarq. ${ranked.length} établissement${ranked.length > 1 ? 's' : ''} comparé${ranked.length > 1 ? 's' : ''}.`;

  const jsonLd = ranked.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: title,
        itemListElement: ranked.slice(0, 20).map((g) => ({
          '@type': 'ListItem',
          position: g.rank,
          name: g.name,
          url: `https://safemarq.com/garage/${g.slug}`,
        })),
      }
    : undefined;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Seo title={`${title} — SafeMarq`} description={description} jsonLd={jsonLd} />
      <SafemarqHeader />

      <main>
        <section className="container-editorial pt-10 md:pt-14 pb-8">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'ariane" className="text-xs text-slate1 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-ink">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{trade.label}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink font-medium">{city.name}</span>
          </nav>

          <motion.p variants={fadeUp} initial="hidden" animate="show" className="eyebrow mt-6">
            Classement indépendant · {city.province}
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.05 }}
            className="font-display text-ink mt-3 leading-[1.05]"
            style={{ fontSize: 'clamp(2rem, 4.6vw, 3.6rem)', fontWeight: 500 }}
          >
            Les meilleurs <em className="italic text-navy-900">{trade.labelPlural}</em><br /> à {city.name}.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg text-slate1 max-w-2xl leading-relaxed"
          >
            Classés selon les avis Google vérifiés et le score SafeMarq.{' '}
            <span className="text-ink font-semibold num">{ranked.length}</span> établissement{ranked.length > 1 ? 's' : ''} comparé{ranked.length > 1 ? 's' : ''}.
          </motion.p>

          <div className="mt-8">
            <TradeCityFilterBar trade={tradeSlug} city={citySlug} />
          </div>
        </section>

        {/* Ranked list */}
        <section className="container-editorial pb-16">
          {isLoading ? (
            <div className="py-20 text-center text-slate1 text-sm">Chargement du classement…</div>
          ) : ranked.length === 0 ? (
            <div className="bg-white border hairline rounded-2xl">
              <EmptyState
                icon={SearchIcon}
                title={`Aucun ${trade.label.toLowerCase()} noté à ${city.name} pour l'instant`}
                description="Les fiches vérifiées arrivent. Essayez une autre ville ou un autre métier ci-dessus."
              />
            </div>
          ) : (
            <motion.div
              variants={staggerParent}
              {...inViewProps}
              className="flex flex-col gap-4 md:gap-5"
            >
              {ranked.map((g) => (
                <RankedGarageRow key={g.id} garage={g} citySlug={citySlug} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Editorial SEO block */}
        <section className="border-t hairline bg-white/60">
          <div className="container-editorial py-14 md:py-20 grid md:grid-cols-[1.2fr_1fr] gap-12">
            <div>
              <p className="eyebrow">Guide SafeMarq</p>
              <h2 className="font-display text-3xl md:text-4xl text-ink mt-3 leading-tight" style={{ fontWeight: 500 }}>
                Comment choisir un{trade.label.toLowerCase().match(/^[aeiouéèêh]/) ? "n" : ""} {trade.label.toLowerCase()} à {city.name}
              </h2>
              <div className="prose prose-sm mt-6 text-slate1 leading-relaxed space-y-4 max-w-xl">
                <p>
                  À {city.name}, la qualité d'un{trade.label.toLowerCase().match(/^[aeiouéèêh]/) ? "" : ""} bon prestataire se lit d'abord dans le volume et la constance de ses avis. Un score de 4,3/5 sur 400 avis pèse davantage qu'un 4,9/5 sur 12 avis.
                </p>
                <p>
                  SafeMarq combine la note moyenne Google (60%) et le volume d'avis (40%, échelle logarithmique) pour éviter les biais des jeunes fiches sur-notées. Aucun garage ne peut payer pour améliorer son rang.
                </p>
                <p>
                  Vérifiez toujours que le devis détaille la main-d'œuvre, les pièces et la TVA. Un professionnel sérieux à {city.name} vous remet un ordre de réparation écrit avant toute intervention.
                </p>
              </div>
            </div>

            <div>
              <p className="eyebrow">FAQ</p>
              <div className="mt-6 space-y-5">
                {[
                  {
                    q: `Comment sont classés les ${trade.labelPlural} à ${city.name} ?`,
                    a: `Par score SafeMarq décroissant : 60% de la note moyenne, 40% du volume d'avis (log). Aucun paiement possible.`,
                  },
                  {
                    q: `Les avis sont-ils vérifiés ?`,
                    a: `Nous agrégeons uniquement les avis Google publics des fiches concernées à ${city.name}.`,
                  },
                  {
                    q: `Puis-je demander un devis directement ?`,
                    a: `Oui — le bouton "Demander un devis" transmet votre demande au garage choisi, sans intermédiaire.`,
                  },
                ].map((f) => (
                  <details key={f.q} className="group border hairline rounded-lg bg-white p-4 open:shadow-sm">
                    <summary className="cursor-pointer text-sm font-semibold text-ink flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber" /> {f.q}
                    </summary>
                    <p className="text-sm text-slate1 mt-3 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SafemarqFooter />
    </div>
  );
};

export default TradeCity;
