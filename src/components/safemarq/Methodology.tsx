import { motion } from 'framer-motion';
import { fadeUp, inViewProps, staggerParent } from './motion';
import ScoreSeal from './ScoreSeal';

const STEPS = [
  {
    n: '01', title: 'Collecte des données publiques',
    body: "Nous agrégeons les avis Google Business, les registres BCE, les données Car-Pass et les rapports de contrôle technique GOCA.",
  },
  {
    n: '02', title: 'Enquête prix indépendante',
    body: "Chaque trimestre, nos enquêteurs demandent des devis anonymes sur 12 opérations standard, dans les trois régions.",
  },
  {
    n: '03', title: 'Score pondéré et transparent',
    body: "Note Google (40%), volume d'avis vérifiés (20%), écart de prix vs médiane (25%), délai de RDV (15%). Formule publiée.",
  },
];

export default function Methodology() {
  return (
    <section id="method" className="bg-navy-900 text-paper">
      <motion.div variants={staggerParent} {...inViewProps} className="container-editorial py-16 md:py-24">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-14 items-start">
          <div>
            <motion.p variants={fadeUp} className="eyebrow" style={{ color: 'hsl(var(--amber))' }}>Méthodologie</motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-display mt-3 leading-[1.05]"
              style={{ fontSize: 'clamp(1.9rem, 3.6vw, 3rem)', fontWeight: 500 }}
            >
              Notre score, <em className="italic text-amber">on l'explique.</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate2 mt-4 max-w-xl">
              Aucun garage ne peut acheter un meilleur score. Aucun logo sponsorisé. Nous publions la formule
              et le code de calcul.
            </motion.p>

            <div className="mt-10 space-y-6">
              {STEPS.map((s) => (
                <motion.div key={s.n} variants={fadeUp} className="flex gap-5 border-t border-white/10 pt-6">
                  <span className="font-display text-amber text-3xl num" style={{ fontWeight: 600 }}>{s.n}</span>
                  <div>
                    <h3 className="font-display text-paper text-xl" style={{ fontWeight: 600 }}>{s.title}</h3>
                    <p className="text-slate2 text-sm mt-2 max-w-lg leading-relaxed">{s.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div variants={fadeUp} className="flex justify-center">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur">
              <ScoreSeal score={72} grade="Bien · B+" size={220} label="Exemple pondéré" />
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-xs text-slate2">
                {[
                  ['Note Google', '4,2 / 5', '40%'],
                  ['Avis vérifiés', '186', '20%'],
                  ['Écart prix', '−12%', '25%'],
                  ['Délai RDV', '2 j', '15%'],
                ].map(([k, v, w]) => (
                  <div key={k} className="flex justify-between">
                    <span>{k}</span>
                    <span className="text-paper num">{v} <span className="text-slate2">· {w}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
