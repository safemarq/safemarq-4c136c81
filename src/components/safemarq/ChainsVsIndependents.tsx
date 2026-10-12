import { ArrowRight, Check, X } from 'lucide-react';

const ROWS = [
  { criterion: 'Note moyenne Google', chains: '3,8 / 5', indep: '4,4 / 5', winner: 'indep' },
  { criterion: 'Prix moyen vidange', chains: '120 – 180 €', indep: '70 – 110 €', winner: 'indep' },
  { criterion: 'Délai moyen RDV', chains: '5 à 7 jours', indep: '1 à 3 jours', winner: 'indep' },
  { criterion: 'Garantie', chains: 'Standardisée, peu négociable', indep: 'Variable, souvent négociable', winner: 'tie' },
  { criterion: 'Transparence du devis', chains: 'Tarif catalogue', indep: 'Devis détaillé écrit', winner: 'indep' },
  { criterion: 'Pièces d’occasion acceptées', chains: 'Rarement', indep: 'Souvent', winner: 'indep' },
  { criterion: 'Présence multi-marques', chains: 'Limitée à l’enseigne', indep: 'Toutes marques', winner: 'indep' },
] as const;

export default function ChainsVsIndependents() {
  return (
    <section className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-[#0052CC] font-semibold">Comparatif vedette</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F0F0F] mt-1" style={{ fontFamily: "'Source Serif Pro', Georgia, serif" }}>
            Petits garages indépendants vs grandes enseignes
          </h2>
          <p className="text-sm text-[#555] mt-2">
            Données agrégées sur 8 420 fiches Belgique — Norauto, Feu Vert, Carglass, Speedy comparés à 6 200 garages indépendants.
          </p>
        </div>

        <div className="overflow-x-auto bg-card border border-[#E5E5E5] rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F5F5F5]">
                <th className="text-left px-4 py-3 font-semibold text-[#0F0F0F]">Critère</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F0F0F]">Grandes enseignes</th>
                <th className="text-left px-4 py-3 font-semibold text-[#0F0F0F]">Garages indépendants</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.criterion} className={i % 2 ? 'bg-[#FAFAFA]' : 'bg-card'}>
                  <td className="px-4 py-3 text-[#0F0F0F] font-medium">{r.criterion}</td>
                  <td className="px-4 py-3 text-[#444]">
                    <span className="inline-flex items-center gap-2">
                      {r.chains}
                      {r.winner === 'indep' && <X className="w-3.5 h-3.5 text-[#C03030]" />}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#0F0F0F] font-semibold">
                    <span className="inline-flex items-center gap-2">
                      {r.indep}
                      {r.winner === 'indep' && <Check className="w-4 h-4 text-[#00875A]" />}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-[#666]">Méthodologie : moyennes pondérées calculées en octobre 2025.</p>
          <a href="#trades" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0052CC] hover:underline">
            Voir le classement complet par métier <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
