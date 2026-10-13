import type { TradeSlug, VehicleSlug } from './taxonomy';

/**
 * What people actually type, in French, Dutch, German and English, written
 * the way the search folds text: lowercase, no accents, hyphens and
 * apostrophes as spaces. The site's own trade names are added at runtime.
 */

export const VEHICLE_WORDS: Record<VehicleSlug, string[]> = {
  voiture: ['voiture', 'voitures', 'auto', 'autos', 'car', 'cars', 'wagen', 'pkw', 'berline', 'break', 'suv'],
  moto: [
    'moto', 'motos', 'scooter', 'scooters', 'cyclomoteur', 'motor', 'motoren', 'motorfiets', 'brommer', 'bromfiets',
    'motorrad', 'roller', 'motorbike', 'motorcycle', 'motorbikes',
  ],
  utilitaire: [
    'utilitaire', 'utilitaires', 'camionnette', 'camion', 'camions', 'poids lourd', 'poids lourds', 'bestelwagen',
    'bestelwagens', 'bestelbus', 'vrachtwagen', 'vrachtwagens', 'transporter', 'lieferwagen', 'lkw', 'truck', 'trucks', 'lorry',
  ],
  'camping-car': [
    'camping car', 'camping cars', 'campingcar', 'caravane', 'caravanes', 'mobilhome', 'mobil home', 'camper', 'campers',
    'motorhome', 'caravan', 'wohnmobil', 'wohnwagen',
  ],
  velo: [
    'velo', 'velos', 'vae', 'velo electrique', 'speed pedelec', 'fiets', 'fietsen', 'e bike', 'ebike', 'elektrische fiets',
    'fahrrad', 'fahrrader', 'bike', 'bikes', 'bicycle',
  ],
  trottinette: [
    'trottinette', 'trottinettes', 'trotinette', 'trottinette electrique', 'step', 'steps', 'e step', 'elektrische step',
    'e scooter', 'escooter', 'tretroller', 'kick scooter',
  ],
  bateau: [
    'bateau', 'bateaux', 'voilier', 'hors bord', 'jet ski', 'jetski', 'boot', 'boten', 'zeilboot', 'segelboot', 'boat',
    'boats', 'sailboat', 'yacht',
  ],
};

