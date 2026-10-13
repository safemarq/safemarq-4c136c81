import { describe, expect, it } from 'vitest';
import { parseRankingPath, rankingPath, searchHref } from './links';

describe('ranking URLs', () => {
  it('keeps the short form for cars', () => {
    expect(rankingPath({ vehicle: 'voiture', trade: 'carrosserie', city: 'namur' })).toBe('/carrosserie/namur');
    expect(rankingPath({ vehicle: 'voiture', trade: null, city: 'namur' })).toBe('/voiture/namur');
    expect(rankingPath({ vehicle: 'moto', trade: 'entretien', city: 'liege' })).toBe('/moto/entretien/liege');
    expect(rankingPath({ vehicle: 'bateau', trade: null, city: 'ostende' })).toBe('/bateau/ostende');
  });

  it('reads every form back', () => {
    expect(parseRankingPath('carrosserie', 'namur')).toEqual({ kind: 'ok', target: { vehicle: 'voiture', trade: 'carrosserie', city: 'namur' } });
    expect(parseRankingPath('moto', 'namur')).toEqual({ kind: 'ok', target: { vehicle: 'moto', trade: null, city: 'namur' } });
    expect(parseRankingPath('velo', 'mecanique', 'gand')).toEqual({ kind: 'ok', target: { vehicle: 'velo', trade: 'mecanique', city: 'gand' } });
  });

  it('redirects to the canonical URL', () => {
    expect(parseRankingPath('voiture', 'pneus', 'namur')).toEqual({ kind: 'redirect', to: '/pneus/namur' });
    expect(parseRankingPath('carenage', 'ostende')).toEqual({ kind: 'redirect', to: '/bateau/carenage/ostende' });
  });

  it('rejects what does not exist', () => {
    expect(parseRankingPath('velo', 'distribution', 'namur')).toEqual({ kind: 'none' });
    expect(parseRankingPath('foo', 'namur')).toEqual({ kind: 'none' });
    expect(parseRankingPath('moto')).toEqual({ kind: 'none' });
  });

  it('builds the search link', () => {
    expect(searchHref('voiture', 'pneus')).toBe('/?metier=pneus#recherche');
    expect(searchHref('moto')).toBe('/?vehicule=moto#recherche');
  });
});
