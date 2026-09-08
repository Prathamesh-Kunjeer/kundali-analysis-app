import { PlanetName, RashiName, DignityType, AshtakavargaResult } from '../types/astrology';
import { PLANETS_DATA } from '../data/constants';

/**
 * Calculates planetary dignity considering Exaltation, Debilitation, Moolatrikona, Own sign, and Panchadha Maitri
 */
export function calculateDignity(
  planet: PlanetName,
  rashi: RashiName,
  degreeInRashi: number,
  signLord: PlanetName
): DignityType {
  if (planet === 'Ascendant') return 'Neutral';

  const data = PLANETS_DATA[planet];

  // Exaltation check
  if (rashi === data.exaltationSign) {
    return 'Exalted';
  }

  // Debilitation check
  if (rashi === data.debilitationSign) {
    return 'Debilitated';
  }

  // Moolatrikona check
  if (
    rashi === data.moolatrikonaSign &&
    degreeInRashi >= data.moolatrikonaDegree[0] &&
    degreeInRashi <= data.moolatrikonaDegree[1]
  ) {
    return 'Moolatrikona';
  }

  // Own Sign check
  if (data.ownSigns.includes(rashi)) {
    return 'Own Sign';
  }

  // Naisargika (Natural) Friendship check
  const isNaturalFriend = data.friends.includes(signLord);
  const isNaturalEnemy = data.enemies.includes(signLord);

  if (isNaturalFriend) {
    return 'Friend';
  } else if (isNaturalEnemy) {
    return 'Enemy';
  } else {
    return 'Neutral';
  }
}

/**
 * Calculates Ashtakavarga (BAV for 7 planets and total SAV for 12 houses)
 * Using standard Parashari Ashtakavarga rules
 */
export function calculateAshtakavarga(
  planetHouses: Record<PlanetName, number>,
  lagnaRashiNumber: number
): AshtakavargaResult {
  const planets: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  // Base points distribution templates (Parashari rules for BAV)
  const bavRules: Record<string, Record<string, number[]>> = {
    Sun: {
      Sun: [1, 2, 4, 7, 8, 9, 10, 11],
      Moon: [3, 6, 10, 11],
      Mars: [1, 2, 4, 7, 8, 9, 10, 11],
      Mercury: [3, 5, 6, 9, 10, 11, 12],
      Jupiter: [5, 6, 9, 11],
      Venus: [6, 7, 12],
      Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
      Ascendant: [3, 4, 6, 10, 11, 12]
    },
    Moon: {
      Sun: [3, 6, 7, 8, 10, 11],
      Moon: [1, 3, 6, 7, 10, 11],
      Mars: [2, 3, 5, 6, 9, 10, 11],
      Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
      Jupiter: [1, 4, 7, 8, 10, 11, 12],
      Venus: [3, 4, 5, 7, 9, 10, 11],
      Saturn: [3, 5, 6, 11],
      Ascendant: [3, 6, 10, 11]
    },
    Mars: {
      Sun: [3, 5, 6, 10, 11],
      Moon: [3, 6, 11],
      Mars: [1, 2, 4, 7, 8, 10, 11],
      Mercury: [3, 5, 6, 11],
      Jupiter: [6, 10, 11, 12],
      Venus: [6, 8, 11, 12],
      Saturn: [1, 4, 7, 8, 9, 10, 11],
      Ascendant: [1, 3, 6, 10, 11]
    },
    Mercury: {
      Sun: [5, 6, 9, 11, 12],
      Moon: [2, 4, 6, 8, 10, 11],
      Mars: [1, 2, 4, 7, 8, 9, 10, 11],
      Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
      Jupiter: [6, 8, 11, 12],
      Venus: [1, 2, 3, 4, 5, 8, 9, 11],
      Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
      Ascendant: [1, 2, 4, 6, 8, 10, 11]
    },
    Jupiter: {
      Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
      Moon: [2, 5, 7, 9, 11],
      Mars: [1, 2, 4, 7, 8, 10, 11],
      Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
      Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
      Venus: [2, 5, 6, 9, 10, 11],
      Saturn: [3, 5, 6, 12],
      Ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11]
    },
    Venus: {
      Sun: [8, 11, 12],
      Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
      Mars: [3, 5, 6, 9, 11, 12],
      Mercury: [3, 5, 6, 9, 11],
      Jupiter: [5, 8, 9, 10, 11],
      Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
      Saturn: [3, 4, 5, 8, 9, 10, 11],
      Ascendant: [1, 2, 3, 4, 5, 8, 9, 11]
    },
    Saturn: {
      Sun: [1, 2, 4, 7, 8, 10, 11],
      Moon: [3, 6, 11],
      Mars: [3, 5, 6, 10, 11, 12],
      Mercury: [6, 8, 9, 10, 11, 12],
      Jupiter: [5, 6, 11, 12],
      Venus: [6, 11, 12],
      Saturn: [3, 5, 6, 11],
      Ascendant: [1, 3, 4, 6, 10, 11]
    }
  };

  const bavResults: { planet: PlanetName; points: number[] }[] = [];
  const savPoints = new Array(12).fill(0);

  for (const targetPlanet of planets) {
    const points = new Array(12).fill(0);
    const rule = bavRules[targetPlanet] || {};

    for (const sourcePlanet of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Ascendant'] as PlanetName[]) {
      const sourceHouse = planetHouses[sourcePlanet] || 1;
      const benefics = rule[sourcePlanet] || [];

      for (const hOffset of benefics) {
        // House index (0 to 11) relative to Lagna
        const hIndex = (sourceHouse - 1 + (hOffset - 1)) % 12;
        points[hIndex] += 1;
      }
    }

    bavResults.push({ planet: targetPlanet, points });

    for (let i = 0; i < 12; i++) {
      savPoints[i] += points[i];
    }
  }

  const totalSavPoints = savPoints.reduce((a, b) => a + b, 0);

  return {
    bav: bavResults,
    sav: savPoints,
    totalSavPoints
  };
}
