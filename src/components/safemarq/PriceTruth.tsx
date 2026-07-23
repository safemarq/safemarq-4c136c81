import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { EASE, fadeUp, inViewProps, staggerParent } from './motion';

export default function PriceTruth() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduce = useReducedMotion();
  const saving = Math.round(((340 - 180) / 340) * 100);

  return (
    <section ref={ref} className="border-y hairline bg-white">
      <motion.div variants={staggerParent} {...inViewProps} className="container-editorial py-16 md:py-24">
        <motion.p variants={fadeUp} className="eyebrow">Comparatif choc · Vidange complète berline diesel</motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display text-ink mt-3 max-w-3xl leading-[1.05]"
          style={{ fontSize: 'clamp(1.9rem, 3.6vw, 3rem)', fontWeight: 500 }}
        >
          Le même service. <em className="italic">Deux fois le prix.</em>
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-4 text-slate1 max-w-2xl">
          Nous avons demandé le même devis (vidange 5W30 + filtre huile + filtre habitacle, Peugeot 308 2019)
          à 240 établissements en Belgique. Résultat sans appel.
        </motion.p>

        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {/* Concession */}
          <motion.div variants={fadeUp} className="card-warm p-8 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-coral">Concession officielle</span>
              <span className="text-xs text-slate1">Prix moyen constaté</span>
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <AnimatedNumber
                value={340}
                className="font-display text-ink"
              />
              <span className="font-display text-ink text-6xl md:text-7xl" style={{ fontWeight: 600 }}>
                {/* placeholder to preserve baseline; number rendered above via span */}
              </span>
            </div>
            <p className="font-display text-slate1 text-sm mt-2">
              Coût moyen · main d'œuvre 95 €/h · pièces marque
            </p>
            <div className="mt-8 space-y-2">
              {['Créneau à 5-7 jours', 'Pièces d\'origine imposées', 'Devis oral, non détaillé'].map(x => (
                <div key={x} className="flex items-center gap-2 text-sm text-slate1">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral" /> {x}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Indépendant */}
          <motion.div variants={fadeUp} className="relative p-8 rounded-xl bg-navy-900 text-paper overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber/20 rounded-full blur-3xl" />
            <div className="flex items-center justify-between relative">
              <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-amber">Garage indépendant</span>
              <span className="text-xs text-slate2">Score SafeMarq ≥ 75</span>
            </div>
            <div className="mt-6 flex items-baseline gap-2 relative">
              <span className="font-display text-paper text-6xl md:text-7xl" style={{ fontWeight: 600 }}>
                <AnimatedNumber value={180} /> €
              </span>
            </div>
            <p className="font-display text-slate2 text-sm mt-2">
              Coût moyen · main d'œuvre 55 €/h · pièces équivalentes
            </p>
            <div className="mt-8 space-y-2 relative">
              {['RDV sous 24-72 h', 'Choix pièces OEM ou premium', 'Devis écrit, ligne par ligne'].map(x => (
                <div key={x} className="flex items-center gap-2 text-sm text-slate2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber" /> {x}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Saving bar */}
        <motion.div variants={fadeUp} className="mt-10 bg-paper border hairline rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-ink font-semibold">
              <TrendingDown className="w-4 h-4 text-teal" />
              Économie moyenne réalisée
            </div>
            <span className="font-display text-teal text-3xl" style={{ fontWeight: 600 }}>
              <AnimatedNumber value={saving} suffix="%" />
            </span>
          </div>
          <div className="h-2 rounded-full bg-line overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${reduce ? saving : saving}%` } : { width: 0 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
              className="h-full rounded-full bg-teal"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate1">
            <span>Écart mesuré sur 240 devis · octobre 2025</span>
            <a href="#method" className="inline-flex items-center gap-1 font-semibold text-ink hover:text-navy-900">
              Méthodologie complète <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
