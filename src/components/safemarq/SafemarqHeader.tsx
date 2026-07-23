import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const TRADES = [
  'Mécanique générale', 'Carrosserie & peinture', 'Pneumatique', 'Vitrage auto',
  'Contrôle technique', 'Diagnostic électronique', 'Soudure', 'Climatisation',
  'Échappement', 'Boîte de vitesses', 'Détaillage', 'Dépannage',
];

export default function SafemarqHeader() {
  const [tradesOpen, setTradesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<'FR' | 'NL' | 'EN'>('FR');
  const navigate = useNavigate();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-paper/85 backdrop-blur-xl border-b hairline' : 'bg-paper/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="container-editorial h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 rounded-md bg-navy-900 grid place-items-center overflow-hidden">
            <span className="font-display text-paper text-lg leading-none" style={{ fontWeight: 600 }}>S</span>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-amber" />
          </div>
          <span className="font-display text-ink text-xl leading-none" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
            SafeMarq
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm text-ink">
          <button onClick={() => navigate('/?service=Mécanique')} className="hover:text-navy-900 transition-colors">Garages</button>
          <button onClick={() => navigate('/?service=Carrosserie')} className="hover:text-navy-900 transition-colors">Carrosseries</button>
          <div className="relative">
            <button
              onClick={() => setTradesOpen(v => !v)}
              onBlur={() => setTimeout(() => setTradesOpen(false), 150)}
              className="flex items-center gap-1 hover:text-navy-900 transition-colors"
              aria-expanded={tradesOpen}
            >
              Tous les métiers <ChevronDown className={`w-3.5 h-3.5 transition-transform ${tradesOpen ? 'rotate-180' : ''}`} />
            </button>
            {tradesOpen && (
              <div className="absolute top-full mt-3 left-0 w-80 bg-white border hairline rounded-xl shadow-lg p-2 grid grid-cols-2 gap-0.5 animate-fade-in">
                {TRADES.map(t => (
                  <button
                    key={t}
                    onMouseDown={(e) => { e.preventDefault(); navigate(`/?service=${encodeURIComponent(t)}`); setTradesOpen(false); }}
                    className="text-left px-3 py-2 text-xs hover:bg-paper rounded-md text-ink"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/about" className="hover:text-navy-900 transition-colors">Méthode</Link>
          <Link to="/pro" className="hover:text-navy-900 transition-colors">Pour les pros</Link>
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'FR' | 'NL' | 'EN')}
            aria-label="Langue"
            className="hidden sm:block text-xs bg-transparent border hairline rounded-md px-2 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-amber/40"
          >
            <option value="FR">FR</option>
            <option value="NL">NL</option>
            <option value="EN">EN</option>
          </select>
          <Link
            to="/pro/claim"
            className="hidden md:inline-flex items-center px-3.5 py-2 text-xs font-semibold text-ink border border-ink/20 rounded-lg hover:bg-ink hover:text-paper transition-colors"
          >
            Revendiquer mon garage
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -mr-2 text-ink"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-paper animate-fade-in">
          <div className="container-editorial h-16 flex items-center justify-between">
            <span className="font-display text-ink text-xl" style={{ fontWeight: 600 }}>SafeMarq</span>
            <button onClick={() => setMobileOpen(false)} aria-label="Fermer"><X className="w-6 h-6 text-ink" /></button>
          </div>
          <nav className="container-editorial mt-8 flex flex-col gap-1">
            {[
              { l: 'Garages', to: '/?service=Mécanique' },
              { l: 'Carrosseries', to: '/?service=Carrosserie' },
              { l: 'Tous les métiers', to: '/' },
              { l: 'Méthode', to: '/about' },
              { l: 'Pour les pros', to: '/pro' },
              { l: 'Revendiquer mon garage', to: '/pro/claim' },
            ].map((x) => (
              <button
                key={x.l}
                onClick={() => { navigate(x.to); setMobileOpen(false); }}
                className="text-left font-display text-3xl text-ink py-3 border-b hairline"
                style={{ fontWeight: 500 }}
              >
                {x.l}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