export const TRADE_WORDS: Record<TradeSlug, string[]> = {
  entretien: [
    'entretien', 'revision', 'vidange', 'huile', 'grand entretien', 'petit entretien', 'onderhoud', 'nazicht', 'olie',
    'olie verversen', 'olieverversing', 'groot onderhoud', 'wartung', 'inspektion', 'olwechsel', 'oelwechsel',
    'servicing', 'oil change', 'maintenance', 'tune up',
  ],
  mecanique: [
    'mecanique', 'mecanicien', 'reparation', 'reparer', 'panne moteur', 'mechanica', 'mechanieker', 'herstelling',
    'herstellen', 'reparatie', 'mechanik', 'mechaniker', 'reparatur', 'reparieren', 'repair', 'repairs', 'mechanic',
  ],
  freinage: [
    'frein', 'freins', 'freinage', 'plaquettes', 'plaquette', 'disques', 'disque de frein', 'rem', 'remmen', 'remblokken',
    'remschijven', 'bremse', 'bremsen', 'bremsbelage', 'bremsscheiben', 'brake', 'brakes', 'brake pads',
  ],
  distribution: [
    'distribution', 'courroie', 'courroie de distribution', 'kit distribution', 'distributieriem', 'zahnriemen',
    'steuerkette', 'timing belt', 'cambelt',
  ],
  'embrayage-boite': [
    'embrayage', 'boite', 'boite de vitesse', 'boite de vitesses', 'boite automatique', 'koppeling', 'versnellingsbak',
    'kupplung', 'getriebe', 'clutch', 'gearbox',
  ],
  echappement: [
    'echappement', 'pot d echappement', 'silencieux', 'catalyseur', 'fap', 'filtre a particules', 'uitlaat', 'katalysator',
    'roetfilter', 'auspuff', 'partikelfilter', 'exhaust', 'silencer', 'dpf',
  ],
  suspension: [
    'suspension', 'amortisseur', 'amortisseurs', 'rotule', 'ressort', 'ressorts', 'ophanging', 'schokdemper',
    'schokdempers', 'stuurinrichting', 'fahrwerk', 'stossdampfer', 'lenkung', 'shock absorber', 'shocks', 'steering',
  ],
  'injection-turbo': ['injection', 'injecteur', 'injecteurs', 'turbo', 'vanne egr', 'egr', 'injectie', 'einspritzung', 'turbolader', 'injectors'],
  diagnostic: [
    'diagnostic', 'diagnostique', 'valise', 'voyant', 'voyant moteur', 'diagnose', 'uitlezen', 'foutcode', 'fehlerspeicher',
    'diagnostics', 'warning light', 'check engine', 'obd',
  ],
  electricite: [
    'electricite', 'electricien', 'batterie', 'demarreur', 'alternateur', 'elektriciteit', 'batterij', 'accu', 'startmotor',
    'dynamo', 'elektrik', 'anlasser', 'lichtmaschine', 'battery', 'starter', 'alternator', 'auto electrics',
  ],
  'electrique-hybride': [
    'voiture electrique', 'hybride', 'borne de recharge', 'elektrische auto', 'laadpaal', 'elektroauto', 'hybrid',
    'electric car', 'ev charging',
  ],
  climatisation: ['climatisation', 'clim', 'airco', 'climatiseur', 'aircon', 'klimaanlage', 'klima', 'air conditioning'],
  multimedia: [
    'autoradio', 'multimedia', 'carplay', 'android auto', 'camera de recul', 'navigatie', 'achteruitrijcamera',
    'ruckfahrkamera', 'navi', 'car audio', 'reversing camera',
  ],
  alarme: ['alarme', 'antivol', 'traceur', 'tracker', 'immobiliseur', 'alarm', 'diefstalbeveiliging', 'wegfahrsperre', 'diebstahlschutz', 'immobiliser'],
  cles: [
    'cle', 'cles', 'double de cle', 'cle perdue', 'serrure', 'serrurier', 'sleutel', 'sleutels', 'schlussel', 'schluessel',
    'key', 'keys', 'locksmith', 'key programming',
  ],
  carrosserie: [
    'carrosserie', 'carrossier', 'tolerie', 'sinistre', 'accident', 'bosse', 'carrosseriebedrijf', 'schade', 'ongeval',
    'karosserie', 'unfall', 'unfallschaden', 'bodywork', 'body shop', 'bodyshop', 'panel beater', 'crash',
  ],
  peinture: ['peinture', 'peintre', 'retouche', 'lakwerk', 'spuiten', 'lakken', 'lackierung', 'lackierer', 'paintwork', 'respray', 'paint'],
  debosselage: [
    'debosselage', 'grele', 'debosselage sans peinture', 'uitdeuken', 'hagelschade', 'hagel', 'ausbeulen', 'hagelschaden',
    'paintless dent repair', 'hail damage', 'hail', 'dent', 'deuk', 'delle',
  ],
  'pare-brise': [
    'pare brise', 'parebrise', 'vitrage', 'vitre', 'voorruit', 'autoruit', 'ruit', 'sterretje', 'windschutzscheibe',
    'frontscheibe', 'autoglas', 'steinschlag', 'windscreen', 'windshield', 'car glass',
  ],
  covering: [
    'covering', 'wrapping', 'vitres teintees', 'teintage', 'film solaire', 'ppf', 'folie', 'car wrapping', 'ramen tinten',
    'folierung', 'scheibentonung', 'wrap', 'vinyl wrap', 'window tint', 'tint',
  ],
  detailing: [
    'detailing', 'polissage', 'lustrage', 'ceramique', 'nettoyage', 'poetsen', 'polijsten', 'coating', 'aufbereitung',
    'politur', 'keramik', 'fahrzeugpflege', 'polishing', 'ceramic coating', 'valeting',
  ],
  lavage: ['lavage', 'car wash', 'carwash', 'station de lavage', 'autowas', 'handwas', 'autowasche', 'waschanlage', 'wash'],
  jantes: ['jante', 'jantes', 'renovation jantes', 'velg', 'velgen', 'felge', 'felgen', 'rims', 'alloy wheels', 'rim repair'],
  sellerie: ['sellerie', 'siege', 'sieges', 'cuir', 'garnissage', 'bekleding', 'zetel', 'zetels', 'leder', 'sattlerei', 'polsterung', 'upholstery', 'seats', 'leather'],
  restauration: [
    'restauration', 'ancetre', 'ancetres', 'oldtimer', 'voiture ancienne', 'youngtimer', 'restauratie', 'klassieker',
    'restaurierung', 'classic car', 'classic', 'restoration', 'vintage',
  ],
  etancheite: [
    'etancheite', 'infiltration', 'humidite', 'test d humidite', 'waterdichtheid', 'vochttest', 'dichtheit',
    'feuchtigkeit', 'damp', 'water ingress',
  ],
  carenage: ['carenage', 'antifouling', 'osmose', 'onderwaterschip', 'unterwasserschiff', 'hull cleaning'],
  coque: ['coque', 'reparation coque', 'polyester', 'gelcoat', 'stratification', 'rompherstelling', 'rumpfreparatur', 'gfk', 'fibreglass', 'fiberglass', 'hull repair'],
  pneus: [
    'pneu', 'pneus', 'pneumatique', 'pneus hiver', 'pneus ete', 'equilibrage', 'crevaison', 'band', 'banden', 'winterbanden',
    'zomerbanden', 'lekke band', 'reifen', 'winterreifen', 'reifenwechsel', 'tyre', 'tyres', 'tire', 'tires', 'winter tyres', 'puncture',
  ],
  geometrie: ['geometrie', 'parallelisme', 'alignement', 'uitlijning', 'parallellisme', 'achsvermessung', 'wheel alignment', 'tracking'],
  'controle-technique': [
    'controle technique', 'ct', 'contre visite', 'technische keuring', 'keuring', 'autokeuring', 'herkeuring',
    'technische kontrolle', 'tuv', 'technical inspection', 'roadworthiness', 'vehicle inspection',
  ],
  depannage: [
    'depannage', 'depanneur', 'remorquage', 'remorqueuse', 'pechverhelping', 'pechhulp', 'takelen', 'takeldienst',
    'sleepdienst', 'pannenhilfe', 'abschleppen', 'abschleppdienst', 'breakdown', 'towing', 'tow truck', 'roadside',
  ],
  'preparation-perf': [
    'preparation', 'reprogrammation', 'reprog', 'chiptuning', 'chip tuning', 'tuning', 'stage 1', 'stage 2', 'performance',
    'herprogrammatie', 'leistungssteigerung', 'remap', 'remapping',
  ],
  lpg: ['lpg', 'gpl', 'autogas', 'lpg installatie', 'lpg umrustung'],
  gaz: ['installation gaz', 'bouteille gaz', 'gaz', 'gasinstallatie', 'gasanlage', 'gas installation'],
  voilerie: ['voile', 'voiles', 'voilerie', 'greement', 'taud', 'zeil', 'zeilen', 'zeilmaker', 'tuigage', 'segel', 'segelmacher', 'takelage', 'sails', 'rigging'],
  pieces: ['pieces', 'piece', 'pieces detachees', 'accessoires', 'onderdelen', 'wisselstukken', 'ersatzteile', 'teile', 'zubehor', 'spare parts', 'parts', 'accessories'],
  'pieces-occasion': [
    'pieces d occasion', 'piece d occasion', 'casse', 'casse auto', 'demolition', 'tweedehands onderdelen', 'autosloperij',
    'sloperij', 'gebrauchtteile', 'schrottplatz', 'used parts', 'scrapyard', 'breakers', 'junkyard',
  ],
  hivernage: ['hivernage', 'gardiennage', 'winterstalling', 'stalling', 'winterlager', 'einlagerung', 'winter storage'],
  attelage: ['attelage', 'crochet', 'crochet d attelage', 'trekhaak', 'anhangerkupplung', 'ahk', 'towbar', 'tow bar', 'hitch'],
  amenagement: [
    'amenagement', 'amenagement utilitaire', 'pmr', 'vehicule adapte', 'inrichting', 'ombouw', 'fahrzeugausbau',
    'behindertengerecht', 'van conversion', 'fit out', 'wheelchair',
  ],
  tachygraphe: ['tachygraphe', 'chronotachygraphe', 'tachograaf', 'fahrtschreiber', 'tachograph', 'tacho'],
};

/** "Near me", in the four languages. */
export const NEAR_ME_WORDS = [
  'autour de moi', 'pres de moi', 'pres de chez moi', 'a proximite', 'in de buurt', 'dichtbij', 'bij mij', 'in der nahe',
  'in meiner nahe', 'near me', 'nearby', 'around me',
];

/** Words that carry no meaning for the search ("garage à Namur" = Namur). */
export const STOP_WORDS = [
  'a', 'au', 'aux', 'de', 'des', 'du', 'd', 'l', 'la', 'le', 'les', 'en', 'et', 'pour', 'pres', 'sur', 'mon', 'ma', 'mes',
  'un', 'une', 'chez', 'garage', 'garages', 'garagiste', 'garagistes', 'atelier', 'specialiste', 'specialistes',
  'meilleur', 'meilleurs', 'bon', 'pas cher', 'het', 'een', 'in', 'bij', 'voor', 'mijn', 'beste', 'goedkoop', 'im',
  'fur', 'fuer', 'mein', 'meine', 'der', 'die', 'das', 'und', 'werkstatt', 'werkstatten', 'the', 'for', 'my', 'best',
  'cheap', 'near', 'around', 'at', 'of',
];
