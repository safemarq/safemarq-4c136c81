import { Search, MapPin, ShieldCheck, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import ScoreSeal from './ScoreSeal';
import AnimatedNumber from './AnimatedNumber';
import { EASE, heroStagger, fadeUp } from './motion';
import { TRADES, getTrade } from '@/lib/trades';
import { CITIES, slugifyCity, getCity } from '@/lib/cities';

const POPULAR: { label: string; trade: string; city: string }[] = [
  { label: 'Carrosserie à Namur', trade: 'carrosserie', city: 'namur' },
  { label: 'Pneus à Liège', trade: 'pneus', city: 'liege' },
  { label: 'Contrôle technique à Charleroi', trade: 'controle-technique', city: 'charleroi' },
  { label: 'Entretien à Bruxelles', trade: 'entretien', city: 'bruxelles' },
  { label: 'Vitrage à Gand', trade: 'pare-brise', city: 'gand' },
];

function resolveCity(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const slug = slugifyCity(raw);
  if (getCity(slug)) return slug;
  const match = CITIES.find(c => c.name.toLowerCase().startsWith(raw.toLowerCase()));
  return match ? match.slug : null;
}

export default function SafemarqHero({ count = 8420 }: { count?: number }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedTrade = getTrade(params.get('metier') ?? undefined)?.slug;
  const [trade, setTrade] = useState(requestedTrade ?? 'carrosserie');
  const cityRef = useRef<HTMLInputElement>(null);

  // Header links land here with ?metier=…: preselect it and ask for the city.
  useEffect(() => {
    if (!requestedTrade) return;
    setTrade(requestedTrade);
    cityRef.current?.focus({ preventScroll: true });
  }, [requestedTrade]);
  const [cityInput, setCityInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const go = (t?: string, c?: string) => {
    const tradeSlug = t ?? trade;
    const citySlug = c ?? resolveCity(cityInput);
    if (!tradeSlug) return setError('Choisissez un métier.');
    if (!citySlug) return setError('Ville inconnue. Essayez Bruxelles, Namur, Liège…');
    setError(null);
    navigate(`/${tradeSlug}/${citySlug}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-ink/10" />
      <div className="container-editorial pt-14 md:pt-20 pb-16 md:pb-24">
        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-[1.35fr_1fr] gap-14 lg:gap-20 items-center"
        >
          <div>
            <motion.p variants={fadeUp} className="eyebrow">Comparateur indépendant · Belgique 🇧🇪</motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-display text-ink mt-4 leading-[1.02]"
              style={{ fontSize: 'clamp(2.4rem, 5.4vw, 4.2rem)', fontWeight: 500 }}
            >
              Les meilleurs garages de Belgique,<br />
              <em className="italic text-strong">notés par ceux qui y sont allés.</em>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-slate1 max-w-xl leading-relaxed">
              <AnimatedNumber value={count} className="text-ink font-semibold" /> établissements passés au crible.
              Choisissez un métier, une ville — on classe pour vous.
            </motion.p>

            <motion.form
              variants={fadeUp}
              id="recherche"
              onSubmit={(e) => { e.preventDefault(); go(); }}
              className="scroll-mt-24 mt-8 bg-card border hairline rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-md max-w-2xl"
            >
              <div className="flex items-center gap-2 flex-1 px-3 border-b md:border-b-0 md:border-r hairline">
                <Search className="w-4 h-4 text-slate1 shrink-0" aria-hidden />
                <label className="sr-only" htmlFor="hero-trade">Quel service ?</label>
                <select
                  id="hero-trade"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-ink focus:outline-none"
                >
                  {TRADES.map(t => <option key={t.slug} value={t.slug}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="w-4 h-4 text-slate1 shrink-0" aria-hidden />
                <label className="sr-only" htmlFor="hero-city">Quelle ville ?</label>
                <input
                  ref={cityRef}
                  id="hero-city"
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Quelle ville ? (Bruxelles, Namur…)"
                  list="hero-city-list"
                  autoComplete="off"
                  className="w-full py-3 bg-transparent text-sm text-ink placeholder:text-slate2 focus:outline-none"
                />
                <datalist id="hero-city-list">
                  {CITIES.map(c => <option key={c.slug} value={c.name} />)}
                </datalist>
              </div>
              <button type="submit" className="btn-amber whitespace-nowrap">Voir le classement</button>
            </motion.form>
            {error && <p className="mt-2 text-xs text-coral" role="alert">{error}</p>}

            <motion.div variants={fadeUp} className="mt-4 flex flex-wrap gap-2">
              {POPULAR.map(p => (
                <button
                  key={p.label}
                  onClick={() => go(p.trade, p.city)}
                  className="text-xs text-ink border hairline bg-card px-3 py-1.5 rounded-full hover:border-ink/40 hover:bg-white/80 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate1">
              <span className="inline-flex items-center gap-1.5"><Flag className="w-3.5 h-3.5 text-teal" /> 100% Belgique</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-teal" /> Avis Google vérifiés</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                Score indépendant · aucun paiement
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-amber/10 blur-3xl -z-10" />
              <div className="bg-card border hairline rounded-2xl p-8 shadow-lg">
                <ScoreSeal score={88} grade="Excellent · A+" size={240} label="Garage Delvaux · Namur" />
                <div className="mt-6 pt-6 border-t hairline grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-display text-ink text-xl num" style={{ fontWeight: 600 }}>4,6</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate1 mt-1">Google</p>
                  </div>
                  <div>
                    <p className="font-display text-teal text-xl num" style={{ fontWeight: 600 }}>#1</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate1 mt-1">à Namur</p>
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

