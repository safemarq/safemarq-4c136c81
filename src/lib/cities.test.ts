import { describe, expect, it } from 'vitest';
import rows from '@/data/be-places.json';
import { CITIES, PlaceIndex, cityName, getCity, lastCity, nearbyCities, rememberCity } from './cities';

const places = new PlaceIndex(rows as unknown as ConstructorParameters<typeof PlaceIndex>[0]);

describe('places', () => {
  it('knows every featured town under the same slug', () => {
    for (const c of CITIES) expect(places.get(c.slug)).toBe(c);
    expect(new Set(places.all.map((c) => c.slug)).size).toBe(places.all.length);
  });

  it('finds a town by its name in any site language', () => {
    expect(places.resolve('Bruxelles')?.slug).toBe('bruxelles');
    expect(places.resolve('brussel')?.slug).toBe('bruxelles');
    expect(places.resolve('Lüttich')?.slug).toBe('liege');
    expect(places.resolve('luik')?.slug).toBe('liege');
    expect(places.resolve('Gent')?.slug).toBe('gand');
    expect(places.resolve('Antwerp')?.slug).toBe('anvers');
    expect(places.resolve('Sint-Genesius-Rode')?.slug).toBe('rhode-saint-genese');
    expect(places.resolve('Sankt Vith')?.slug).toBe('saint-vith');
  });

  it('finds small towns and postal codes', () => {
    expect(places.resolve('Dinant')?.slug).toBe('dinant');
    expect(places.resolve('5100')?.slug).toBe('jambes');
    expect(places.resolve('4000')?.slug).toBe('liege');
    expect(places.search('51').every((c) => c.zips.some((z) => z.startsWith('51')))).toBe(true);
  });

  it('puts big towns first and accepts a clear prefix only', () => {
    expect(places.search('nam')[0].slug).toBe('namur');
    expect(places.resolve('nam')?.slug).toBe('namur');
    expect(places.resolve('zzzz')).toBeNull();
    expect(places.resolve('')).toBeNull();
  });

  it('keeps towns with the same name apart', () => {
    expect(places.resolve('9300')?.slug).toBe('alost');
    expect(places.get('aalst')?.zips).toContain('3800');
    expect(places.get('haren')?.region).toBe('brussels');
  });

  it('names towns in the visitor language', () => {
    expect(cityName('anvers', 'fr')).toBe('Anvers');
    expect(cityName('anvers', 'nl')).toBe('Antwerpen');
    expect(cityName('liege', 'de')).toBe('Lüttich');
    expect(cityName(places.get('saint-vith')!, 'fr')).toBe('Saint-Vith');
    expect(cityName(places.get('saint-vith')!, 'de')).toBe('Sankt Vith');
  });

  it('picks the nearest locality and nearby big towns', () => {
    expect(places.nearest(50.4669, 4.8675).slug).toBe('namur');
    expect(places.nearest(50.4552, 4.8722).slug).toBe('jambes');
    expect(nearbyCities(getCity('namur')!, 2).map((c) => c.slug)).toEqual(['charleroi', 'wavre']);
  });

  it('remembers the last town, including old slug-only values', () => {
    rememberCity(places.get('jambes')!);
    expect(lastCity()?.slug).toBe('jambes');
    localStorage.setItem('safemarq-last-city', 'namur');
    expect(lastCity()?.slug).toBe('namur');
    localStorage.setItem('safemarq-last-city', '{bad');
    expect(lastCity()).toBeNull();
  });
});
