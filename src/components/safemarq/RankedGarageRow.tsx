import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Trophy } from 'lucide-react';
import ScoreSeal from './ScoreSeal';
import { fadeUp, cardHover } from './motion';
import type { RankedGarage } from '@/lib/ranking';
import { getCity } from '@/lib/cities';

interface Props {
  garage: RankedGarage;
  citySlug: string;
}

export default function RankedGarageRow({ garage, citySlug }: Props) {
  const isTop = garage.rank === 1;
  const cityName = getCity(citySlug)?.name ?? '';

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={cardHover}
      className={`relative bg-card border rounded-xl p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center shadow-sm hover:shadow-md ${isTop ? 'border-amber/70 ring-1 ring-amber/30' : 'hairline'}`}
    >
      {isTop && (
        <span className="absolute -top-3 left-5 inline-flex items-center gap-1.5 bg-amber text-amber-d text-[11px] font-semibold px-2.5 py-1 rounded-full">
          <Trophy className="w-3 h-3" /> Meilleur choix à {cityName}
        </span>
      )}

      <div className="flex items-center gap-4 shrink-0">
        <div className="font-display text-4xl md:text-5xl text-slate2 num w-12 text-center" aria-label={`Rang ${garage.rank}`}>
          #{garage.rank}
        </div>
        <ScoreSeal score={garage.score} size={88} compact />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display text-xl md:text-2xl text-ink font-semibold leading-tight">
          {garage.name}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate1">
          <span className="inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber text-amber" />
            <span className="text-ink font-semibold num">{garage.rating.toFixed(1)}</span>
            <span>({garage.reviews.toLocaleString('fr-BE')} avis)</span>
          </span>
          <span>·</span>
          <span>{cityName}</span>
          {garage.verified && (<><span>·</span><span className="text-teal font-medium">Vérifié</span></>)}
        </div>
        {garage.quote && (
          <p className="mt-3 text-sm text-slate1 italic leading-relaxed line-clamp-2">
            « {garage.quote} »
          </p>
        )}
      </div>

      <div className="flex md:flex-col gap-2 md:items-end shrink-0">
        <Link
          to={`/garage/${garage.slug}`}
          className="text-xs font-semibold text-ink border hairline px-3 py-2 rounded-lg hover:border-ink/40 bg-card"
        >
          Voir la fiche
        </Link>
        <Link
          to={`/garage/${garage.slug}#devis`}
          className="btn-amber text-xs inline-flex items-center gap-1"
        >
          Demander un devis <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.article>
  );
}
