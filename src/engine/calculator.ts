import { 
  BirthDetails, 
  FullKundaliAnalysis, 
  PlanetaryPosition, 
  PlanetName 
} from '../types/astrology';
import { calculateAllPlanets } from './astronomy';
import { 
  formatDMS, 
  formatDegreeInSign, 
  getRashiFromDegree, 
  getNakshatraFromDegree, 
  getNavamshaRashi, 
  checkCombustion, 
  getBaladiAvastha 
} from '../utils/formatting';
import { calculateDignity, calculateAshtakavarga } from './strengths';
import { calculateHouses } from './houses';
import { generateAllDivisionalCharts } from './divisionalCharts';
import { calculateVimshottariDasha } from './dasha';
import { detectYogas } from './yogas';
import { analyzeManglikDosha, analyzeKaalSarpDosha, analyzeSadeSati } from './doshas';
import { generateGemstoneRecommendations, generateVedicRemedies } from './remedies';
import { calculatePanchang, generateVedicPredictions } from './interpretations';
import { PLANETS_DATA } from '../data/constants';

/**
 * Master calculation function: takes raw birth details and computes complete Vedic Kundali Analysis
 */
export function calculateFullKundali(details: BirthDetails): FullKundaliAnalysis {
  const [year, month, day] = details.dob.split('-').map(Number);
  const [hour, minute] = details.tob.split(':').map(Number);

  // 1. Raw Ephemeris Calculations
  const rawData = calculateAllPlanets(
    year,
    month,
    day,
    hour || 12,
    minute || 0,
    details.latitude,
    details.longitude,
    details.timezone
  );

  const sunRaw = rawData.planets.Sun;
  const ascRaw = rawData.planets.Ascendant;

  // 2. Build detailed PlanetaryPosition objects
  const planetNames: PlanetName[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  const processedPlanets: PlanetaryPosition[] = planetNames.map((name) => {
    const raw = rawData.planets[name];
    const rashi = getRashiFromDegree(raw.siderealLon);
    const nakshatra = getNakshatraFromDegree(raw.siderealLon);
    const navamsha = getNavamshaRashi(raw.siderealLon);
    const isCombust = checkCombustion(sunRaw.siderealLon, raw.siderealLon, name);
    const dignity = calculateDignity(name, rashi.name, rashi.degreeInRashi, rashi.lord);
    const avastha = getBaladiAvastha(rashi.degreeInRashi, rashi.number);

    return {
      name,
      sanskritName: PLANETS_DATA[name].sanskritName,
      longitude: raw.siderealLon,
      speed: raw.speed,
      isRetrograde: raw.isRetrograde,
      house: 1, // Will be set by calculateHouses
      rashi: rashi.name,
      rashiNumber: rashi.number,
      rashiLord: rashi.lord,
      degreeInRashi: rashi.degreeInRashi,
      formattedDegree: formatDegreeInSign(raw.siderealLon),
      nakshatra: nakshatra.name,
      nakshatraNumber: nakshatra.number,
      nakshatraLord: nakshatra.lord,
      pada: nakshatra.pada,
      dignity,
      isCombust,
      avastha,
      navamshaRashi: navamsha.name,
      navamshaRashiNumber: navamsha.number
    };
  });

  // Ascendant position
  const ascRashi = getRashiFromDegree(ascRaw.siderealLon);
  const ascNakshatra = getNakshatraFromDegree(ascRaw.siderealLon);
  const ascNavamsha = getNavamshaRashi(ascRaw.siderealLon);

  const processedAscendant: PlanetaryPosition = {
    name: 'Ascendant',
    sanskritName: 'Lagna',
    longitude: ascRaw.siderealLon,
    speed: 360,
    isRetrograde: false,
    house: 1,
    rashi: ascRashi.name,
    rashiNumber: ascRashi.number,
    rashiLord: ascRashi.lord,
    degreeInRashi: ascRashi.degreeInRashi,
    formattedDegree: formatDegreeInSign(ascRaw.siderealLon),
    nakshatra: ascNakshatra.name,
    nakshatraNumber: ascNakshatra.number,
    nakshatraLord: ascNakshatra.lord,
    pada: ascNakshatra.pada,
    dignity: 'Neutral',
    isCombust: false,
    avastha: getBaladiAvastha(ascRashi.degreeInRashi, ascRashi.number),
    navamshaRashi: ascNavamsha.name,
    navamshaRashiNumber: ascNavamsha.number
  };

  // 3. Calculate 12 Houses (Bhavas)
  const houses = calculateHouses(ascRaw.siderealLon, processedPlanets);

  // 4. Generate all Divisional Charts (D1 to D12, Chandra, Surya)
  const divisionalCharts = generateAllDivisionalCharts(processedAscendant, processedPlanets);

  // 5. Vimshottari Dasha Engine
  const moon = processedPlanets.find(p => p.name === 'Moon') || processedPlanets[0];
  const dasha = calculateVimshottariDasha(moon.longitude, details.dob, details.tob);

  // 6. Yogas Detection
  const yogas = detectYogas(processedPlanets, houses);

  // 7. Doshas Detection
  const manglik = analyzeManglikDosha(processedPlanets);
  const kaalSarp = analyzeKaalSarpDosha(processedPlanets);
  // Current Saturn in Aquarius (11) / Pisces (12)
  const sadeSati = analyzeSadeSati(moon.rashiNumber, 11);

  // 8. Ashtakavarga Matrix
  const planetHousesMap: Record<PlanetName, number> = {
    Sun: 1, Moon: 1, Mars: 1, Mercury: 1, Jupiter: 1, Venus: 1, Saturn: 1, Rahu: 1, Ketu: 1, Ascendant: 1
  };
  processedPlanets.forEach(p => {
    planetHousesMap[p.name] = p.house;
  });
  const ashtakavarga = calculateAshtakavarga(planetHousesMap, ascRashi.number);

  // 9. Gemstones & Remedies
  const gemstones = generateGemstoneRecommendations(houses, processedPlanets);
  const remedies = generateVedicRemedies(processedPlanets, houses);

  // 10. Panchang Calculation
  const panchang = calculatePanchang(
    sunRaw.siderealLon,
    moon.longitude,
    details.dob,
    details.tob,
    formatDMS(rawData.ayanamsha)
  );

  // 11. Interpretations & Predictions
  const { personality, predictions, luckyFactors } = generateVedicPredictions(
    processedAscendant,
    processedPlanets,
    houses
  );

  return {
    birthDetails: details,
    calculationDate: new Date().toISOString(),
    ayanamsa: rawData.ayanamsha,
    formattedAyanamsa: formatDMS(rawData.ayanamsha),
    ascendant: processedAscendant,
    planets: processedPlanets,
    houses,
    divisionalCharts,
    dasha,
    yogas,
    manglik,
    kaalSarp,
    sadeSati,
    ashtakavarga,
    gemstones,
    remedies,
    panchang,
    luckyFactors,
    personalityProfile: personality,
    predictions
  };
}
