import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Sparkles, ShieldCheck } from 'lucide-react';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGarageOwnership } from '@/hooks/useDashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GarageTier } from '@/hooks/useGarageTier';

interface TierConfig {
  id: GarageTier;
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  highlighted?: boolean;
}

const TIERS: TierConfig[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0€',
    period: 'pour toujours',
    description: "L'essentiel pour être présent sur SafeMarq.",
    features: [
      { text: 'Page garage publique', included: true },
      { text: 'Réponse aux avis clients', included: true },
      { text: 'Réception de demandes de devis', included: true },
      { text: 'Dashboard pro basique', included: true },
      { text: '3 photos maximum', included: true },
      { text: 'Logo personnalisé', included: false },
      { text: 'Page de couverture', included: false },
      { text: 'Vidéo de présentation', included: false },
      { text: 'Page équipe & FAQ', included: false },
    ],
    cta: 'Tier actuel par défaut',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '39€',
    period: '/ mois',
    description: 'Personnalisez votre vitrine et engagez plus de clients.',
    highlighted: true,
    features: [
      { text: 'Tout du tier Free', included: true },
      { text: 'Logo personnalisé', included: true },
      { text: 'Page de couverture (hero image)', included: true },
      { text: "Jusqu'à 20 photos d'atelier", included: true },
      { text: 'Description longue détaillée', included: true },
      { text: 'Liste des services avec tarifs', included: true },
    ],
    cta: 'Passer en Pro',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '99€',
    period: '/ mois',
    description: "L'expérience complète pour concessions et multi-sites.",
    features: [
      { text: 'Tout du tier Pro', included: true },
      { text: 'Vidéo de présentation', included: true },
      { text: 'Page équipe (mécanos & bios)', included: true },
      { text: 'Certifications mises en avant', included: true },
      { text: 'FAQ dédiée', included: true },
      { text: 'Promo banner / offres ponctuelles', included: true },
      { text: 'Multi-établissements', included: true },
      { text: 'Support prioritaire', included: true },
    ],
    cta: 'Passer en Premium',
  },
];

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ownerships = [] } = useGarageOwnership();
  const ownedIds = ownerships.map((o) => o.garage_id);
  // Only the names of the garages this account manages, never the whole table.
  const { data: garages = [] } = useQuery({
    queryKey: ['owned-garage-names', ownedIds],
    enabled: ownedIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from('garages').select('id, name').in('id', ownedIds);
      if (error) throw error;
      return data ?? [];
    },
  });
  const [loading, setLoading] = useState<GarageTier | null>(null);
  const [selectedGarageId, setSelectedGarageId] = useState<string>('');

  const garageMap = new Map(garages.map((g) => [g.id, g]));
  const ownedGarages = ownerships
    .map((o) => ({ garageId: o.garage_id, garage: garageMap.get(o.garage_id) }))
    .filter((o) => o.garage);

  const targetGarageId = selectedGarageId || ownedGarages[0]?.garageId || '';

  const handleSubscribe = async (tier: GarageTier) => {
    if (tier === 'free') return;
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!targetGarageId) {
      toast.error("Vous devez d'abord revendiquer un garage");
      navigate('/pro/inscription');
      return;
    }
    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { garage_id: targetGarageId, tier, origin: window.location.origin },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("URL Stripe manquante");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Tarifs pour les garages"
        description="Pro 39€/mois et Premium 99€/mois. Personnalisez votre fiche : logo, page de couverture, vidéo, équipe."
      />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/pro" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-24 max-w-5xl mx-auto px-4">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-10"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> Tarifs simples
          </span>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground">Choisissez votre offre</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Revendication et dashboard de base restent <strong>gratuits à vie</strong>. Les abonnements payants débloquent des outils de présentation — <strong>jamais</strong> de boost dans le classement.
          </p>
        </motion.section>

        {ownedGarages.length > 1 && (
          <div className="surface-card p-3 mb-6 flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">Pour quel garage ?</span>
            <select
              value={targetGarageId}
              onChange={(e) => setSelectedGarageId(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background"
            >
              {ownedGarages.map((o) => (
                <option key={o.garageId} value={o.garageId}>
                  {o.garage?.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <section className="grid md:grid-cols-3 gap-4 mb-10">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`surface-card p-5 flex flex-col ${
                tier.highlighted ? 'border-primary/40 ring-2 ring-primary/20' : ''
              }`}
            >
              {tier.highlighted && (
                <span className="self-start inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                  <Sparkles className="w-3 h-3" /> Recommandé
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">{tier.description}</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                <span className="text-xs text-muted-foreground">{tier.period}</span>
              </div>
              <ul className="space-y-1.5 mb-5 flex-1">
                {tier.features.map((f, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-xs ${
                      f.included ? 'text-foreground' : 'text-muted-foreground/60 line-through'
                    }`}
                  >
                    {f.included ? (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    )}
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={tier.highlighted ? 'default' : tier.id === 'free' ? 'ghost' : 'outline'}
                disabled={tier.id === 'free' || loading === tier.id}
                onClick={() => handleSubscribe(tier.id)}
              >
                {loading === tier.id ? '...' : tier.cta}
              </Button>
            </motion.div>
          ))}
        </section>

        <section className="surface-card p-5 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Notre engagement</h2>
          </div>
          <ul className="space-y-2 text-xs text-foreground/70">
            <li>✓ <strong>Le score SafeMarq reste objectif</strong> : calculé uniquement à partir de la note Google et du nombre d'avis.</li>
            <li>✓ <strong>Pas de boost de classement payant</strong> : un Premium n'apparaît jamais devant un Free mieux noté.</li>
            <li>✓ <strong>Pas de suppression d'avis</strong> : aucune formule ne permet de cacher des avis négatifs.</li>
            <li>✓ <strong>Annulation à tout moment</strong> : via le portail Stripe accessible depuis le tableau de bord.</li>
          </ul>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Pricing;
