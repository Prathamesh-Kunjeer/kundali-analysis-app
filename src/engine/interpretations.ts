import { 
  FullKundaliAnalysis, 
  PlanetaryPosition, 
  HouseInfo, 
  PanchangInfo, 
  RashiName, 
  PlanetName 
} from '../types/astrology';
import { RASHIS, NAKSHATRAS, PLANETS_DATA } from '../data/constants';
import { getNakshatraFromDegree, getRashiFromDegree } from '../utils/formatting';

/**
 * Calculates Vedic Panchang details for birth time
 */
export function calculatePanchang(
  sunLon: number,
  moonLon: number,
  birthDateString: string,
  birthTimeString: string,
  ayanamshaStr: string
): PanchangInfo {
  // Tithi: Each Tithi is 12° difference between Moon and Sun
  const diff = ((moonLon - sunLon + 360) % 360);
  const tithiIndex = Math.floor(diff / 12); // 0 to 29
  const tithiNumber = (tithiIndex % 15) + 1;
  const isShukla = tithiIndex < 15;

  const tithiNames = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
    isShukla ? 'Purnima (Full Moon)' : 'Amavasya (New Moon)'
  ];

  const nakshatra = getNakshatraFromDegree(moonLon);

  // Yoga: (Sun Lon + Moon Lon) / (13° 20')
  const sumLon = ((sunLon + moonLon) % 360);
  const yogaIndex = Math.floor(sumLon / (360.0 / 27.0)); // 0 to 26
  const yogaNames = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
    'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi',
    'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
    'Brahma', 'Indra', 'Vaidhriti'
  ];
  const inauspiciousYogas = [0, 5, 8, 9, 12, 14, 16, 18, 26];

  // Karana: Each half of Tithi (6°)
  const karanaIndex = Math.floor(diff / 6); // 0 to 59
  const movableKaranas = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)'];
  let karanaName = '';
  if (karanaIndex === 0) karanaName = 'Kimstughna';
  else if (karanaIndex >= 57) {
    const fixed = ['Shakuni', 'Chatushpada', 'Naga'];
    karanaName = fixed[karanaIndex - 57] || 'Bava';
  } else {
    karanaName = movableKaranas[(karanaIndex - 1) % 7];
  }

  // Vaar (Day of week)
  const [y, m, d] = birthDateString.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayIndex = dateObj.getDay(); // 0 = Sunday, 1 = Monday...
  const vaarDays: { name: string; lord: PlanetName }[] = [
    { name: 'Ravivaar (Sunday)', lord: 'Sun' },
    { name: 'Somvaar (Monday)', lord: 'Moon' },
    { name: 'Mangalvaar (Tuesday)', lord: 'Mars' },
    { name: 'Budhvaar (Wednesday)', lord: 'Mercury' },
    { name: 'Guruvaar (Thursday)', lord: 'Jupiter' },
    { name: 'Shukravaar (Friday)', lord: 'Venus' },
    { name: 'Shanivaar (Saturday)', lord: 'Saturn' }
  ];

  const vaar = vaarDays[dayIndex];

  // Rahu Kaal standard approximation (8 segments of day ~1.5 hours each)
  const rahuKaalPeriods = [
    '04:30 PM - 06:00 PM', // Sun
    '07:30 AM - 09:00 AM', // Mon
    '03:00 PM - 04:30 PM', // Tue
    '12:00 PM - 01:30 PM', // Wed
    '01:30 PM - 03:00 PM', // Thu
    '10:30 AM - 12:00 PM', // Fri
    '09:00 AM - 10:30 AM'  // Sat
  ];

  return {
    tithi: {
      name: `${isShukla ? 'Shukla Paksha' : 'Krishna Paksha'} ${tithiNames[tithiNumber - 1]}`,
      paksha: isShukla ? 'Shukla' : 'Krishna',
      number: tithiNumber
    },
    nakshatra: {
      name: nakshatra.name,
      number: nakshatra.number,
      lord: nakshatra.lord,
      pada: nakshatra.pada
    },
    yoga: {
      name: yogaNames[yogaIndex] || 'Sadhya',
      number: yogaIndex + 1,
      isAuspicious: !inauspiciousYogas.includes(yogaIndex)
    },
    karana: {
      name: karanaName,
      number: (karanaIndex % 11) + 1
    },
    vaar,
    sunSign: getRashiFromDegree(sunLon).name,
    moonSign: getRashiFromDegree(moonLon).name,
    ayanamsha: ayanamshaStr,
    rahuKaal: rahuKaalPeriods[dayIndex],
    gulikaKaal: '01:30 PM - 03:00 PM',
    yamaganda: '06:00 AM - 07:30 AM',
    abhijitMuhurat: '11:45 AM - 12:35 PM',
    sunrise: '06:12 AM',
    sunset: '06:48 PM'
  };
}

/**
 * Generates comprehensive Vedic interpretations and forecasts for all life domains
 */
