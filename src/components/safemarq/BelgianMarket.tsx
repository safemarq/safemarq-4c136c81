import { ArrowRight } from 'lucide-react';

const ARTICLES = [
  {
    emoji: '🚗',
    title: 'Car-Pass obligatoire',
    teaser: 'Document légal lors de la revente. Ce que doit contenir un Car-Pass valide et comment le vérifier avant achat.',
    cta: 'Lire l’article',
  },
  {
    emoji: '🏙️',
    title: 'LEZ Bruxelles & Anvers',
    teaser: 'Quels garages adaptent votre véhicule aux zones basses émissions. Filtres, retrofit et contrôles homologués.',
    cta: 'Lire l’article',
  },
  {
    emoji: '⚖️',
    title: 'Garantie légale en Belgique',
    teaser: 'Réparation imparfaite, pièce défectueuse, devis non respecté : vos droits face à un garagiste.',
    cta: 'Lire l’article',
  },
];

export default function BelgianMarket() {
  return (
    <section id="blog" className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-[#0052CC] font-semibold">Spécifique Belgique</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F0F0F] mt-1" style={{ fontFamily: "'Source Serif Pro', Georgia, serif" }}>
            Le marché belge en clair
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {ARTICLES.map(a => (
            <article key={a.title} className="bg-card border border-[#E5E5E5] rounded-md overflow-hidden hover:shadow-sm transition-shadow">
              <div className="aspect-[16/9] bg-gradient-to-br from-[#EEF4FF] to-[#E6F4EC] grid place-items-center text-5xl">
                {a.emoji}
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-[#0F0F0F]" style={{ fontFamily: "'Source Serif Pro', Georgia, serif" }}>
                  {a.title}
                </h3>
                <p className="text-sm text-[#555] mt-1.5 leading-snug">{a.teaser}</p>
                <a href="#" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0052CC] hover:underline">
                  {a.cta} <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
