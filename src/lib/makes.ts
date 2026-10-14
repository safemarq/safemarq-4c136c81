import { fold } from './cities';
import type { VehicleSlug } from './taxonomy';

/**
 * Vehicle manufacturers, the source of truth for /marques. The database mirrors
 * the slugs (table makes) so garages can declare the makes they service.
 * Names only, never logos: trademarks are named, not drawn.
 */
export interface Make {
  slug: string;
  name: string;
  /** Kinds of vehicle the make builds (or, for motorhomes, the base chassis). */
  vehicles: readonly VehicleSlug[];
  /** Among the most common on Belgian roads: listed first. */
  top?: boolean;
}

export const MAKES: readonly Make[] = [
  // Cars (and the vans or motorhome bases of the same make)
  { slug: 'abarth', name: 'Abarth', vehicles: ['voiture'] },
  { slug: 'alfa-romeo', name: 'Alfa Romeo', vehicles: ['voiture'] },
  { slug: 'alpine', name: 'Alpine', vehicles: ['voiture'] },
  { slug: 'aston-martin', name: 'Aston Martin', vehicles: ['voiture'] },
  { slug: 'audi', name: 'Audi', vehicles: ['voiture'], top: true },
  { slug: 'bentley', name: 'Bentley', vehicles: ['voiture'] },
  { slug: 'bmw', name: 'BMW', vehicles: ['voiture', 'moto'], top: true },
  { slug: 'byd', name: 'BYD', vehicles: ['voiture'] },
  { slug: 'citroen', name: 'Citroën', vehicles: ['voiture', 'utilitaire', 'camping-car'], top: true },
  { slug: 'cupra', name: 'Cupra', vehicles: ['voiture'] },
  { slug: 'dacia', name: 'Dacia', vehicles: ['voiture'], top: true },
  { slug: 'ds', name: 'DS', vehicles: ['voiture'] },
  { slug: 'ferrari', name: 'Ferrari', vehicles: ['voiture'] },
  { slug: 'fiat', name: 'Fiat', vehicles: ['voiture', 'utilitaire', 'camping-car'], top: true },
  { slug: 'ford', name: 'Ford', vehicles: ['voiture', 'utilitaire', 'camping-car'], top: true },
  { slug: 'honda', name: 'Honda', vehicles: ['voiture', 'moto', 'bateau'] },
  { slug: 'hyundai', name: 'Hyundai', vehicles: ['voiture'], top: true },
  { slug: 'jaguar', name: 'Jaguar', vehicles: ['voiture'] },
  { slug: 'jeep', name: 'Jeep', vehicles: ['voiture'] },
  { slug: 'kia', name: 'Kia', vehicles: ['voiture'], top: true },
  { slug: 'lamborghini', name: 'Lamborghini', vehicles: ['voiture'] },
  { slug: 'land-rover', name: 'Land Rover', vehicles: ['voiture'] },
  { slug: 'leapmotor', name: 'Leapmotor', vehicles: ['voiture'] },
  { slug: 'lexus', name: 'Lexus', vehicles: ['voiture'] },
  { slug: 'lynk-co', name: 'Lynk & Co', vehicles: ['voiture'] },
  { slug: 'maserati', name: 'Maserati', vehicles: ['voiture'] },
  { slug: 'mazda', name: 'Mazda', vehicles: ['voiture'] },
  { slug: 'mercedes-benz', name: 'Mercedes-Benz', vehicles: ['voiture', 'utilitaire', 'camping-car'], top: true },
  { slug: 'mg', name: 'MG', vehicles: ['voiture'] },
  { slug: 'mini', name: 'Mini', vehicles: ['voiture'] },
  { slug: 'mitsubishi', name: 'Mitsubishi', vehicles: ['voiture'] },
  { slug: 'nissan', name: 'Nissan', vehicles: ['voiture', 'utilitaire'] },
  { slug: 'opel', name: 'Opel', vehicles: ['voiture', 'utilitaire'], top: true },
  { slug: 'peugeot', name: 'Peugeot', vehicles: ['voiture', 'utilitaire', 'camping-car', 'moto'], top: true },
  { slug: 'polestar', name: 'Polestar', vehicles: ['voiture'] },
  { slug: 'porsche', name: 'Porsche', vehicles: ['voiture'] },
  { slug: 'renault', name: 'Renault', vehicles: ['voiture', 'utilitaire', 'camping-car'], top: true },
  { slug: 'seat', name: 'Seat', vehicles: ['voiture'] },
  { slug: 'skoda', name: 'Škoda', vehicles: ['voiture'], top: true },
  { slug: 'smart', name: 'Smart', vehicles: ['voiture'] },
  { slug: 'kgm', name: 'KGM (SsangYong)', vehicles: ['voiture'] },
  { slug: 'subaru', name: 'Subaru', vehicles: ['voiture'] },
  { slug: 'suzuki', name: 'Suzuki', vehicles: ['voiture', 'moto', 'bateau'] },
  { slug: 'tesla', name: 'Tesla', vehicles: ['voiture'], top: true },
  { slug: 'toyota', name: 'Toyota', vehicles: ['voiture', 'utilitaire'], top: true },
  { slug: 'volkswagen', name: 'Volkswagen', vehicles: ['voiture', 'utilitaire', 'camping-car'], top: true },
  { slug: 'volvo', name: 'Volvo', vehicles: ['voiture'], top: true },

  // Motorbikes and scooters
  { slug: 'aprilia', name: 'Aprilia', vehicles: ['moto'] },
  { slug: 'benelli', name: 'Benelli', vehicles: ['moto'] },
  { slug: 'ducati', name: 'Ducati', vehicles: ['moto'] },
  { slug: 'harley-davidson', name: 'Harley-Davidson', vehicles: ['moto'] },
  { slug: 'husqvarna', name: 'Husqvarna', vehicles: ['moto'] },
  { slug: 'indian', name: 'Indian', vehicles: ['moto'] },
  { slug: 'kawasaki', name: 'Kawasaki', vehicles: ['moto'] },
  { slug: 'ktm', name: 'KTM', vehicles: ['moto'] },
  { slug: 'kymco', name: 'Kymco', vehicles: ['moto'] },
  { slug: 'moto-guzzi', name: 'Moto Guzzi', vehicles: ['moto'] },
  { slug: 'piaggio', name: 'Piaggio', vehicles: ['moto'] },
  { slug: 'royal-enfield', name: 'Royal Enfield', vehicles: ['moto'] },
  { slug: 'sym', name: 'SYM', vehicles: ['moto'] },
  { slug: 'triumph', name: 'Triumph', vehicles: ['moto'] },
  { slug: 'vespa', name: 'Vespa', vehicles: ['moto'] },
  { slug: 'yamaha', name: 'Yamaha', vehicles: ['moto', 'bateau'] },
  { slug: 'zero', name: 'Zero Motorcycles', vehicles: ['moto'] },

  // Vans and trucks
  { slug: 'daf', name: 'DAF', vehicles: ['utilitaire'] },
  { slug: 'isuzu', name: 'Isuzu', vehicles: ['utilitaire'] },
  { slug: 'iveco', name: 'Iveco', vehicles: ['utilitaire', 'camping-car'] },
  { slug: 'man', name: 'MAN', vehicles: ['utilitaire'] },
  { slug: 'maxus', name: 'Maxus', vehicles: ['utilitaire'] },
  { slug: 'renault-trucks', name: 'Renault Trucks', vehicles: ['utilitaire'] },
  { slug: 'scania', name: 'Scania', vehicles: ['utilitaire'] },
  { slug: 'volvo-trucks', name: 'Volvo Trucks', vehicles: ['utilitaire'] },

  // Motorhomes and caravans
  { slug: 'adria', name: 'Adria', vehicles: ['camping-car'] },
  { slug: 'burstner', name: 'Bürstner', vehicles: ['camping-car'] },
  { slug: 'carado', name: 'Carado', vehicles: ['camping-car'] },
  { slug: 'chausson', name: 'Chausson', vehicles: ['camping-car'] },
  { slug: 'dethleffs', name: 'Dethleffs', vehicles: ['camping-car'] },
  { slug: 'fendt-caravan', name: 'Fendt Caravan', vehicles: ['camping-car'] },
  { slug: 'hobby', name: 'Hobby', vehicles: ['camping-car'] },
  { slug: 'hymer', name: 'Hymer', vehicles: ['camping-car'] },
  { slug: 'knaus', name: 'Knaus', vehicles: ['camping-car'] },
  { slug: 'pilote', name: 'Pilote', vehicles: ['camping-car'] },
  { slug: 'rapido', name: 'Rapido', vehicles: ['camping-car'] },
  { slug: 'sunlight', name: 'Sunlight', vehicles: ['camping-car'] },
  { slug: 'weinsberg', name: 'Weinsberg', vehicles: ['camping-car'] },

  // Bikes and e-bikes
  { slug: 'batavus', name: 'Batavus', vehicles: ['velo'] },
  { slug: 'bulls', name: 'Bulls', vehicles: ['velo'] },
  { slug: 'cannondale', name: 'Cannondale', vehicles: ['velo'] },
  { slug: 'canyon', name: 'Canyon', vehicles: ['velo'] },
  { slug: 'cube', name: 'Cube', vehicles: ['velo'] },
  { slug: 'decathlon', name: 'Decathlon', vehicles: ['velo'] },
  { slug: 'gazelle', name: 'Gazelle', vehicles: ['velo'] },
  { slug: 'giant', name: 'Giant', vehicles: ['velo'] },
  { slug: 'kalkhoff', name: 'Kalkhoff', vehicles: ['velo'] },
  { slug: 'koga', name: 'Koga', vehicles: ['velo'] },
  { slug: 'oxford', name: 'Oxford', vehicles: ['velo'] },
  { slug: 'ridley', name: 'Ridley', vehicles: ['velo'] },
  { slug: 'riese-muller', name: 'Riese & Müller', vehicles: ['velo'] },
  { slug: 'scott', name: 'Scott', vehicles: ['velo'] },
  { slug: 'sparta', name: 'Sparta', vehicles: ['velo'] },
  { slug: 'specialized', name: 'Specialized', vehicles: ['velo'] },
  { slug: 'stromer', name: 'Stromer', vehicles: ['velo'] },
  { slug: 'thompson', name: 'Thompson', vehicles: ['velo'] },
  { slug: 'trek', name: 'Trek', vehicles: ['velo'] },

  // Electric scooters
  { slug: 'dualtron', name: 'Dualtron', vehicles: ['trottinette'] },
  { slug: 'inokim', name: 'Inokim', vehicles: ['trottinette'] },
  { slug: 'kaabo', name: 'Kaabo', vehicles: ['trottinette'] },
  { slug: 'pure-electric', name: 'Pure Electric', vehicles: ['trottinette'] },
  { slug: 'segway-ninebot', name: 'Segway-Ninebot', vehicles: ['trottinette'] },
  { slug: 'vsett', name: 'Vsett', vehicles: ['trottinette'] },
  { slug: 'xiaomi', name: 'Xiaomi', vehicles: ['trottinette'] },

  // Boats and marine engines
  { slug: 'bavaria', name: 'Bavaria', vehicles: ['bateau'] },
  { slug: 'beneteau', name: 'Bénéteau', vehicles: ['bateau'] },
  { slug: 'evinrude', name: 'Evinrude', vehicles: ['bateau'] },
  { slug: 'jeanneau', name: 'Jeanneau', vehicles: ['bateau'] },
  { slug: 'mercury', name: 'Mercury', vehicles: ['bateau'] },
  { slug: 'quicksilver', name: 'Quicksilver', vehicles: ['bateau'] },
  { slug: 'tohatsu', name: 'Tohatsu', vehicles: ['bateau'] },
  { slug: 'volvo-penta', name: 'Volvo Penta', vehicles: ['bateau'] },
  { slug: 'yanmar', name: 'Yanmar', vehicles: ['bateau'] },
  { slug: 'zodiac', name: 'Zodiac', vehicles: ['bateau'] },
];

