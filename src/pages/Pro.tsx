import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, BadgeCheck, BarChart3, ShieldCheck, Crown } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import Seo from '@/components/Seo';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: BadgeCheck, title: 'Revendication gratuite', text: "Gratuite. Chaque entreprise est vérifiée à la main (numéro BCE, téléphone, email) : personne ne peut gérer votre fiche à votre place." },
  { icon: MessageSquare, title: 'Répondez aux avis', text: "Apportez du contexte, montrez votre professionnalisme et améliorez votre image publique." },
  { icon: FileText, title: 'Recevez des devis qualifiés', text: "Les automobilistes vous contactent avec le détail du besoin, du véhicule et de la plaque." },
  { icon: BarChart3, title: 'Tableau de bord pro', text: "Suivez vos avis, gérez vos demandes par statut, mesurez votre performance." },
  { icon: ShieldCheck, title: 'SafeScore objectif', text: "Le score est calculé uniquement à partir des notes et du volume d'avis. Aucun classement payant." },
  { icon: Crown, title: 'Premium optionnel', text: "Logo, page de couverture, vidéo, équipe : débloqués via Pro ou Premium. Ne change pas votre visibilité dans le classement." },
];

const Pro = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Espace garagistes — Revendiquez votre fiche"
      description="Garagistes : revendiquez gratuitement votre fiche SAFEMARQ, répondez aux avis et débloquez des outils premium."
    />
    <SiteHeader />

    <main id="contenu" className="pt-10 pb-24 md:pb-12 max-w-4xl mx-auto px-4">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 mb-10"
      >
        <h1 className="text-[34px] md:text-5xl leading-[1.05] text-strong">
          Reprenez la main sur votre réputation.
        </h1>
        <p className="text-base text-slate1 max-w-2xl mx-auto leading-relaxed">
          SAFEMARQ aide les automobilistes à choisir un garage en confiance. La revendication et le dashboard de base sont <strong>gratuits</strong>. Des outils premium optionnels (logo, vidéo, équipe) sont disponibles à 39€ ou 99€/mois — sans aucun impact sur le classement.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Link to="/pro/connexion">
            <Button size="lg">Revendiquer ma fiche</Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">Voir les tarifs Pro / Premium</Button>
          </Link>
        </div>
      </motion.section>

      <section className="grid md:grid-cols-2 gap-3 mb-10">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="surface-card p-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-sans text-base font-semibold text-ink mb-1">{f.title}</h3>
            <p className="text-[15px] text-slate1 leading-relaxed">{f.text}</p>
          </motion.div>
        ))}
      </section>

      <section className="surface-card p-5 mb-10">
        <h2 className="text-2xl text-strong mb-4">Comment ça marche</h2>
        <ol className="space-y-3 text-sm text-foreground/80">
          {[
            "Créez votre compte pro (email ou Google).",
            "Indiquez votre numéro d'entreprise (BCE), votre téléphone et votre établissement.",
            "Nous vérifions votre entreprise à la main, sous 2 jours ouvrables.",
            "Accédez à votre tableau de bord pour répondre aux avis et gérer vos demandes.",
            "Optionnel : passez en Pro ou Premium pour enrichir votre page.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="text-[15px] leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="text-center surface-card p-6 bg-primary/5 border-primary/20">
        <h2 className="text-2xl text-strong mb-1">Prêt à commencer ?</h2>
        <p className="text-[15px] text-slate1 mb-4">La revendication est 100% gratuite, sans engagement.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/pro/connexion">
            <Button size="lg">Revendiquer ma fiche</Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline">Voir Pro & Premium</Button>
          </Link>
        </div>
      </section>
    </main>

    <Footer />
    <BottomNav />
  </div>
);

export default Pro;
