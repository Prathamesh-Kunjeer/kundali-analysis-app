// ============================================================
//  HOUSES ENGINE — 12 Bhavas calculation (Equal House / Whole Sign)
//  Layer 2 (pure astrological rules)
// ============================================================

import { RASHIS, HOUSE_METADATA } from './constants';
import type { House, Planet, Sign } from './models';

const KENDRA   = new Set([1, 4, 7, 10]);
const TRIKONA  = new Set([1, 5, 9]);
const DUSTHANA = new Set([6, 8, 12]);
const UPACHAYA = new Set([3, 6, 10, 11]);

/**
 * Build all 12 Bhavas using Equal House (Whole Sign) system.
 * Each house corresponds to one full Rashi starting from Lagna sign.
 * Planet distribution is done AFTER all PlanetPositions are resolved.
 */
export function buildHouses(
  lagnaLongitude: number,
  planetHouses: Record<Planet, number>   // planet → house number (1–12)
): House[] {
  const lagnaSignIdx = Math.floor(((lagnaLongitude % 360) + 360) % 360 / 30);
  const houses: House[] = [];

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1;
    const signIdx = (lagnaSignIdx + i) % 12;
    const rashi = RASHIS[signIdx];
    const meta = HOUSE_METADATA[i];
    const cuspLongitude = (signIdx * 30);

    // Collect planets in this house
    const planetsInHouse: Planet[] = Object.entries(planetHouses)
      .filter(([, h]) => h === houseNumber)
      .map(([p]) => p as Planet);

    houses.push({
      number: houseNumber,
      sign: rashi.name,
      signIndex: signIdx,
      lord: rashi.lord,
      cuspLongitude,
      planets: planetsInHouse,
      sanskritName: meta.sanskritName,
      significance: meta.significance,
      isKendra:   KENDRA.has(houseNumber),
      isTrikona:  TRIKONA.has(houseNumber),
      isDusthana: DUSTHANA.has(houseNumber),
      isUpachaya: UPACHAYA.has(houseNumber),
    });
  }
  return houses;
}

/**
 * Determine which house a planet occupies given Lagna longitude and planet longitude.
 * Uses Whole Sign: planet house = (planetSign - lagnaSign + 12) % 12 + 1
 */
export function planetHouseFromLagna(lagnaLon: number, planetLon: number): number {
  const lagnaSign = Math.floor(((lagnaLon % 360) + 360) % 360 / 30);
  const planetSign = Math.floor(((planetLon % 360) + 360) % 360 / 30);
  return ((planetSign - lagnaSign + 12) % 12) + 1;
}

/** Get house type classification as a human-readable string */
export function houseTypeLabel(houseNumber: number): string {
  const labels: string[] = [];
  if (KENDRA.has(houseNumber))   labels.push('Kendra');
  if (TRIKONA.has(houseNumber))  labels.push('Trikona');
  if (DUSTHANA.has(houseNumber)) labels.push('Dusthana');
  if (UPACHAYA.has(houseNumber)) labels.push('Upachaya');
  return labels.join(' / ') || 'Neutral';
}

export { KENDRA, TRIKONA, DUSTHANA, UPACHAYA };
