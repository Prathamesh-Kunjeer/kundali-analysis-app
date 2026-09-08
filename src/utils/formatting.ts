import { RashiName, PlanetName } from '../types/astrology';
import { RASHIS, NAKSHATRAS, PLANETS_DATA } from '../data/constants';

/**
 * Formats a degree float into Degree° Minute' Second" format
 */
export function formatDMS(degree: number): string {
  const norm = ((degree % 360) + 360) % 360;
  const d = Math.floor(norm);
  const minFloat = (norm - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);

  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

/**
 * Formats a degree within a sign (0-30°)
 */
export function formatDegreeInSign(degree: number): string {
  const degInSign = degree % 30;
  const d = Math.floor(degInSign);
  const minFloat = (degInSign - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);

  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

/**
 * Returns the Rashi (Zodiac sign) for a sidereal longitude (0 to 360)
 */
export function getRashiFromDegree(longitude: number): {
  number: number; // 1 to 12
  name: RashiName;
  sanskritName: string;
  hindiName: string;
  lord: PlanetName;
  degreeInRashi: number;
} {
  const norm = ((longitude % 360) + 360) % 360;
  const rashiIndex = Math.floor(norm / 30); // 0 to 11
  const rashiInfo = RASHIS[rashiIndex];
  const degreeInRashi = norm % 30;

  return {
    number: rashiInfo.number,
    name: rashiInfo.name,
    sanskritName: rashiInfo.sanskritName,
    hindiName: rashiInfo.hindiName,
    lord: rashiInfo.lord,
    degreeInRashi
  };
}

/**
 * Returns the Nakshatra and Pada for a sidereal longitude (0 to 360)
 * Each Nakshatra spans 13° 20' (13.333333°)
 * Each Pada spans 3° 20' (3.333333°)
 */
export function getNakshatraFromDegree(longitude: number): {
  number: number; // 1 to 27
  name: string;
  sanskritName: string;
  lord: PlanetName;
  pada: number; // 1 to 4
  deity: string;
  symbol: string;
  gana: string;
  yoni: string;
  nadi: string;
} {
  const norm = ((longitude % 360) + 360) % 360;
  const nakshatraSpan = 360.0 / 27.0; // 13.33333333°
  const padaSpan = nakshatraSpan / 4.0; // 3.33333333°

  const nakshatraIndex = Math.floor(norm / nakshatraSpan); // 0 to 26
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  const posInNakshatra = norm - nakshatraIndex * nakshatraSpan;
  const pada = Math.min(4, Math.floor(posInNakshatra / padaSpan) + 1);

  return {
    number: nakshatra.index,
    name: nakshatra.name,
    sanskritName: nakshatra.sanskritName,
    lord: nakshatra.lord,
    pada,
    deity: nakshatra.deity,
    symbol: nakshatra.symbol,
    gana: nakshatra.gana,
    yoni: nakshatra.yoni,
    nadi: nakshatra.nadi
  };
}

/**
 * Calculates Navamsha (D9) Sign for a given Sidereal longitude
 * Each Navamsha is 3° 20' (3.333333°). Total 108 padas in the zodiac.
 * Starting signs for fiery signs (Aries, Leo, Sag) -> Aries
 * Earth signs (Taurus, Virgo, Cap) -> Capricorn
 * Air signs (Gemini, Libra, Aqua) -> Libra
 * Water signs (Cancer, Scorpio, Pisces) -> Cancer
 */
export function getNavamshaRashi(longitude: number): {
  number: number; // 1 to 12
  name: RashiName;
} {
  const norm = ((longitude % 360) + 360) % 360;
  const padaIndex = Math.floor(norm / (360.0 / 108.0)); // 0 to 107
  const navamshaRashiIndex = padaIndex % 12; // 0 to 11
  const rashi = RASHIS[navamshaRashiIndex];

  return {
    number: rashi.number,
    name: rashi.name
  };
}

/**
 * Checks if a planet is combust by proximity to the Sun
 */
export function checkCombustion(sunLon: number, planetLon: number, planetName: PlanetName): boolean {
  if (planetName === 'Sun' || planetName === 'Ascendant' || planetName === 'Rahu' || planetName === 'Ketu') {
    return false;
  }

  let diff = Math.abs(sunLon - planetLon);
  if (diff > 180) diff = 360 - diff;

  // Classical combustion limits in degrees
  const combustionLimits: Record<string, number> = {
    Moon: 12.0,
    Mars: 17.0,
    Mercury: 14.0, // 12° if retrograde
    Jupiter: 11.0,
    Venus: 10.0,   // 8° if retrograde
    Saturn: 15.0
  };

  const limit = combustionLimits[planetName] || 10.0;
  return diff <= limit;
}

/**
 * Calculates Baladi Avastha (Infant, Youth, Mature, Old, Dead) based on odd/even sign degrees
 */
export function getBaladiAvastha(degreeInRashi: number, rashiNumber: number): string {
  const isOdd = rashiNumber % 2 !== 0;
  const deg = degreeInRashi % 30;

  if (isOdd) {
    if (deg < 6) return 'Bala (Infant - 25% strength)';
    if (deg < 12) return 'Kumara (Youth - 50% strength)';
    if (deg < 18) return 'Yuva (Mature - 100% full strength)';
    if (deg < 24) return 'Vriddha (Elderly - minimal strength)';
    return 'Mrita (Dead - 0% strength)';
  } else {
    if (deg < 6) return 'Mrita (Dead - 0% strength)';
    if (deg < 12) return 'Vriddha (Elderly - minimal strength)';
    if (deg < 18) return 'Yuva (Mature - 100% full strength)';
    if (deg < 24) return 'Kumara (Youth - 50% strength)';
    return 'Bala (Infant - 25% strength)';
  }
}
