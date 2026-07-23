import { Link } from 'react-router-dom';

const COLS = [
  {
    title: 'Explorer',
    links: [
      ['Garages Bruxelles', '/?location=Bruxelles'],
      ['Garages Liège', '/?location=Liège'],
      ['Garages Anvers', '/?location=Anvers'],
      ['Tous les métiers', '/?service=Mécanique'],
    ],
  },
  {
    title: 'Confiance',
    links: [
      ['Méthodologie du score', '/about'],
      ['Charte anti-fraude', '/legal/terms'],
      ['Comment on gagne notre vie', '/about'],
      ['Contact rédaction', '/about'],
    ],
  },
  {
    title: 'Pour les pros',
    links: [
      ['Revendiquer une fiche', '/pro/claim'],
      ['Outils garagistes', '/pro'],
      ['Tarifs', '/pricing'],
    ],
  },
  {
    title: 'Légal',
    links: [
      ['Mentions légales', '/legal/mentions'],
      ['Confidentialité', '/legal/privacy'],
      ['Cookies', '/legal/cookies'],
      ['CGU', '/legal/terms'],
    ],
  },
] as const;

export default function SafemarqFooter() {
  return (
    <footer className="bg-navy-900 text-paper mt-0">
      <div className="container-editorial pt-16 pb-10">
        <div className="grid lg:grid-cols-[1.4fr_2fr] gap-12">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md bg-amber grid place-items-center text-amber-d font-display text-lg" style={{ fontWeight: 600 }}>S</div>
              <span className="font-display text-paper text-2xl" style={{ fontWeight: 600, letterSpacing: '-0.02em' }}>SafeMarq</span>
            </div>
            <p className="mt-5 text-slate2 max-w-sm leading-relaxed">
              Comparateur indépendant de garages et carrossiers en Belgique. Nous ne vendons pas de réparations.
              Nous vendons la vérité sur les prix.
            </p>
            <p className="mt-6 text-xs text-slate2/70">
              Presse indépendante enregistrée en Belgique. Aucun garage ne finance nos évaluations.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-amber">{c.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map(([l, to]) => (
                    <li key={l}>
                      <Link to={to} className="text-sm text-slate2 hover:text-paper transition-colors">
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate2">
          <p>© {new Date().getFullYear()} SafeMarq · Bruxelles, Belgique</p>
          <p>Fait à la main à Bruxelles · Données mises à jour chaque trimestre</p>
        </div>
      </div>
    </footer>
  );
}
