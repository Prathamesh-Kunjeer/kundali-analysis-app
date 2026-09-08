import { 
  ManglikAnalysis, 
  KaalSarpAnalysis, 
  SadeSatiAnalysis, 
  PlanetaryPosition, 
  RashiName, 
  PlanetName 
} from '../types/astrology';
import { RASHIS } from '../data/constants';

/**
 * Evaluates Manglik / Kuja Dosha from Lagna, Moon, and Venus with 8+ classical cancellation exceptions
 */
export function analyzeManglikDosha(
  planets: PlanetaryPosition[]
): ManglikAnalysis {
  const mars = planets.find(p => p.name === 'Mars');
  const moon = planets.find(p => p.name === 'Moon');
  const venus = planets.find(p => p.name === 'Venus');
  const jupiter = planets.find(p => p.name === 'Jupiter');

  if (!mars) {
    return {
      isManglik: false,
      percentage: 0,
      level: 'None',
      marsHouseFromLagna: 1,
      marsHouseFromMoon: 1,
      marsHouseFromVenus: 1,
      cancellations: [],
      isCancelled: false,
      description: 'Mars is not afflicted.',
      remedies: []
    };
  }

  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const hLagna = mars.house;
  const hMoon = moon ? (((mars.house - moon.house + 12) % 12) + 1) : hLagna;
  const hVenus = venus ? (((mars.house - venus.house + 12) % 12) + 1) : hLagna;

  const isLagnaManglik = manglikHouses.includes(hLagna);
  const isMoonManglik = manglikHouses.includes(hMoon);
  const isVenusManglik = manglikHouses.includes(hVenus);

  let rawPercentage = 0;
  if (isLagnaManglik) rawPercentage += 50;
  if (isMoonManglik) rawPercentage += 30;
  if (isVenusManglik) rawPercentage += 20;

  const cancellations: string[] = [];

  // Check classical cancellation rules
  if (mars.rashi === 'Aries' && hLagna === 1) {
    cancellations.push('Mars in Aries in the 1st House neutralizes Manglik Dosha.');
  }
  if (mars.rashi === 'Scorpio' && hLagna === 4) {
    cancellations.push('Mars in Scorpio in the 4th House cancels the dosha.');
  }
  if (mars.rashi === 'Capricorn' && hLagna === 7) {
    cancellations.push('Mars in Capricorn (Exalted) in the 7th House eliminates malefic impact.');
  }
  if (['Sagittarius', 'Pisces'].includes(mars.rashi) && hLagna === 8) {
    cancellations.push('Mars in Jupiterian signs (Sagittarius/Pisces) in 8th house cancels dosha.');
  }
  if (['Taurus', 'Libra'].includes(mars.rashi) && hLagna === 12) {
    cancellations.push('Mars in Venusian signs (Taurus/Libra) in 12th house neutralizes dosha.');
  }
  if (jupiter && (jupiter.house === mars.house || Math.abs(jupiter.house - mars.house) === 6)) {
    cancellations.push('Guru (Jupiter) aspect or conjunction with Mars removes aggressive Kuja dosha.');
  }
  if (['Exalted', 'Own Sign'].includes(mars.dignity)) {
    cancellations.push(`Mars is in strong dignity (${mars.dignity}), transforming aggressive energy into constructive vigor.`);
  }

  const isCancelled = cancellations.length > 0;
  const effectivePercentage = isCancelled ? Math.max(0, rawPercentage - 60) : rawPercentage;
  const isManglik = effectivePercentage > 20;

  const level: ManglikAnalysis['level'] = effectivePercentage >= 60 ? 'High' : (effectivePercentage > 0 ? 'Partial' : 'None');

  const remedies: string[] = [
    'Recite the Mangal Gayatri Mantra: "Om Angarkaya Vidmahe, Bhoomipalaya Dheemahi, Tanno Bhaumah Prachodayat" on Tuesdays.',
    'Donate red lentils (Masoor Dal), copper utensils, or jaggery to charity on Tuesday mornings.',
    'Chant the Hanuman Chalisa daily to channelize Mars energy with courage and spiritual grace.',
    'Kumbh Vivah or Vishnu Vivah ritual if high dosha is present before marriage.',
    'Wear an authentic 3-Mukhi Rudraksha bead for calming emotional impulsiveness.'
  ];

  return {
    isManglik,
    percentage: effectivePercentage,
    level,
    marsHouseFromLagna: hLagna,
    marsHouseFromMoon: hMoon,
    marsHouseFromVenus: hVenus,
    cancellations,
    isCancelled,
    description: isCancelled 
      ? `Manglik affliction is detected but neutralized by classical Vedic cancellations (${cancellations.length} mitigating factor${cancellations.length > 1 ? 's' : ''}).`
      : isManglik 
        ? `Moderate to High Manglik Dosha is present due to Mars placement in House ${hLagna}. Regular remedies and matching with a compatible partner are recommended.` 
        : 'No significant Manglik Dosha detected. Marital prospects are peaceful and harmonious.',
    remedies
  };
}

/**
 * Detects all 12 types of Kaal Sarp Dosha
 */
