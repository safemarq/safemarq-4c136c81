import { useState } from 'react';

const REGIONS = [
  { id: 'flanders', name: 'Flandre', count: 4120, d: 'M 280 80 L 470 70 L 510 130 L 490 200 L 350 220 L 250 180 Z' },
  { id: 'brussels', name: 'Bruxelles', count: 680, d: 'M 290 195 L 330 195 L 335 220 L 295 220 Z' },
  { id: 'wallonia', name: 'Wallonie', count: 3620, d: 'M 100 220 L 280 200 L 350 230 L 480 230 L 510 290 L 420 360 L 220 360 L 80 290 Z' },
];

const CITIES = [
  { name: 'Bruxelles', count: 680 }, { name: 'Anvers', count: 920 }, { name: 'Liège', count: 540 },
  { name: 'Gand', count: 480 }, { name: 'Charleroi', count: 410 }, { name: 'Namur', count: 290 },
  { name: 'Bruges', count: 260 }, { name: 'Louvain', count: 240 }, { name: 'Mons', count: 220 }, { name: 'Hasselt', count: 200 },
];

export default function TopRegions() {
  const [hover, setHover] = useState<string | null>(null);
  const hovered = REGIONS.find(r => r.id === hover);

  return (
    <section className="bg-card border-b border-[#E5E5E5]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-[#0052CC] font-semibold">Couverture nationale</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F0F0F] mt-1" style={{ fontFamily: "'Source Serif Pro', Georgia, serif" }}>
            Garages référencés par région
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="relative">
            <svg viewBox="0 0 600 400" className="w-full h-auto">
              {REGIONS.map(r => (
                <path
                  key={r.id}
                  d={r.d}
                  fill={hover === r.id ? '#0052CC' : '#E8EEF7'}
                  stroke="#0F0F0F"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-colors"
                  onMouseEnter={() => setHover(r.id)}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
              {REGIONS.map(r => {
                const cx = r.id === 'flanders' ? 380 : r.id === 'brussels' ? 312 : 280;
                const cy = r.id === 'flanders' ? 140 : r.id === 'brussels' ? 210 : 290;
                return (
                  <text
                    key={r.id}
                    x={cx} y={cy}
                    textAnchor="middle"
                    className="pointer-events-none font-semibold text-[14px]"
                    fill={hover === r.id ? '#fff' : '#0F0F0F'}
                  >
                    {r.name}
                  </text>
                );
              })}
            </svg>
            <div className="absolute top-3 right-3 bg-[#0F0F0F] text-white px-3 py-1.5 rounded text-xs font-semibold min-w-[160px] text-center">
              {hovered ? `${hovered.name} : ${hovered.count.toLocaleString('fr-BE')} garages` : 'Survolez une région'}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#0F0F0F] mb-3">Top 10 villes</p>
            <ul className="divide-y divide-[#E5E5E5] border border-[#E5E5E5] rounded-md bg-[#FAFAFA]">
              {CITIES.map((c, i) => (
                <li key={c.name}>
                  <a href="#" className="flex items-center justify-between px-4 py-2.5 hover:bg-card text-sm">
                    <span className="flex items-center gap-3">
                      <span className="text-[#999] font-mono text-xs w-5">{i + 1}</span>
                      <span className="text-[#0F0F0F] font-medium">{c.name}</span>
                    </span>
                    <span className="text-[#666] tabular-nums text-xs">{c.count} garages</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
