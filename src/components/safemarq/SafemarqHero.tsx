import { Search, MapPin, ShieldCheck, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ScoreSeal from './ScoreSeal';
import AnimatedNumber from './AnimatedNumber';
import { EASE, heroStagger, fadeUp } from './motion';

const CHIPS = [
  'Vidange à Bruxelles', 'Carrosserie à Liège', 'Pneus à Anvers',
  'Contrôle technique Wallonie', 'Vitrage à Gand',
];

const SERVICES = [
  'Mécanique générale', 'Carrosserie', 'Pneumatique', 'Vitrage', 'Contrôle technique',
  'Diagnostic', 'Climatisation', 'Échappement', 'Détaillage', 'Dépannage',
];

export default function SafemarqHero({ count = 8420 }: { count?: number }) {
  const navigate = useNavigate();
  const [service, setService] = useState('');
  const [where, setWhere] = useState('');

  const go = (extra?: Partial<{ service: string; location: string }>) => {
    const s = extra?.service ?? service;
    const l = extra?.location ?? where;
    const params = new URLSearchParams();
    if (s) params.set('service', s);
    if (l) params.set('location', l);
    navigate(`/?${params.toString()}#compare`);
  };

  const chipTo = (chip: string) => {
    const [svc, ...rest] = chip.split(' à ');
    if (rest.length) go({ service: svc, location: rest.join(' à ') });
    else go({ service: chip });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Editorial rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-ink/10" />
      <div className="container-editorial pt-14 md:pt-20 pb-16 md:pb-24">
        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-[1.35fr_1fr] gap-14 lg:gap-20 items-center"
        >
          <div>
            <motion.p variants={fadeUp} className="eyebrow">Enquête indépendante · Belgique 🇧🇪</motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-display text-ink mt-4 leading-[1.02]"
              style={{ fontSize: 'clamp(2.4rem, 5.4vw, 4.2rem)', fontWeight: 500 }}
            >
              La vérité sur les prix<br />
              des <em className="italic text-navy-900">garages belges</em>.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-slate1 max-w-xl leading-relaxed">
              <AnimatedNumber value={count} className="text-ink font-semibold" /> établissements passés au crible.
              Prix comparés, avis Google vérifiés, aucun garage ne paie pour mieux se classer.
            </motion.p>

            <motion.form
              variants={fadeUp}
              onSubmit={(e) => { e.preventDefault(); go(); }}
              className="mt-8 bg-white border hairline rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-md max-w-2xl"
            >
              <div className="flex items-center gap-2 flex-1 px-3 border-b md:border-b-0 md:border-r hairline">
                <Search className="w-4 h-4 text-slate1 shrink-0" aria-hidden />
                <label className="sr-only" htmlFor="svc">Service recherché</label>
                <select
                  id="svc"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-ink focus:outline-none"
                >
                  <option value="">Choisir un service</option>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="w-4 h-4 text-slate1 shrink-0" aria-hidden />
                <label className="sr-only" htmlFor="loc">Ville ou code postal</label>
                <input
                  id="loc"
                  type="text"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="Ville ou code postal"
                  className="w-full py-3 bg-transparent text-sm text-ink placeholder:text-slate2 focus:outline-none"
                />
              </div>
              <button type="submit" className="btn-amber whitespace-nowrap">Comparer</button>
            </motion.form>

            <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-2">
              {CHIPS.map(c => (
                <button
                  key={c}
                  onClick={() => chipTo(c)}
                  className="text-xs text-ink border hairline bg-white px-3 py-1.5 rounded-full hover:border-ink/40 hover:bg-white/80 transition-colors"
                >
                  {c}
                </button>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate1">
              <span className="inline-flex items-center gap-1.5"><Flag className="w-3.5 h-3.5 text-teal" /> 100% Belgique</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-teal" /> Aucun garage ne paie pour mieux se classer</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                Données Car-Pass compatibles
              </span>
            </motion.div>
          </div>

          {/* Score Seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-amber/10 blur-3xl -z-10" />
              <div className="bg-white border hairline rounded-2xl p-8 shadow-lg">
                <ScoreSeal score={88} grade="Excellent · A+" size={240} label="Garage Delvaux · Namur" />
                <div className="mt-6 pt-6 border-t hairline grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-display text-ink text-xl num" style={{ fontWeight: 600 }}>4,6</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate1 mt-1">Google</p>
                  </div>
                  <div>
                    <p className="font-display text-teal text-xl num" style={{ fontWeight: 600 }}>−42%</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate1 mt-1">vs concession</p>
                  </div>
                  <div>
                    <p className="font-display text-ink text-xl num" style={{ fontWeight: 600 }}>312</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate1 mt-1">avis</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