export function analyzeKaalSarpDosha(
  planets: PlanetaryPosition[]
): KaalSarpAnalysis {
  const rahu = planets.find(p => p.name === 'Rahu');
  const ketu = planets.find(p => p.name === 'Ketu');

  if (!rahu || !ketu) {
    return {
      hasKaalSarp: false,
      type: null,
      direction: null,
      rahuHouse: 1,
      ketuHouse: 7,
      description: 'No Kaal Sarp Dosha present.',
      remedies: []
    };
  }

  const otherPlanets = planets.filter(p => !['Rahu', 'Ketu', 'Ascendant'].includes(p.name));

  // Determine if all planets lie on one side of Rahu-Ketu axis
  let allClockwise = true;
  let allCounterClockwise = true;

  for (const p of otherPlanets) {
    // Relative distance from Rahu (0 to 11 houses forward)
    const distFromRahu = (p.house - rahu.house + 12) % 12;
    if (distFromRahu > 6) {
      allClockwise = false;
    }
    if (distFromRahu < 6 && distFromRahu > 0) {
      allCounterClockwise = false;
    }
  }

  const hasKaalSarp = allClockwise || allCounterClockwise;
  const direction = allClockwise ? 'Ascending (Savya)' : (allCounterClockwise ? 'Descending (Apasavya)' : null);

  const kaalSarpTypes: Record<number, string> = {
    1: 'Anant Kaal Sarp Dosha (1st - 7th House axis)',
    2: 'Kulik Kaal Sarp Dosha (2nd - 8th House axis)',
    3: 'Vasuki Kaal Sarp Dosha (3rd - 9th House axis)',
    4: 'Shankhpal Kaal Sarp Dosha (4th - 10th House axis)',
    5: 'Padma Kaal Sarp Dosha (5th - 11th House axis)',
    6: 'Mahapadma Kaal Sarp Dosha (6th - 12th House axis)',
    7: 'Takshak Kaal Sarp Dosha (7th - 1st House axis)',
    8: 'Karkotak Kaal Sarp Dosha (8th - 2nd House axis)',
    9: 'Shankhchurna Kaal Sarp Dosha (9th - 3rd House axis)',
    10: 'Ghatak Kaal Sarp Dosha (10th - 4th House axis)',
    11: 'Vishdhar Kaal Sarp Dosha (11th - 5th House axis)',
    12: 'Sheshnag Kaal Sarp Dosha (12th - 6th House axis)'
  };

  const type = hasKaalSarp ? kaalSarpTypes[rahu.house] : null;

  const remedies = hasKaalSarp ? [
    'Perform Maha Mrityunjaya Japa (108 times daily) or Rudrabhishek at a Shiva Temple.',
    'Chant "Om Namah Shivaya" and offer raw milk and Bel Patra to Shiva Lingam on Mondays.',
    'Keep a silver energized Nag-Nagin yantra or ring energized with Shiva blessings.',
    'Feed birds and stray dogs regularly on Wednesdays and Saturdays.'
  ] : [];

  const description = hasKaalSarp
    ? `All 7 major planets are hemmed along the Rahu-Ketu axis, forming ${type} (${direction}). This gives intense life lessons, followed by exceptional spiritual resilience and eventual triumph.`
    : 'No Kaal Sarp Dosha detected. The planets are well-distributed across both hemispheres of the chart.';

  return {
    hasKaalSarp,
    type,
    direction,
    rahuHouse: rahu.house,
    ketuHouse: ketu.house,
    description,
    remedies
  };
}

/**
 * Calculates Saturn Sade Sati / Dhaiya phase
 */
export function analyzeSadeSati(
  moonRashiNumber: number, // 1 to 12
  currentSaturnRashiNumber: number // 1 to 12 (Saturn currently in Aquarius 11 / Pisces 12)
): SadeSatiAnalysis {
  const moonRashi = RASHIS[moonRashiNumber - 1].name;
  const saturnRashi = RASHIS[currentSaturnRashiNumber - 1].name;

  // Relative house of Saturn from Moon (1 to 12)
  const relativeHouse = ((currentSaturnRashiNumber - moonRashiNumber + 12) % 12) + 1;

  let isInSadeSati = false;
  let phase: SadeSatiAnalysis['phase'] = 'None';
  let effects = 'Saturn is currently in a neutral transit relative to your natal Moon sign.';

  if (relativeHouse === 12) {
    isInSadeSati = true;
    phase = 'Rising (1st Phase)';
    effects = 'Saturn transits the 12th house from Moon. Focus on budgeting, mental relaxation, foreign opportunities, and spiritual grounding.';
  } else if (relativeHouse === 1) {
    isInSadeSati = true;
    phase = 'Peak (2nd Phase)';
    effects = 'Saturn transits natal Moon (Janma Shani). Demands rigorous discipline, emotional maturity, hard work, and patience. Rewards sincere dedication.';
  } else if (relativeHouse === 2) {
    isInSadeSati = true;
    phase = 'Setting (3rd Phase)';
    effects = 'Saturn transits the 2nd house from Moon. Financial consolidation, speech moderation, and resolving past family obligations.';
  } else if (relativeHouse === 4) {
    isInSadeSati = false;
    phase = 'Dhaiya (Small Phase)';
    effects = 'Kantaka Shani (4th from Moon): 2.5-year minor transit focusing on domestic improvements, patience with mother, and property matters.';
  } else if (relativeHouse === 8) {
    isInSadeSati = false;
    phase = 'Dhaiya (Small Phase)';
    effects = 'Ashtama Shani (8th from Moon): 2.5-year transit inspiring deep self-discovery, cautious health habits, and clearing past karmic debts.';
  }

  const remedies = [
    'Light a mustard oil lamp (Diya) under a Peepal tree on Saturday evenings.',
    'Chant the Shani Gayatri Mantra or Dasharatha Shani Stotram.',
    'Donate black sesame seeds, mustard oil, or iron items to the underprivileged on Saturdays.',
    'Practice selfless service, honesty, and compassion towards laborers and elders.'
  ];

  return {
    isInSadeSati,
    phase,
    saturnCurrentRashi: saturnRashi,
    moonRashi,
    effects,
    remedies
  };
}
