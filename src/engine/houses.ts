import { HouseInfo, PlanetaryPosition, PlanetName } from '../types/astrology';
import { RASHIS, HOUSES_DATA } from '../data/constants';
import { formatDMS } from '../utils/formatting';

/**
 * Calculates 12 Bhavas (Equal House System from Sidereal Lagna) and distributes planets into houses
 */
export function calculateHouses(
  lagnaLongitude: number,
  planets: PlanetaryPosition[]
): HouseInfo[] {
  const lagnaRashiIndex = Math.floor(lagnaLongitude / 30); // 0 to 11
  const houses: HouseInfo[] = [];

  for (let i = 0; i < 12; i++) {
    const houseNumber = i + 1; // 1 to 12
    const rashiIndex = (lagnaRashiIndex + i) % 12;
    const rashi = RASHIS[rashiIndex];
    const cuspLongitude = (lagnaLongitude + i * 30) % 360;
    const houseData = HOUSES_DATA[i];

    // Find planets located in this house
    const housePlanets = planets.filter((p) => {
      // Check if planet's sidereal longitude falls in this rashi/house
      const pRashiIndex = Math.floor(p.longitude / 30);
      return pRashiIndex === rashiIndex;
    });

    // Update house property in planet positions
    housePlanets.forEach((p) => {
      p.house = houseNumber;
    });

    houses.push({
      houseNumber,
      rashi: rashi.name,
      rashiNumber: rashi.number,
      rashiLord: rashi.lord,
      cuspLongitude,
      formattedDegree: formatDMS(cuspLongitude),
      planets: housePlanets,
      sanskritName: houseData.sanskritName,
      significance: houseData.significance
    });
  }

  return houses;
}
