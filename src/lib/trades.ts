export interface Trade {
  slug: string;
  label: string;        // singular, used in titles
  labelPlural: string;  // "carrossiers", "pneumaticiens"…
  short: string;        // short category name
  keywords: string[];   // lowercase, for matching
}

export const TRADES: Trade[] = [
  { slug: 'entretien', label: 'Entretien auto', labelPlural: 'garages d\'entretien', short: 'Entretien', keywords: ['entretien', 'vidange', 'révision', 'revision', 'maintenance'] },
  { slug: 'mecanique', label: 'Mécanique générale', labelPlural: 'garages mécaniques', short: 'Mécanique', keywords: ['mécanique', 'mecanique', 'moteur', 'boîte', 'boite', 'embrayage', 'distribution'] },
  { slug: 'carrosserie', label: 'Carrosserie', labelPlural: 'carrossiers', short: 'Carrosserie', keywords: ['carrosserie', 'carrossier', 'débosselage', 'debosselage', 'peinture'] },
  { slug: 'pneus', label: 'Pneumatique', labelPlural: 'pneumaticiens', short: 'Pneus', keywords: ['pneu', 'pneus', 'jante', 'jantes', 'pneumatique'] },
  { slug: 'depannage', label: 'Dépannage', labelPlural: 'dépanneurs', short: 'Dépannage', keywords: ['dépannage', 'depannage', 'remorquage', 'assistance'] },
  { slug: 'detailing', label: 'Detailing', labelPlural: 'ateliers detailing', short: 'Detailing', keywords: ['detailing', 'nettoyage', 'polish', 'polissage', 'lustrage'] },
  { slug: 'preparation-perf', label: 'Préparation & performance', labelPlural: 'préparateurs', short: 'Préparation', keywords: ['préparation', 'preparation', 'tuning', 'chip', 'reprogrammation', 'perf'] },
  { slug: 'pare-brise', label: 'Vitrage & pare-brise', labelPlural: 'spécialistes vitrage', short: 'Pare-brise', keywords: ['vitrage', 'pare-brise', 'pare brise', 'vitre', 'glass'] },
  { slug: 'electricite', label: 'Électricité auto', labelPlural: 'électriciens auto', short: 'Électricité', keywords: ['électricité', 'electricite', 'batterie', 'alternateur', 'démarreur', 'demarreur'] },
  { slug: 'climatisation', label: 'Climatisation', labelPlural: 'spécialistes clim', short: 'Clim', keywords: ['climatisation', 'clim', 'a/c', 'ac'] },
  { slug: 'diagnostic', label: 'Diagnostic électronique', labelPlural: 'diagnosticiens', short: 'Diagnostic', keywords: ['diagnostic', 'obd', 'valise', 'électronique', 'electronique'] },
  { slug: 'controle-technique', label: 'Contrôle technique', labelPlural: 'centres de contrôle technique', short: 'Contrôle tech.', keywords: ['contrôle technique', 'controle technique', 'ct', 'inspection'] },
  { slug: 'pieces', label: 'Pièces détachées', labelPlural: 'fournisseurs de pièces', short: 'Pièces', keywords: ['pièces', 'pieces', 'accessoires', 'shop'] },
];

export const TRADE_SLUGS = TRADES.map(t => t.slug);
export const getTrade = (slug?: string) => TRADES.find(t => t.slug === slug);
