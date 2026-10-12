import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { fadeUp, inViewProps, staggerParent } from './motion';

export default function ProSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  return (
    <section id="pro" className="bg-paper">
      <motion.div variants={staggerParent} {...inViewProps} className="container-editorial py-16 md:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 text-chalk p-8 md:p-14">
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div>
              <motion.p variants={fadeUp} className="eyebrow text-chalk/70">Pour les garagistes</motion.p>
              <motion.h2
                variants={fadeUp}
                className="font-display mt-3 leading-[1.05]"
                style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.8rem)', fontWeight: 500 }}
              >
                Vous êtes honnête. <em className="italic text-amber">Prouvez-le.</em>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-chalk/70 mt-4 max-w-xl">
                Revendiquez votre fiche gratuitement. Répondez aux avis, publiez vos tarifs, affichez votre
                score SafeMarq sur votre vitrine.
              </motion.p>
              <motion.ul variants={fadeUp} className="mt-6 space-y-2 text-sm">
                {['Fiche 100% gratuite', 'Certification écrite par nos enquêteurs', 'Badge à afficher en vitrine et sur Google'].map(x => (
                  <li key={x} className="flex items-center gap-2 text-chalk/70">
                    <Check className="w-4 h-4 text-amber" /> {x}
                  </li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/pro/connexion"
                  ref={ref as never}
                  onMouseMove={(e) => {
                    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                  }}
                  className="btn-amber relative overflow-hidden"
                  style={{
                    backgroundImage: `radial-gradient(circle at ${pos.x}% ${pos.y}%, hsl(var(--amber)/0.9), hsl(var(--amber)))`,
                  }}
                >
                  Revendiquer mon garage <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/pro" className="btn-ghost-navy border-white/20 text-chalk hover:bg-white/5">
                  Découvrir les outils pros
                </Link>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
              {[
                ['+38%', 'de demandes de devis en 90 j'],
                ['4,7 ★', 'note moyenne après réponse aux avis'],
                ['12 min', 'temps moyen de revendication'],
                ['0 €', 'inscription et badge de base'],
              ].map(([n, l]) => (
                <div key={n as string} className="border border-white/10 rounded-xl p-5 bg-white/[0.02]">
                  <p className="font-display text-amber text-3xl num" style={{ fontWeight: 600 }}>{n}</p>
                  <p className="text-xs text-chalk/70 mt-1">{l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
