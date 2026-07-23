import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { TRADES } from '@/lib/trades';
import { CITIES } from '@/lib/cities';

interface Props {
  trade: string;
  city: string;
  compact?: boolean;
}

export default function TradeCityFilterBar({ trade, city, compact }: Props) {
  const navigate = useNavigate();
  const [t, setT] = useState(trade);
  const [c, setC] = useState(city);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (t && c) navigate(`/${t}/${c}`);
  };

  return (
    <form
      onSubmit={submit}
      className={`bg-white border hairline rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-sm ${compact ? '' : 'max-w-3xl'}`}
    >
      <div className="flex items-center gap-2 flex-1 px-3 border-b md:border-b-0 md:border-r hairline">
        <Search className="w-4 h-4 text-slate1 shrink-0" aria-hidden />
        <label htmlFor="tcf-trade" className="sr-only">Métier</label>
        <select
          id="tcf-trade"
          value={t}
          onChange={(e) => setT(e.target.value)}
          className="w-full py-2.5 bg-transparent text-sm text-ink focus:outline-none"
        >
          {TRADES.map(tr => <option key={tr.slug} value={tr.slug}>{tr.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2 flex-1 px-3">
        <MapPin className="w-4 h-4 text-slate1 shrink-0" aria-hidden />
        <label htmlFor="tcf-city" className="sr-only">Ville</label>
        <select
          id="tcf-city"
          value={c}
          onChange={(e) => setC(e.target.value)}
          className="w-full py-2.5 bg-transparent text-sm text-ink focus:outline-none"
        >
          {CITIES.map(ci => <option key={ci.slug} value={ci.slug}>{ci.name}</option>)}
        </select>
      </div>
      <button type="submit" className="btn-amber whitespace-nowrap">Mettre à jour</button>
    </form>
  );
}
