import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cardHover, fadeUp, inViewProps, staggerParent } from './motion';

const REGIONS = [
  { name: 'Bruxelles-Capitale', count: 1240, avg: 4.3, cities: ['Bruxelles', 'Ixelles', 'Schaerbeek', 'Anderlecht'], hue: 'from-amber/20 to-transparent' },
  { name: 'Wallonie', count: 3180, avg: 4.5, cities: ['Liège', 'Namur', 'Charleroi', 'Mons'], hue: 'from-teal/20 to-transparent' },
  { name: 'Flandre', count: 4000, avg: 4.4, cities: ['Anvers', 'Gand', 'Bruges', 'Louvain'], hue: 'from-navy-900/15 to-transparent' },
] as const;

export default function RegionsBlock() {
  const navigate = useNavigate();
  return (
    <section className="bg-paper">
      <motion.div variants={staggerParent} {...inViewProps} className="container-editorial py-16 md:py-24">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <motion.p variants={fadeUp} className="eyebrow">Cartographie</motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display text-ink mt-2 max-w-3xl leading-[1.05]"
              style={{ fontSize: 'clamp(1.7rem, 3vw, 2.6rem)', fontWeight: 500 }}
            >
              Trois régions. Trois marchés. <em className="italic">Un seul standard.</em>
            </motion.h2>
          </div>
          <motion.a variants={fadeUp} href="#compare" className="text-sm font-semibold text-ink hover:text-navy-900 inline-flex items-center gap-1">
            Voir toute la carte <ArrowUpRight className="w-4 h-4" />
          </motion.a>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {REGIONS.map((r) => (
            <motion.button
              key={r.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={cardHover}
              onClick={() => navigate(`/?location=${encodeURIComponent(r.name)}`)}
              className="text-left card-warm p-6 relative overflow-hidden hover:shadow-md hover:border-ink/20 group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${r.hue} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-ink text-xl" style={{ fontWeight: 600 }}>{r.name}</h3>
                  <ArrowUpRight className="w-4 h-4 text-slate1 group-hover:text-ink transition-colors" />
                </div>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-display text-ink text-4xl num" style={{ fontWeight: 600 }}>
                    {r.count.toLocaleString('fr-BE').replace(/\s/g, '\u202F')}
                  </span>
                  <span className="text-xs text-slate1">établissements</span>
                </div>
                <div className="mt-1 text-sm text-slate1">Note moyenne <span className="text-ink font-semibold">{r.avg}</span> / 5</div>
                <div className="mt-6 pt-4 border-t hairline flex flex-wrap gap-1.5">
                  {r.cities.map(c => (
                    <span key={c} className="text-[11px] px-2 py-1 rounded-md bg-paper border hairline text-slate1">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