export function generateVedicPredictions(
  ascendant: PlanetaryPosition,
  planets: PlanetaryPosition[],
  houses: HouseInfo[]
): {
  personality: {
    element: string;
    modality: string;
    nature: string;
    strengths: string[];
    weaknesses: string[];
    coreTraits: string;
  };
  predictions: {
    career: string;
    wealth: string;
    loveAndMarriage: string;
    health: string;
    spirituality: string;
  };
  luckyFactors: {
    luckyNumbers: number[];
    luckyColors: string[];
    luckyDays: string[];
    luckyDirections: string[];
    luckyGemstones: string[];
    friendlySigns: RashiName[];
    favorablePlanets: PlanetName[];
  };
} {
  const ascRashi = RASHIS[ascendant.rashiNumber - 1];
  const moon = planets.find(p => p.name === 'Moon') || planets[0];
  const sun = planets.find(p => p.name === 'Sun') || planets[0];
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const venus = planets.find(p => p.name === 'Venus');
  const saturn = planets.find(p => p.name === 'Saturn');
  const mars = planets.find(p => p.name === 'Mars');
  const mercury = planets.find(p => p.name === 'Mercury');

  const moonRashi = RASHIS[moon.rashiNumber - 1];

  // Personality synthesis
  const strengthsMap: Record<string, string[]> = {
    Aries: ['Courageous initiative', 'Dynamic executive power', 'Unshakable self-belief', 'Pioneering vision'],
    Taurus: ['Steadfast endurance', 'Financial pragmatism', 'Sensory refinement', 'Unwavering loyalty'],
    Gemini: ['Intellectual agility', 'Eloquent articulation', 'Versatile curiosity', 'Strategic negotiation'],
    Cancer: ['Deep emotional intuition', 'Protective empathy', 'Imaginative creativity', 'Nourishing care'],
    Leo: ['Natural majestic authority', 'Generous nobility', 'Inspiring leadership', 'Radiant magnetism'],
    Virgo: ['Analytical precision', 'Systematic problem-solving', 'High craftsmanship', 'Methodical dedication'],
    Libra: ['Harmonious diplomacy', 'Aesthetic brilliance', 'Equitable justice', 'Charming sociability'],
    Scorpio: ['Psychological penetration', 'Transformational resilience', 'Magnetic mystery', 'Intense dedication'],
    Sagittarius: ['Philosophical expansiveness', 'Optimistic truth-seeking', 'Higher moral code', 'Inspirational wisdom'],
    Capricorn: ['Enduring discipline', 'Strategic ambition', 'Institutional mastery', 'Pragmatic patience'],
    Aquarius: ['Visionary humanitarianism', 'Original inventiveness', 'Egalitarian ideals', 'Intellectual detachment'],
    Pisces: ['Spiritual transcendence', 'Universal compassion', 'Artistic intuition', 'Mystical insight']
  };

  const weaknessesMap: Record<string, string[]> = {
    Aries: ['Impatience', 'Restless impulsiveness', 'Occasional headstrong confrontation'],
    Taurus: ['Resistance to sudden changes', 'Possessive tendencies', 'Stubborn fixation'],
    Gemini: ['Scattered attention', 'Nervous restlessness', 'Overthinking trivialities'],
    Cancer: ['Over-sensitivity to moods', 'Emotional defensiveness', 'Clinging to past baggage'],
    Leo: ['Vulnerability to flattery', 'Domineering expectations', 'Prideful resistance to criticism'],
    Virgo: ['Hyper-critical perfectionism', 'Anxious micromanagement', 'Undue worry'],
    Libra: ['Indecisive hesitation', 'Avoidance of necessary friction', 'Over-accommodation'],
    Scorpio: ['Secretiveness', 'Reluctance to forgive slights', 'Possessive intensity'],
    Sagittarius: ['Tactless bluntness', 'Over-promising', 'Restlessness under routine'],
    Capricorn: ['Excessive sternness', 'Workaholic rigidity', 'Difficulty displaying vulnerability'],
    Aquarius: ['Emotional coolness', 'Unpredictable aloofness', 'Contrarian stubbornness'],
    Pisces: ['Escapist tendencies', 'Over-idealistic illusions', 'Blurred personal boundaries']
  };

  // House 10 Career interpretation
  const h10 = houses.find(h => h.houseNumber === 10);
  const h10Lord = h10?.rashiLord || 'Mercury';
  const h10Sign = h10?.rashi || 'Gemini';

  const careerReadings: Record<PlanetName, string> = {
    Sun: 'Public administration, government leadership, executive authority, entrepreneurship, and positions of prominent visibility.',
    Moon: 'Public relations, healthcare, culinary/hospitality industries, human resources, creative writing, and mass communications.',
    Mars: 'Engineering, military/defense, technology leadership, real estate development, surgery, athletics, and dynamic project management.',
    Mercury: 'Information technology, data science, journalism, financial analysis, marketing strategy, accounting, and advisory consultancies.',
    Jupiter: 'Higher education, law and judiciary, financial wealth management, corporate advisory, publishing, and spiritual/philosophical institutions.',
    Venus: 'Luxury commerce, design and architecture, entertainment/media, high fashion, fine arts, hospitality, and diplomatic relations.',
    Saturn: 'Heavy industry, civil engineering, institutional management, research and development, judiciary, mining, and supply chain logistics.',
    Rahu: 'Emerging technologies, artificial intelligence, international trade, aviation, cutting-edge innovation, and disruptive digital media.',
    Ketu: 'Spiritual teaching, cybersecurity, specialized medical research, data analysis, occult sciences, and behind-the-scenes strategy.',
    Ascendant: 'Executive administration, self-driven ventures, public-facing leadership.'
  };

  const careerForecast = `With your 10th house falling in ${h10Sign} and governed by ${h10Lord}, your professional karma thrives through ${careerReadings[h10Lord]} ${
    saturn?.house === 10 ? 'Saturn in the 10th bestows delayed yet monumental authority and unshakeable long-term prestige.' : ''
  } ${
    sun?.house === 10 ? 'Digbala Sun in the 10th confers natural royal executive aura and prominent recognition.' : ''
  }`;

  // Wealth forecast (2nd and 11th houses)
  const h2 = houses.find(h => h.houseNumber === 2);
  const h11 = houses.find(h => h.houseNumber === 11);
  const wealthForecast = `Wealth and assets are governed by ${h2?.rashiLord} (2nd house) and ${h11?.rashiLord} (11th house of gains). ${
    jupiter && [1, 2, 5, 9, 11].includes(jupiter.house) 
      ? 'Jupiter occupies an auspicious wealth house, indicating steady compounding of fortunes, multiple assets, and generous spending on auspicious deeds.'
      : 'Wealth accumulation is methodical and progressive; gains manifest through focused discipline and systematic investment portfolios.'
  }`;

  // Love and Marriage forecast (7th house)
  const h7 = houses.find(h => h.houseNumber === 7);
  const loveForecast = `Your 7th house of marriage in ${h7?.rashi} is ruled by ${h7?.rashiLord}. ${
    venus?.dignity === 'Exalted' || venus?.dignity === 'Own Sign'
      ? 'Venus is powerfully placed, ensuring a charming, cultured, and supportive life partner who brings elegance and happiness.'
      : `Your partner will embody the traits of ${h7?.rashi}, valuing loyalty and shared intellectual or cultural pursuits.`
  } Emotional transparency and mutual space will be the cornerstone of marital bliss.`;

  // Health forecast (1st and 6th houses)
  const h6 = houses.find(h => h.houseNumber === 6);
  const healthForecast = `Lagna in ${ascRashi.name} bestows robust constitutional vitality governed by the ${ascRashi.element} element. Guard against stress affecting the ${ascRashi.bodyPart}. Regular hydration, sattvic nutrition, and breathwork (Pranayama) ensure sustained physical energy.`;

  // Spirituality forecast (9th & 12th houses)
  const spiritualityForecast = `With 9th house ruled by ${houses[8]?.rashiLord}, your spiritual journey is grounded in deep intellectual inquiry and moral integrity. You are drawn to authentic wisdom traditions, meditation, and pilgrimages that awaken self-realization.`;

  return {
    personality: {
      element: ascRashi.element,
      modality: ascRashi.quality,
      nature: `${ascRashi.name} Ascendant with ${moonRashi.name} Moon Sign`,
      strengths: strengthsMap[ascRashi.name] || strengthsMap['Aries'],
      weaknesses: weaknessesMap[ascRashi.name] || weaknessesMap['Aries'],
      coreTraits: `You combine the outer vitality and driving ambition of ${ascRashi.name} (${ascRashi.sanskritName}) with the deep emotional inner landscape of ${moonRashi.name} (${moonRashi.sanskritName}). Guided by ${ascRashi.lord}, your destiny emphasizes independent leadership and continuous personal elevation.`
    },
    predictions: {
      career: careerForecast,
      wealth: wealthForecast,
      loveAndMarriage: loveForecast,
      health: healthForecast,
      spirituality: spiritualityForecast
    },
    luckyFactors: {
      luckyNumbers: ascRashi.luckyNumbers,
      luckyColors: ascRashi.luckyColors,
      luckyDays: [PLANETS_DATA[ascRashi.lord].day, 'Thursday'],
      luckyDirections: ['North-East', 'East'],
      luckyGemstones: [PLANETS_DATA[ascRashi.lord].gemstone, 'Yellow Sapphire'],
      friendlySigns: ['Leo', 'Sagittarius', 'Aries', 'Gemini'].filter(s => s !== ascRashi.name) as RashiName[],
      favorablePlanets: [ascRashi.lord, 'Jupiter', 'Sun']
    }
  };
}
