// ============================================================
//  DIGNITIES ENGINE — Planetary dignity, combustion, avastha
//  Layer 2 (pure astrological rules)
// ============================================================

import { RASHIS, PLANET_DIGNITY_DATA, NATURAL_FRIENDS, NATURAL_ENEMIES, COMBUSTION_ORBS } from './constants';
import type { Planet, BodyPlanet, Sign, Dignity, Avastha } from './models';

/** Get the Sign name from a sidereal longitude */
export function signFromLongitude(lon: number): Sign {
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30);
  return RASHIS[idx].name;
}

/** Get 0-based sign index from longitude */
export function signIndexFromLongitude(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 / 30);
}

/** Degree within sign (0–30) */
export function degreeInSign(lon: number): number {
  return ((lon % 360) + 360) % 360 % 30;
}

/** Format longitude as DMS string, e.g. "14° 23' 45\"" */
export function formatDMS(lon: number): string {
  const deg = Math.floor(lon);
  const minFull = (lon - deg) * 60;
  const min = Math.floor(minFull);
  const sec = Math.round((minFull - min) * 60);
  return `${deg}° ${min}' ${sec}"`;
}

// ─── Dignity ─────────────────────────────────────────────────────────────────

/** Full Panchadha Maitri dignity computation */
export function computeDignity(planet: BodyPlanet, signName: Sign, degInSign: number): Dignity {
  const data = PLANET_DIGNITY_DATA[planet];
  if (!data) return 'Neutral'; // Rahu/Ketu handled below

  // Check exaltation
  if (signName === data.exaltedSign) return 'Exalted';

  // Check debilitation
  if (signName === data.debilitatedSign) return 'Debilitated';

  // Check Moolatrikona
  if (
    signName === data.moolatrikonaSign &&
    degInSign >= data.moolatrikonaStart &&
    degInSign < data.moolatrikonaEnd
  ) return 'Moolatrikona';

  // Own sign
  if (data.ownSigns.includes(signName)) return 'OwnSign';

  // Find the sign's lord to compute friendship
  const signLord = RASHIS.find(r => r.name === signName)?.lord as BodyPlanet | undefined;
  if (!signLord || signLord === planet) return 'OwnSign'; // same lord

  const friends = NATURAL_FRIENDS[planet] || [];
  const enemies = NATURAL_ENEMIES[planet] || [];

  if (friends.includes(signLord)) return 'Friend';
  if (enemies.includes(signLord)) return 'Enemy';

  return 'Neutral';
}

// Rahu/Ketu special dignity (they use sign-based dignity only)
export function computeRahuKetuDignity(planet: 'Rahu' | 'Ketu', signName: Sign): Dignity {
  const data = PLANET_DIGNITY_DATA[planet];
  if (!data) return 'Neutral';
  if (signName === data.exaltedSign) return 'Exalted';
  if (signName === data.debilitatedSign) return 'Debilitated';
  if (data.ownSigns.includes(signName)) return 'OwnSign';
  return 'Neutral';
}

// ─── Avastha ─────────────────────────────────────────────────────────────────

/** Baladi (age-based) Avastha from degree within sign */
export function computeAvastha(degInSign: number, isRetrograde: boolean): Avastha {
  // Retrograde planets use reversed avastha
  const deg = isRetrograde ? 30 - degInSign : degInSign;
  if (deg < 6)  return 'Bala';
  if (deg < 12) return 'Kumara';
  if (deg < 18) return 'Yuva';
  if (deg < 24) return 'Vriddha';
  return 'Mrita';
}

// ─── Combustion ───────────────────────────────────────────────────────────────

/** Check if a planet is combust (too close to Sun) */
export function checkCombust(
  planet: BodyPlanet,
  planetSiderealLon: number,
  sunSiderealLon: number,
  isRetrograde: boolean
): boolean {
  if (planet === 'Sun' || planet === 'Moon' || planet === 'Rahu' || planet === 'Ketu') return false;
  const baseOrb = COMBUSTION_ORBS[planet];
  if (baseOrb === undefined) return false;
  // Mercury has tighter orb when direct, wider when retrograde
  let orb = baseOrb;
  if (planet === 'Mercury') orb = isRetrograde ? 14 : 8;
  if (planet === 'Venus')   orb = isRetrograde ? 8  : 10;

  let diff = Math.abs(planetSiderealLon - sunSiderealLon);
  if (diff > 180) diff = 360 - diff;
  return diff <= orb;
}

// ─── Dignity Display Labels ───────────────────────────────────────────────────

export const DIGNITY_LABELS: Record<Dignity, string> = {
  Exalted:     'Exalted (Uchha)',
  Moolatrikona:'Moolatrikona',
  OwnSign:     'Own Sign (Swakshetra)',
  GreatFriend: 'Great Friend',
  Friend:      'Friend',
  Neutral:     'Neutral',
  Enemy:       'Enemy',
  GreatEnemy:  'Great Enemy',
  Debilitated: 'Debilitated (Neecha)',
};

export const DIGNITY_SCORE: Record<Dignity, number> = {
  Exalted:     100,
  Moolatrikona: 85,
  OwnSign:      75,
  GreatFriend:  65,
  Friend:       55,
  Neutral:      40,
  Enemy:        25,
  GreatEnemy:   15,
  Debilitated:   0,
};
