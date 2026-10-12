import { useState } from 'react';
import { Search, ExternalLink, BadgeCheck, BadgeX, Pencil, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAdminGarages, useToggleGarageVerified, useUpdateGarage, type AdminGarage } from '@/hooks/useAdmin';

const EditGarageDialog = ({ garage, onClose }: { garage: AdminGarage; onClose: () => void }) => {
  const [name, setName] = useState(garage.name);
  const [address, setAddress] = useState(garage.address);
  const [phone, setPhone] = useState(garage.phone ?? '');
  const updateMutation = useUpdateGarage();

  const save = () => {
    updateMutation.mutate(
      { garageId: garage.id, data: { name, address, phone: phone || null } },
      { onSuccess: onClose },
    );
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Modifier le garage</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nom</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adresse</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Téléphone</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
        <Button size="sm" onClick={save} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const GarageRow = ({ garage }: { garage: AdminGarage }) => {
  const [editOpen, setEditOpen] = useState(false);
  const toggleVerified = useToggleGarageVerified();

  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{garage.name}</span>
            {garage.verified && (
              <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">Vérifié</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{garage.address}</p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>★ {garage.rating.toFixed(1)}</span>
            <span>{garage.reviews_count} avis</span>
            <span className="capitalize">{garage.type}</span>
            <span>{garage.price_level}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={() => setEditOpen(true)}
            title="Modifier"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={`w-7 h-7 ${garage.verified ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
            onClick={() => toggleVerified.mutate({ garageId: garage.id, verified: !garage.verified })}
            title={garage.verified ? 'Retirer la vérification' : 'Marquer comme vérifié'}
            disabled={toggleVerified.isPending}
          >
            {garage.verified ? <BadgeX className="w-3.5 h-3.5" /> : <BadgeCheck className="w-3.5 h-3.5" />}
          </Button>
          <Link to={`/garage/${garage.slug}`} target="_blank" rel="noopener noreferrer">
            <Button size="icon" variant="ghost" className="w-7 h-7 text-muted-foreground hover:text-foreground" title="Voir la fiche">
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {editOpen && <EditGarageDialog garage={garage} onClose={() => setEditOpen(false)} />}
      </Dialog>
    </div>
  );
};

const AdminGarages = () => {
  const [search, setSearch] = useState('');
  const { data: garages = [], isLoading } = useAdminGarages();

  const filtered = garages.filter(g => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.address.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border focus-within:border-primary/50 transition-colors">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Rechercher par nom ou ville..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{filtered.length} garage{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun garage trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(garage => <GarageRow key={garage.id} garage={garage} />)}
        </div>
      )}
    </div>
  );
};

export default AdminGarages;
