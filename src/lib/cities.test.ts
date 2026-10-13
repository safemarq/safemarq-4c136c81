import { describe, expect, it } from 'vitest';
import { nearestCity, resolveCity, searchCities } from './cities';

describe('city search', () => {
  it('finds a city by its name in any site language', () => {
    expect(resolveCity('Bruxelles')?.slug).toBe('bruxelles');
    expect(resolveCity('brussel')?.slug).toBe('bruxelles');
    expect(resolveCity('Lüttich')?.slug).toBe('liege');
    expect(resolveCity('luik')?.slug).toBe('liege');
    expect(resolveCity('Gent')?.slug).toBe('gand');
    expect(resolveCity('liege')?.slug).toBe('liege');
  });

  it('accepts a clear prefix but not an unknown town', () => {
    expect(resolveCity('nam')?.slug).toBe('namur');
    expect(resolveCity('Dinant')).toBeNull();
    expect(resolveCity('')).toBeNull();
  });

  it('suggests prefix matches first', () => {
    expect(searchCities('ma').map((c) => c.slug)[0]).toBe('malines');
  });

  it('picks the nearest covered city', () => {
    expect(nearestCity(50.4669, 4.8675).slug).toBe('namur'); // Namur station
    expect(nearestCity(50.4552, 4.8722).slug).toBe('namur'); // Jambes
    expect(nearestCity(51.0538, 3.7250).slug).toBe('gand');
  });
});
