// ============================================================
//  NAKSHATRA RESOLVER — Layer 2 (pure astrological rules)
// ============================================================

import { NAKSHATRAS } from './constants';
import type { Nakshatra, NakshatraPosition } from './models';

const NAKSHATRA_SPAN = 360.0 / 27.0; // 13°20'
const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3°20'

/** Resolve Nakshatra + Pada for a given absolute sidereal longitude (0–360°) */
export function resolveNakshatra(siderealLon: number): NakshatraPosition {
  const lon = ((siderealLon % 360) + 360) % 360;
  const rawIndex = lon / NAKSHATRA_SPAN;
  const nakshatraIndex0 = Math.floor(rawIndex) % 27; // 0-based
  const nakshatra = NAKSHATRAS[nakshatraIndex0];
  const posInNakshatra = (lon - nakshatraIndex0 * NAKSHATRA_SPAN + 360) % NAKSHATRA_SPAN;
  const pada = Math.floor(posInNakshatra / PADA_SPAN) + 1; // 1–4
  return {
    nakshatra,
    pada: Math.min(pada, 4) as 1 | 2 | 3 | 4,
    degreeInNakshatra: posInNakshatra,
  };
}

/** Get the fraction of nakshatra elapsed (0–1) for dasha balance calculation */
export function getNakshatraFractionElapsed(siderealLon: number): {
  nakshatra: Nakshatra;
  fractionElapsed: number;
  fractionRemaining: number;
} {
  const lon = ((siderealLon % 360) + 360) % 360;
  const rawIndex = lon / NAKSHATRA_SPAN;
  const nakshatraIndex0 = Math.floor(rawIndex) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex0];
  const startOfNakshatra = nakshatraIndex0 * NAKSHATRA_SPAN;
  const posInNakshatra = lon - startOfNakshatra;
  const fractionElapsed = posInNakshatra / NAKSHATRA_SPAN;
  return { nakshatra, fractionElapsed, fractionRemaining: 1 - fractionElapsed };
}

/** Navamsha sign for a given longitude */
export function resolveNavamshaSign(siderealLon: number): number {
  const lon = ((siderealLon % 360) + 360) % 360;
  const rashiIndex = Math.floor(lon / 30); // 0-11
  const degInRashi = lon - rashiIndex * 30;
  const navamshaWithinRashi = Math.floor(degInRashi / (30 / 9)); // 0-8
  // Fire signs start from Aries, Earth from Capricorn, Air from Libra, Water from Cancer
  const elementStarts = [0, 9, 6, 3]; // Aries=0, Capricorn=9, Libra=6, Cancer=3 (0-indexed)
  const element = rashiIndex % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water
  const navamshaRashiIndex = (elementStarts[element] + navamshaWithinRashi) % 12;
  return navamshaRashiIndex;
}

export { NAKSHATRAS, NAKSHATRA_SPAN, PADA_SPAN };
