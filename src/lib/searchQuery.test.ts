import { describe, expect, it } from 'vitest';
import rows from '@/data/be-places.json';
import { PlaceIndex, getCity } from './cities';
import { parseQuery, suggest, vocabularyFor } from './searchQuery';

const places = new PlaceIndex(rows as unknown as ConstructorParameters<typeof PlaceIndex>[0]);
const parse = (q: string) => {
  const p = parseQuery(q, places);
  return { vehicle: p.vehicle, trade: p.trade, city: p.city?.slug ?? null, nearMe: p.nearMe, rest: p.rest };
};

describe('reading a search', () => {
  it('finds trade and town in any order and language', () => {
    expect(parse('pneus liège')).toMatchObject({ trade: 'pneus', city: 'liege', rest: '' });
    expect(parse('Luik banden')).toMatchObject({ trade: 'pneus', city: 'liege' });
    expect(parse('Reifenwechsel Eupen')).toMatchObject({ trade: 'pneus', city: 'eupen' });
    expect(parse('vidange à Namur')).toMatchObject({ trade: 'entretien', city: 'namur', rest: '' });
    expect(parse('brake pads Brussels')).toMatchObject({ trade: 'freinage', city: 'bruxelles' });
  });

  it('understands vehicles, postal codes and multi-word towns', () => {
    expect(parse('moto 5100')).toMatchObject({ vehicle: 'moto', city: 'jambes' });
    expect(parse('fietsenmaker Sint-Niklaas').city).toBe('saint-nicolas');
    expect(parse('carrosserie La Louvière')).toMatchObject({ trade: 'carrosserie', city: 'la-louviere' });
    expect(parse('garage braine l alleud').city).toBe('braine-l-alleud');
    expect(parse('camping-car étanchéité')).toMatchObject({ vehicle: 'camping-car', trade: 'etancheite' });
  });

  it('knows "near me" and generic words', () => {
    expect(parse('contrôle technique près de moi')).toMatchObject({ trade: 'controle-technique', nearMe: true, rest: '' });
    expect(parse('garage Namur')).toMatchObject({ vehicle: null, trade: null, city: 'namur', rest: '' });
  });

  it('leaves names it does not know for the name search', () => {
    expect(parse('garage delvaux')).toMatchObject({ trade: null, city: null, rest: 'delvaux' });
    expect(parse('carrosserie du parc')).toMatchObject({ trade: 'carrosserie', rest: 'parc' });
  });

  it('does not mistake short words for villages', () => {
    expect(parse('as').city).toBeNull();
    expect(parse('mont').city).toBeNull();
    expect(parse('mons').city).toBe('mons');
  });

  it('drops a trade the vehicle does not have', () => {
    expect(parse('vélo distribution')).toMatchObject({ vehicle: 'velo', trade: null });
  });

  it('adds the site trade names of the visitor language', () => {
    const vocab = vocabularyFor('test-nl', { 'embrayage-boite': ['Koppeling & versnellingsbak'] });
    expect(parseQuery('versnellingsbak gent', places, vocab).trade).toBe('embrayage-boite');
  });
});

describe('suggestions', () => {
  const namur = getCity('namur')!;

  it('offers the complete search first', () => {
    const s = suggest(parseQuery('pneus liège', places), { places, currentCity: null });
    expect(s[0]).toMatchObject({ kind: 'search', vehicle: 'voiture', trade: 'pneus', city: { slug: 'liege' } });
  });

  it('completes the town while typing', () => {
    const s = suggest(parseQuery('pneus nam', places), { places, currentCity: null });
    expect(s[0]).toMatchObject({ kind: 'search', trade: 'pneus', city: { slug: 'namur' } });
  });

  it('completes the trade while typing', () => {
    const s = suggest(parseQuery('namur frei', places), { places, currentCity: null });
    expect(s.some((x) => x.kind === 'search' && x.trade === 'freinage' && x.city?.slug === 'namur')).toBe(true);
  });

  it('uses the current town, and around me, when none is typed', () => {
    const s = suggest(parseQuery('vidange', places), { places, currentCity: namur });
    expect(s[0]).toMatchObject({ kind: 'search', trade: 'entretien', city: { slug: 'namur' } });
    expect(s[1]).toMatchObject({ kind: 'search', trade: 'entretien', nearMe: true });
  });

  it('offers every vehicle for a trade cars do not have', () => {
    const s = suggest(parseQuery('hivernage', places), { places, currentCity: namur });
    const vehicles = s.filter((x) => x.kind === 'search').map((x) => (x.kind === 'search' ? x.vehicle : null));
    expect(vehicles).toEqual(expect.arrayContaining(['moto', 'camping-car', 'bateau']));
  });

  it('suggests places for a bare town name', () => {
    const s = suggest(parseQuery('jamb', places), { places, currentCity: null });
    expect(s.some((x) => x.kind === 'city' && x.city.slug === 'jambes')).toBe(true);
  });
});
