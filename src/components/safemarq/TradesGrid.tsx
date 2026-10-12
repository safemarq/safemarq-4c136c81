import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wrench, Car, CircleDot, Shield, ClipboardCheck, Cpu, Flame, Wind, Zap, Droplets, Truck, Cog } from 'lucide-react';
import { cardHover, fadeUp, inViewProps, staggerParent } from './motion';

const TRADES = [
  { name: 'Mécanique générale', count: 3120, Icon: Wrench },
  { name: 'Carrosserie & peinture', count: 1450, Icon: Car },
  { name: 'Pneumatique', count: 980, Icon: CircleDot },
  { name: 'Vitrage auto', count: 340, Icon: Shield },
  { name: 'Contrôle technique', count: 78, Icon: ClipboardCheck },
  { name: 'Diagnostic électronique', count: 520, Icon: Cpu },
  { name: 'Soudure & échappement', count: 210, Icon: Flame },
  { name: 'Climatisation', count: 620, Icon: Wind },
  { name: 'Électrique / batterie', count: 410, Icon: Zap },
  { name: 'Détaillage', count: 190, Icon: Droplets },
  { name: 'Dépannage / remorquage', count: 260, Icon: Truck },
  { name: 'Boîte de vitesses', count: 150, Icon: Cog },
];

export default function TradesGrid() {
  const navigate = useNavigate();
  return (
    <section id="trades" className="bg-paper">
      <motion.div variants={staggerParent} {...inViewProps} className="container-editorial py-16 md:py-24">
        <motion.p variants={fadeUp} className="eyebrow">Tous les métiers</motion.p>
        <motion.h2
          variants={fadeUp}
          className="font-display text-ink mt-2 max-w-3xl leading-[1.05]"
          style={{ fontSize: 'clamp(1.7rem, 3vw, 2.6rem)', fontWeight: 500 }}
        >
          De la vidange à la boîte de vitesses.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-slate1 mt-3 max-w-2xl">
          On ne se limite pas aux enseignes visibles. SafeMarq recense chaque corps de métier auto en Belgique.
        </motion.p>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TRADES.map(({ name, count, Icon }) => (
            <motion.button
              key={name}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              transition={cardHover}
              onClick={() => navigate(`/?service=${encodeURIComponent(name)}`)}
              className="card-warm p-5 text-left hover:border-ink/20 hover:shadow-md group bg-card"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-md bg-paper border hairline grid place-items-center text-ink group-hover:bg-amber group-hover:text-amber-d group-hover:border-amber transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-slate1 num">{count.toLocaleString('fr-BE').replace(/\s/g, '\u202F')}</span>
              </div>
              <p className="mt-4 font-semibold text-ink text-sm leading-snug">{name}</p>
              <p className="text-xs text-slate1 mt-1">Établissements notés</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
