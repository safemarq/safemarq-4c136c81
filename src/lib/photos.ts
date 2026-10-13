import type { VehicleSlug } from './taxonomy';

/**
 * Photography, served by Unsplash's image CDN (free Unsplash License, no
 * attribution required; credits kept here). Each photo has a focal point so
 * the CDN can crop it to any ratio without losing the subject.
 *
 * To self-host later, replace `photoUrl` with a path under /public: every
 * component goes through these helpers.
 */
export interface Photo {
  id: string;
  /** Focal point, 0..1 from the left / top. */
  fx: number;
  fy: number;
  credit: string;
}

export const PHOTOS = {
  // Close-up: a hand with a spanner in a warm-lit engine bay, dark all around.
  hero: { id: 'photo-1619642751034-765dfdf7c58e', fx: 0.6, fy: 0.55, credit: 'Christian Buehner / Unsplash' },
  // Mechanic leaning into an open engine bay.
  entretien: { id: 'photo-1771340012319-0b4fca008b54', fx: 0.55, fy: 0.5, credit: 'Dextar Studio / Unsplash' },
  // Crumpled rear door of a red car on a flatbed.
  carrosserie: { id: 'photo-1673187139211-1e7ec3dd60ec', fx: 0.4, fy: 0.5, credit: 'Usman Malik / Unsplash' },
  // Mechanic fitting a tyre.
  pneus: { id: 'photo-1632823471565-1ecf94f8799a', fx: 0.38, fy: 0.6, credit: 'Deniz Demirci / Unsplash' },
  // Technician with a checklist in a workshop.
  'controle-technique': { id: 'photo-1700727448575-6f1680cd7d75', fx: 0.6, fy: 0.45, credit: 'TruckRun / Unsplash' },
} satisfies Record<string, Photo>;

/** One photo per vehicle: home directory, rankings without a trade photo. */
export const VEHICLE_PHOTOS: Record<VehicleSlug, Photo> = {
  // Bright workshop, red SUV on a lift with a mechanic under the bonnet.
  voiture: { id: 'photo-1727893119356-1702fe921cf9', fx: 0.72, fy: 0.55, credit: 'Mehmet Talha Onuk / Unsplash' },
  // Red roadster on a paddock stand, engine and rear shock in the light.
  moto: { id: 'photo-1784058793055-2e2b876ef3b5', fx: 0.5, fy: 0.35, credit: 'Konrad Nowacki / Unsplash' },
  // Yellow van parked on cobblestones in front of a brick house.
  utilitaire: { id: 'photo-1591706515036-cb0f48dc5e62', fx: 0.47, fy: 0.5, credit: 'Claudio Schwarz / Unsplash' },
  // Camper van at night, lit from inside, two folding chairs beside it.
  'camping-car': { id: 'photo-1766083639110-ec7c4ad90490', fx: 0.66, fy: 0.45, credit: 'Fabio Sasso / Unsplash' },
  // A bicycle taken apart, every part laid out on a wooden bench.
  velo: { id: 'photo-1669637842182-aa5656dd1492', fx: 0.45, fy: 0.5, credit: 'paolo candelo / Unsplash' },
  // Electric scooter on paving stones at sunset.
  trottinette: { id: 'photo-1657008846502-e03a84f49baa', fx: 0.4, fy: 0.6, credit: 'Hiboy / Unsplash' },
  // Old wooden sailing boat on stands in a boatyard, hull being worked on.
  bateau: { id: 'photo-1777982822846-3a535f75aed6', fx: 0.5, fy: 0.55, credit: 'Margo Evardson / Unsplash' },
};

export type PhotoKey = keyof typeof PHOTOS;

/** Cropped to w×h around the focal point; auto=format serves AVIF/WebP. */
export function photoUrl(photo: Photo, w: number, h?: number, quality = 62): string {
  const params = new URLSearchParams({ auto: 'format', q: String(quality), w: String(w) });
  if (h) {
    params.set('h', String(h));
    params.set('fit', 'crop');
    params.set('crop', 'focalpoint');
    params.set('fp-x', String(photo.fx));
    params.set('fp-y', String(photo.fy));
  }
  return `https://images.unsplash.com/${photo.id}?${params.toString()}`;
}

/** srcset for a fixed aspect ratio (width / height). */
export function photoSrcSet(photo: Photo, widths: number[], ratio: number, quality?: number): string {
  return widths.map((w) => `${photoUrl(photo, w, Math.round(w / ratio), quality)} ${w}w`).join(', ');
}

export const tradePhoto = (slug: string): Photo | undefined => (PHOTOS as Record<string, Photo>)[slug];
