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
  // Bright workshop, red SUV on a lift with a mechanic under the bonnet.
  hero: { id: 'photo-1727893119356-1702fe921cf9', fx: 0.7, fy: 0.55, credit: 'Mehmet Talha Onuk / Unsplash' },
  // Mechanic leaning into an open engine bay.
  entretien: { id: 'photo-1771340012319-0b4fca008b54', fx: 0.55, fy: 0.5, credit: 'Dextar Studio / Unsplash' },
  // Crumpled rear door of a red car on a flatbed.
  carrosserie: { id: 'photo-1673187139211-1e7ec3dd60ec', fx: 0.4, fy: 0.5, credit: 'Usman Malik / Unsplash' },
  // Mechanic fitting a tyre.
  pneus: { id: 'photo-1632823471565-1ecf94f8799a', fx: 0.38, fy: 0.6, credit: 'Deniz Demirci / Unsplash' },
  // Technician with a checklist in a workshop.
  'controle-technique': { id: 'photo-1700727448575-6f1680cd7d75', fx: 0.6, fy: 0.45, credit: 'TruckRun / Unsplash' },
  // Smiling mechanic wiring a dashboard.
  pro: { id: 'photo-1628577478162-d4d00467c627', fx: 0.65, fy: 0.45, credit: 'Kato Blackmore / Unsplash' },
} satisfies Record<string, Photo>;

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