const BY_SLUG = new Map(MAKES.map((m) => [m.slug, m]));

export const getMake = (slug?: string | null): Make | undefined => (slug ? BY_SLUG.get(slug) : undefined);
export const isMake = (slug?: string | null): boolean => !!slug && BY_SLUG.has(slug);

/** Makes of one kind of vehicle, alphabetical (accents ignored). */
export function makesFor(vehicle: VehicleSlug, locale = 'fr'): Make[] {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  return MAKES.filter((m) => m.vehicles.includes(vehicle)).sort((a, b) => collator.compare(a.name, b.name));
}

/** Groups an alphabetical list by initial (Š under S, É under E). */
export function byLetter(makes: readonly Make[]): { letter: string; makes: Make[] }[] {
  const groups: { letter: string; makes: Make[] }[] = [];
  for (const m of makes) {
    const first = fold(m.name).charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : '#';
    const last = groups[groups.length - 1];
    if (last?.letter === letter) last.makes.push(m);
    else groups.push({ letter, makes: [m] });
  }
  return groups;
}

/** Makes of the same main vehicle, for "other makes" links. */
export function relatedMakes(make: Make, locale = 'fr', count = 12): Make[] {
  const vehicle = make.vehicles[0];
  const pool = makesFor(vehicle, locale).filter((m) => m.slug !== make.slug);
  // Common makes first, then the rest, keeping alphabetical order inside each.
  return [...pool.filter((m) => m.top), ...pool.filter((m) => !m.top)].slice(0, count);
}
