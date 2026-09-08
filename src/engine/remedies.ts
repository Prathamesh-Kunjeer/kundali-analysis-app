import { 
  GemstoneRecommendation, 
  RemedyItem, 
  PlanetaryPosition, 
  HouseInfo, 
  PlanetName 
} from '../types/astrology';
import { PLANETS_DATA, RASHIS } from '../data/constants';

/**
 * Generates personalized Vedic Gemstones (Life, Lucky, Fortune stones) based on 1st, 5th, and 9th House Lords
 */
export function generateGemstoneRecommendations(
  houses: HouseInfo[],
  planets: PlanetaryPosition[]
): GemstoneRecommendation[] {
  const getLordForHouse = (hNum: number): PlanetName => {
    const h = houses.find(house => house.houseNumber === hNum);
    return h ? h.rashiLord : 'Sun';
  };

  const getRashiForHouse = (hNum: number) => {
    const h = houses.find(house => house.houseNumber === hNum);
    return h ? h.rashi : 'Aries';
  };

  const lord1 = getLordForHouse(1); // Lagna Lord -> Life Stone
  const lord5 = getLordForHouse(5); // 5th Lord -> Lucky Stone
  const lord9 = getLordForHouse(9); // 9th Lord -> Fortune Stone

  const recommendations: GemstoneRecommendation[] = [];

  const fingerMap: Record<PlanetName, string> = {
    Sun: 'Ring Finger (Right Hand)',
    Moon: 'Little Finger (Right Hand)',
    Mars: 'Ring Finger (Right Hand)',
    Mercury: 'Little Finger (Right Hand)',
    Jupiter: 'Index Finger (Right Hand)',
    Venus: 'Middle or Little Finger',
    Saturn: 'Middle Finger (Right Hand)',
    Rahu: 'Middle Finger',
    Ketu: 'Middle Finger',
    Ascendant: 'Ring Finger'
  };

  const colorHexMap: Record<PlanetName, string> = {
    Sun: '#EF4444',     // Ruby Red
    Moon: '#F8FAFC',    // Pearl White
    Mars: '#DC2626',    // Coral Red
    Mercury: '#10B981', // Emerald Green
    Jupiter: '#F59E0B', // Yellow Sapphire
    Venus: '#EC4899',   // Diamond / Opal
    Saturn: '#4F46E5',  // Blue Sapphire
    Rahu: '#7C3AED',    // Hessonite Honey
    Ketu: '#64748B',    // Cat's Eye Chrysoberyl
    Ascendant: '#D4AF37'
  };

  // 1. Life Stone (Lagna Lord)
  const p1Data = PLANETS_DATA[lord1];
  recommendations.push({
    type: 'Life Stone',
    name: p1Data.gemstone,
    hindiName: p1Data.hindiGemstone,
    planet: lord1,
    rashi: getRashiForHouse(1),
    metal: p1Data.metal,
    finger: fingerMap[lord1],
    auspiciousDay: p1Data.day,
    mantra: p1Data.beejMantra,
    benefits: `Fortifies physical vitality, self-confidence, immunity, personal charisma and shields against life adversities.`,
    cautions: `Should be energized with ${p1Data.mantra} during Shukla Paksha on a ${p1Data.day} morning before wearing.`,
    colorHex: colorHexMap[lord1]
  });

  // 2. Lucky Stone (5th Lord)
  if (lord5 !== lord1) {
    const p5Data = PLANETS_DATA[lord5];
    recommendations.push({
      type: 'Lucky Stone',
      name: p5Data.gemstone,
      hindiName: p5Data.hindiGemstone,
      planet: lord5,
      rashi: getRashiForHouse(5),
      metal: p5Data.metal,
      finger: fingerMap[lord5],
      auspiciousDay: p5Data.day,
      mantra: p5Data.beejMantra,
      benefits: `Enhances higher intellect, intuitive decision making, academic mastery, romance and blessings of Purva Punya (past merit).`,
      cautions: `Wear in standard panchadhatu or specified metal on ${p5Data.day} after sunrise.`,
      colorHex: colorHexMap[lord5]
    });
  }

  // 3. Fortune Stone (9th Lord)
  if (lord9 !== lord1 && lord9 !== lord5) {
    const p9Data = PLANETS_DATA[lord9];
    recommendations.push({
      type: 'Fortune Stone',
      name: p9Data.gemstone,
      hindiName: p9Data.hindiGemstone,
      planet: lord9,
      rashi: getRashiForHouse(9),
      metal: p9Data.metal,
      finger: fingerMap[lord9],
      auspiciousDay: p9Data.day,
      mantra: p9Data.beejMantra,
      benefits: `Activates destiny (Bhagya), attracts divine grace, professional elevation, wealth accumulation and spiritual elevation.`,
      cautions: `Purify in Ganga water and raw unpasteurized cow milk before first wear.`,
      colorHex: colorHexMap[lord9]
    });
  }

  return recommendations;
}

