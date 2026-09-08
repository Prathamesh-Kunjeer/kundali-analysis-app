import { DivisionalChart, DivisionalChartType, PlanetaryPosition, PlanetName, RashiName } from '../types/astrology';
import { RASHIS } from '../data/constants';

/**
 * Calculates a specific divisional sign index (1-12) for a given longitude
 */
export function getDivisionalRashiNumber(longitude: number, divisionType: DivisionalChartType): number {
  const norm = ((longitude % 360) + 360) % 360;
  const rashiIndex = Math.floor(norm / 30); // 0 to 11
  const signNumber = rashiIndex + 1; // 1 to 12
  const degInSign = norm % 30;
  const isOdd = signNumber % 2 !== 0;

  switch (divisionType) {
    case 'D1':
    case 'Chandra':
    case 'Surya':
      return signNumber;

    case 'D2': {
      // Hora (2 parts of 15°)
      if (isOdd) {
        return degInSign < 15 ? 5 : 4; // 1st half Sun (Leo), 2nd half Moon (Cancer)
      } else {
        return degInSign < 15 ? 4 : 5; // 1st half Moon (Cancer), 2nd half Sun (Leo)
      }
    }

    case 'D3': {
      // Drekkana (3 parts of 10°)
      const part = Math.floor(degInSign / 10); // 0, 1, 2
      if (part === 0) return signNumber;
      if (part === 1) return ((signNumber - 1 + 4) % 12) + 1; // 5th sign
      return ((signNumber - 1 + 8) % 12) + 1; // 9th sign
    }

    case 'D7': {
      // Saptamsha (7 parts of 4.285714°)
      const part = Math.floor(degInSign / (30 / 7));
      const startSign = isOdd ? signNumber : ((signNumber - 1 + 6) % 12) + 1; // 7th sign for even
      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D9': {
      // Navamsha (9 parts of 3.333333°)
      const part = Math.floor(degInSign / (30 / 9));
      let startSign = 1;
      const element = RASHIS[rashiIndex].element;
      if (element === 'Fire') startSign = 1; // Aries
      else if (element === 'Earth') startSign = 10; // Capricorn
      else if (element === 'Air') startSign = 7; // Libra
      else if (element === 'Water') startSign = 4; // Cancer
      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D10': {
      // Dashamsha (10 parts of 3°)
      const part = Math.floor(degInSign / 3);
      const startSign = isOdd ? signNumber : ((signNumber - 1 + 8) % 12) + 1; // 9th sign for even
      return ((startSign - 1 + part) % 12) + 1;
    }

    case 'D12': {
      // Dwadashamsha (12 parts of 2.5°)
      const part = Math.floor(degInSign / 2.5);
      return ((signNumber - 1 + part) % 12) + 1;
    }

    default:
      return signNumber;
  }
}

/**
 * Builds all Divisional charts (D1 to D12, Chandra, Surya)
 */
export function generateAllDivisionalCharts(
  ascendant: PlanetaryPosition,
  planets: PlanetaryPosition[]
): Record<DivisionalChartType, DivisionalChart> {
  const chartTypes: {
    type: DivisionalChartType;
    title: string;
    sanskritTitle: string;
    purpose: string;
  }[] = [
    { type: 'D1', title: 'Lagna Chart', sanskritTitle: 'लग्न कुण्डली (D1)', purpose: 'Physical body, general destiny, personality & overall life' },
    { type: 'D9', title: 'Navamsha Chart', sanskritTitle: 'नवांश कुण्डली (D9)', purpose: 'Marriage, dharma, inner soul potential, fortune in 2nd half of life' },
    { type: 'D10', title: 'Dashamsha Chart', sanskritTitle: 'दशांश कुण्डली (D10)', purpose: 'Career, profession, social status, power & fame' },
    { type: 'D7', title: 'Saptamsha Chart', sanskritTitle: 'सप्तांश कुण्डली (D7)', purpose: 'Children, progeny, lineage & creative legacy' },
    { type: 'D2', title: 'Hora Chart', sanskritTitle: 'होरा कुण्डली (D2)', purpose: 'Wealth, financial assets, treasury & prosperity' },
    { type: 'D3', title: 'Drekkana Chart', sanskritTitle: 'द्रेष्काण कुण्डली (D3)', purpose: 'Siblings, courage, initiative, stamina & vitality' },
    { type: 'D12', title: 'Dwadashamsha Chart', sanskritTitle: 'द्वादशांश कुण्डली (D12)', purpose: 'Parents, heritage, ancestral karma & past lives' },
    { type: 'Chandra', title: 'Moon Chart', sanskritTitle: 'चन्द्र कुण्डली', purpose: 'Mind, emotional state, subconscious inclinations & mental peace' },
    { type: 'Surya', title: 'Sun Chart', sanskritTitle: 'सूर्य कुण्डली', purpose: 'Soul vitality, public authority, father & physical energy' }
  ];

  const result: Partial<Record<DivisionalChartType, DivisionalChart>> = {};

  for (const info of chartTypes) {
    let ascRashiNumber = 1;

    if (info.type === 'Chandra') {
      const moon = planets.find(p => p.name === 'Moon');
      ascRashiNumber = moon ? moon.rashiNumber : 1;
    } else if (info.type === 'Surya') {
      const sun = planets.find(p => p.name === 'Sun');
      ascRashiNumber = sun ? sun.rashiNumber : 1;
    } else {
      ascRashiNumber = getDivisionalRashiNumber(ascendant.longitude, info.type);
    }

    const houses: DivisionalChart['houses'] = [];

    for (let h = 1; h <= 12; h++) {
      const rashiNum = ((ascRashiNumber - 1 + (h - 1)) % 12) + 1;
      const rashi = RASHIS[rashiNum - 1];

      // Find planets in this divisional rashi
      const housePlanets: DivisionalChart['houses'][0]['planets'] = [];

      for (const p of planets) {
        const pDivRashi = getDivisionalRashiNumber(p.longitude, info.type);
        if (pDivRashi === rashiNum) {
          housePlanets.push({
            name: p.name,
            sanskritName: p.sanskritName,
            isRetrograde: p.isRetrograde,
            isCombust: p.isCombust
          });
        }
      }

      houses.push({
        houseNumber: h,
        rashiNumber: rashiNum,
        rashi: rashi.name,
        planets: housePlanets
      });
    }

    result[info.type] = {
      type: info.type,
      title: info.title,
      sanskritTitle: info.sanskritTitle,
      purpose: info.purpose,
      ascendantRashiNumber: ascRashiNumber,
      houses
    };
  }

  return result as Record<DivisionalChartType, DivisionalChart>;
}
