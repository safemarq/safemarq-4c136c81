import { Star } from 'lucide-react';

interface Garage {
  name: string;
  city: string;
  rating: number;
  reviews: number;
  specialty: string;
  excerpt: string;
}

const COLUMNS: { region: string; garages: Garage[] }[] = [
  {
    region: 'Bruxelles',
    garages: [
      { name: 'Garage Van Damme', city: 'Ixelles', rating: 4.9, reviews: 312, specialty: 'Mécanique', excerpt: '« Devis clair, vidange faite en 30 min, prix imbattable. »' },
      { name: 'Carrosserie Plamondon', city: 'Anderlecht', rating: 4.8, reviews: 198, specialty: 'Carrosserie', excerpt: '« Ils ont sauvé ma portière après un parking chaotique. »' },
      { name: 'Pneus Express BXL', city: 'Schaerbeek', rating: 4.7, reviews: 421, specialty: 'Pneumatique', excerpt: '« 4 pneus montés en moins d’une heure, sans rendez-vous. »' },
      { name: 'AutoVitre Brussels', city: 'Etterbeek', rating: 4.6, reviews: 152, specialty: 'Vitrage', excerpt: '« Pare-brise remplacé chez moi le lendemain. Top. »' },
      { name: 'Diag+ Centre', city: 'Bruxelles-Centre', rating: 4.8, reviews: 88, specialty: 'Diagnostic', excerpt: '« Voyant moteur élucidé en 20 min, sans baratin. »' },
    ],
  },
  {
    region: 'Wallonie',
    garages: [
      { name: 'Garage Lefèvre', city: 'Liège', rating: 4.9, reviews: 540, specialty: 'Mécanique', excerpt: '« Honnêteté rare. M’a déconseillé une réparation inutile. »' },
      { name: 'Carrosserie Namuroise', city: 'Namur', rating: 4.7, reviews: 267, specialty: 'Carrosserie', excerpt: '« Peinture impeccable, raccord invisible. »' },
      { name: 'Pneu Center Charleroi', city: 'Charleroi', rating: 4.6, reviews: 389, specialty: 'Pneumatique', excerpt: '« Meilleur prix de la région, conseil au top. »' },
      { name: 'Auto Diag Mons', city: 'Mons', rating: 4.8, reviews: 174, specialty: 'Diagnostic', excerpt: '« Technicien qui prend le temps d’expliquer. »' },
      { name: 'Garage Dupont', city: 'Tournai', rating: 4.5, reviews: 220, specialty: 'Mécanique', excerpt: '« Devis respecté à l’euro près. »' },
    ],
  },
  {
    region: 'Flandre',
    garages: [
      { name: 'Garage Vermeulen', city: 'Anvers', rating: 4.8, reviews: 612, specialty: 'Mécanique', excerpt: '« Snelle service, eerlijke prijs. Aan te raden! »' },
      { name: 'Carrosserie Janssens', city: 'Gand', rating: 4.7, reviews: 343, specialty: 'Carrosserie', excerpt: '« Verzekering papierwerk volledig overgenomen. »' },
      { name: 'Banden Plus Brugge', city: 'Bruges', rating: 4.6, reviews: 281, specialty: 'Pneumatique', excerpt: '« Beste prijs in West-Vlaanderen. »' },
      { name: 'AutoGlass Hasselt', city: 'Hasselt', rating: 4.7, reviews: 195, specialty: 'Vitrage', excerpt: '« Mobiele service aan huis, perfect. »' },
      { name: 'Garage De Smet', city: 'Louvain', rating: 4.9, reviews: 401, specialty: 'Mécanique', excerpt: '« Vakmanschap en transparantie. »' },
    ],
  },
];

function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < Math.round(value) ? 'fill-[#FFB400] text-[#FFB400]' : 'text-[#D4D4D4]'}`}
        />
      ))}
    </span>
  );
}

export default function TopRatedThisWeek() {
  return (
    <section className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#0052CC] font-semibold">Tendances</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F0F0F] mt-1" style={{ fontFamily: "'Source Serif Pro', Georgia, serif" }}>
              Top notés cette semaine
            </h2>
          </div>
          <span className="text-xs text-[#666]">Mis à jour il y a 2 jours</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <div key={col.region} className="bg-card border border-[#E5E5E5] rounded-md">
              <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#F5F5F5] rounded-t-md">
                <p className="text-sm font-semibold text-[#0F0F0F]">{col.region}</p>
              </div>
              <ul className="divide-y divide-[#E5E5E5]">
                {col.garages.map((g, i) => (
                  <li key={g.name} className="px-4 py-3 hover:bg-[#FAFAFA]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F0F0F] truncate">
                          <span className="text-[#999] font-mono mr-1.5">{i + 1}.</span>
                          {g.name}
                        </p>
                        <p className="text-xs text-[#666] mt-0.5">{g.city}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wide font-semibold bg-[#EEF4FF] text-[#0052CC] px-1.5 py-0.5 rounded">
                        {g.specialty}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-[#444]">
                      <StarRow value={g.rating} />
                      <span className="font-semibold text-[#0F0F0F] tabular-nums">{g.rating.toFixed(1)}</span>
                      <span className="text-[#999]">·</span>
                      <span>{g.reviews} avis</span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#555] italic leading-snug line-clamp-2">{g.excerpt}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
