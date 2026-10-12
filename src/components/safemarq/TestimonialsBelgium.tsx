import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { cardHover, fadeUp, inViewProps, staggerParent } from './motion';

const T = [
  {
    name: 'Julien', city: 'Liège', saving: 220,
    quote: "Ma concession voulait 640 € pour remplacer les plaquettes avant. J'ai trouvé un indé à Herstal via SafeMarq, facturé 420 €. Même pièces Brembo.",
    trade: 'Freinage · BMW Série 3',
  },
  {
    name: 'Sophie', city: 'Gand', saving: 180,
    quote: "J'avais peur de me faire arnaquer sur la carrosserie. Le devis SafeMarq du garage m'a coûté 40 minutes de recherche et m'a évité 180 €.",
    trade: 'Carrosserie · VW Polo',
  },
  {
    name: 'Karim', city: 'Bruxelles', saving: 95,
    quote: "Le score et les vrais avis, ça change tout. J'ai enfin un garage de confiance à côté de chez moi, à Molenbeek.",
    trade: 'Vidange · Peugeot 208',
  },
];

function initials(name: string) { return name.slice(0, 1).toUpperCase(); }

export default function TestimonialsBelgium() {
  return (
    <section className="bg-card border-y hairline">
      <motion.div variants={staggerParent} {...inViewProps} className="container-editorial py-16 md:py-24">
        <motion.p variants={fadeUp} className="eyebrow">Sur le terrain</motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display text-ink mt-2 max-w-3xl leading-[1.05]"
          style={{ fontSize: 'clamp(1.7rem, 3vw, 2.6rem)', fontWeight: 500 }}
        >
          Ce que ça change, concrètement.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {T.map((t) => (
            <motion.article
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={cardHover}
              className="card-warm p-6 hover:border-ink/20 hover:shadow-md flex flex-col"
            >
              <Quote className="w-5 h-5 text-amber" />
              <p className="font-display text-ink text-lg mt-4 leading-snug flex-1" style={{ fontWeight: 500 }}>
                « {t.quote} »
              </p>
              <div className="mt-6 pt-6 border-t hairline flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-900 text-chalk grid place-items-center font-display text-sm" style={{ fontWeight: 600 }}>
                  {initials(t.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{t.name} · {t.city}</p>
                  <p className="text-xs text-slate1">{t.trade}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-teal text-lg num" style={{ fontWeight: 600 }}>−{t.saving} €</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate1">économisés</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