/**
 * Generates Vedic Mantras, Rudraksha, and behavioral remedies based on chart afflictions
 */
export function generateVedicRemedies(
  planets: PlanetaryPosition[],
  houses: HouseInfo[]
): RemedyItem[] {
  const remedies: RemedyItem[] = [];

  // Rudraksha based on Lagna
  const lagnaRashi = houses[0]?.rashi;
  const rudrakshaMap: Record<string, { title: string; benefits: string; instructions: string }> = {
    Aries: { title: '3-Mukhi Rudraksha (Agni Swaroop)', benefits: 'Boosts stamina, banishes self-doubt, cures lethargy.', instructions: 'Wear around neck in red silk thread on Tuesday.' },
    Taurus: { title: '6-Mukhi Rudraksha (Kartikeya Swaroop)', benefits: 'Increases charm, artistic creativity and luxury.', instructions: 'Wear in silver cap on Friday morning.' },
    Gemini: { title: '4-Mukhi Rudraksha (Brahma Swaroop)', benefits: 'Sharpened intellect, memory retention, vocal clarity.', instructions: 'Wear in green thread on Wednesday.' },
    Cancer: { title: '2-Mukhi Rudraksha (Ardhanareshwar)', benefits: 'Calms emotional turbulence, harmonious relationships.', instructions: 'Wear in white silk thread on Monday.' },
    Leo: { title: '1-Mukhi / 12-Mukhi Rudraksha (Surya Swaroop)', benefits: 'Supreme leadership, charisma, executive radiance.', instructions: 'Wear in gold or copper on Sunday.' },
    Virgo: { title: '4-Mukhi / 10-Mukhi Rudraksha', benefits: 'Business acumen, analytical brilliance, nerve relaxation.', instructions: 'Wear on Wednesday after chanting Budh mantra.' },
    Libra: { title: '6-Mukhi Rudraksha', benefits: 'Attracts wealth, relationship harmony and aesthetic discernment.', instructions: 'Wear on Friday in white or silver thread.' },
    Scorpio: { title: '3-Mukhi Rudraksha', benefits: 'Overcomes obstacles, fearlessness, protects from negativity.', instructions: 'Wear on Tuesday with Hanuman blessings.' },
    Sagittarius: { title: '5-Mukhi Rudraksha (Panch Brahma)', benefits: 'Spiritual knowledge, peace of mind, high status.', instructions: 'Wear in yellow silk thread on Thursday.' },
    Capricorn: { title: '7-Mukhi / 14-Mukhi Rudraksha (Mahalaxmi / Hanuman)', benefits: 'Brings stability, career breakthrough, clears debt.', instructions: 'Wear on Saturday morning in blue thread.' },
    Aquarius: { title: '7-Mukhi Rudraksha', benefits: 'Financial abundance, visionary thinking, social goodwill.', instructions: 'Wear on Saturday with Shani Beej mantra.' },
    Pisces: { title: '5-Mukhi Rudraksha', benefits: 'Divine intuition, inner peace, righteous fortune.', instructions: 'Wear on Thursday after morning bath.' }
  };

  const rudrakshaInfo = rudrakshaMap[lagnaRashi || 'Aries'];
  remedies.push({
    category: 'Rudraksha',
    title: rudrakshaInfo.title,
    targetPlanet: houses[0]?.rashiLord || 'Sun',
    instructions: rudrakshaInfo.instructions,
    benefits: rudrakshaInfo.benefits
  });

  // Mantras for functional benefics and afflicted planets
  const afflictedPlanets = planets.filter(p => p.dignity === 'Debilitated' || p.isCombust || p.dignity === 'Enemy');

  for (const p of afflictedPlanets.slice(0, 3)) {
    const pData = PLANETS_DATA[p.name];
    remedies.push({
      category: 'Mantra',
      title: `${p.sanskritName} Beej Mantra Chanting`,
      targetPlanet: p.name,
      instructions: `Chant ${pData.beejMantra} (108 times daily using Rudraksha/Tulsi mala) on ${pData.day}s.`,
      benefits: `Pacifies afflicted ${p.name} energy, converting friction into constructive strength.`
    });

    remedies.push({
      category: 'Charity',
      title: `${p.sanskritName} Danam (Charitable Offering)`,
      targetPlanet: p.name,
      instructions: `Donate items associated with ${p.name} (${pData.color} cloths, relevant grains or meals) on ${pData.day} mornings.`,
      benefits: `Mitigates karmic debts associated with ${p.name} and fosters peaceful progress.`
    });
  }

  // General Vedic Lifestyle Upay
  remedies.push({
    category: 'Lifestyle',
    title: 'Surya Namaskar & Gayatri Meditation',
    targetPlanet: 'Sun',
    instructions: 'Perform Surya Namaskar and 11 rounds of the Gayatri Mantra at dawn facing East.',
    benefits: 'Enhances overall solar aura, cognitive clarity, prana vitality, and aligns cosmic energy.'
  });

  return remedies;
}
