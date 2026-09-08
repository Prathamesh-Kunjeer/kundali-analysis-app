import { 
  KundaliMilanResult, 
  GunaScore, 
  PlanetaryPosition, 
  NakshatraInfo, 
  RashiName, 
  PlanetName 
} from '../types/astrology';
import { NAKSHATRAS, RASHIS, PLANETS_DATA } from '../data/constants';
import { getNakshatraFromDegree, getRashiFromDegree } from '../utils/formatting';
import { analyzeManglikDosha } from './doshas';

// Animal Yoni enmity matrix
const YONI_ENEMIES: Record<string, string> = {
  Horse: 'Buffalo', Buffalo: 'Horse',
  Elephant: 'Lion', Lion: 'Elephant',
  Sheep: 'Monkey', Monkey: 'Sheep',
  Serpent: 'Mongoose', Mongoose: 'Serpent',
  Dog: 'Hare', Hare: 'Dog',
  Cat: 'Rat', Rat: 'Cat',
  Cow: 'Tiger', Tiger: 'Cow'
};

/**
 * Calculates Ashtakoota 36 Guna Milan between Boy and Girl birth charts
 */
export function calculateKundaliMilan(
  boyPlanets: PlanetaryPosition[],
  girlPlanets: PlanetaryPosition[]
): KundaliMilanResult {
  const boyMoon = boyPlanets.find(p => p.name === 'Moon') || boyPlanets[0];
  const girlMoon = girlPlanets.find(p => p.name === 'Moon') || girlPlanets[0];

  const boyNak = getNakshatraFromDegree(boyMoon.longitude);
  const girlNak = getNakshatraFromDegree(girlMoon.longitude);

  const boyNakFull = NAKSHATRAS[boyNak.number - 1];
  const girlNakFull = NAKSHATRAS[girlNak.number - 1];

  const boyRashi = getRashiFromDegree(boyMoon.longitude);
  const girlRashi = getRashiFromDegree(girlMoon.longitude);

  const gunas: GunaScore[] = [];

  // 1. Varna (1 Point) - Spiritual & Ego compatibility
  const varnaRank: Record<string, number> = { Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1 };
  const boyVarnaScore = varnaRank[boyNakFull.varna] || 1;
  const girlVarnaScore = varnaRank[girlNakFull.varna] || 1;
  const varnaPoints = boyVarnaScore >= girlVarnaScore ? 1 : 0;

  gunas.push({
    name: 'Varna Koota',
    sanskritName: 'वर्ण कूट',
    maxPoints: 1,
    obtainedPoints: varnaPoints,
    boyAttribute: `${boyNakFull.varna} Varna`,
    girlAttribute: `${girlNakFull.varna} Varna`,
    description: 'Measures spiritual harmony, mutual respect and work ego balance.',
    status: varnaPoints === 1 ? 'Excellent' : 'Average'
  });

  // 2. Vashya (2 Points) - Mutual attraction & dominance
  // Rashi vashya mapping
  const getVashya = (rashiNum: number): string => {
    if ([1, 2, 9].includes(rashiNum)) return 'Chatushpada (Quadruped)';
    if ([3, 6, 7, 11].includes(rashiNum)) return 'Manava (Human)';
    if ([4, 12, 10].includes(rashiNum)) return 'Jalachara (Water creature)';
    if (rashiNum === 5) return 'Vanachara (Lion/Forest)';
    return 'Keeta (Scorpion/Insect)';
  };

  const boyVashya = getVashya(boyRashi.number);
  const girlVashya = getVashya(girlRashi.number);
  let vashyaPoints = 0;
  if (boyVashya === girlVashya) vashyaPoints = 2;
  else if (boyVashya.startsWith('Manava') && girlVashya.startsWith('Chatushpada')) vashyaPoints = 1;
  else if (boyVashya.startsWith('Chatushpada') && girlVashya.startsWith('Manava')) vashyaPoints = 1;
  else vashyaPoints = 0.5;

  gunas.push({
    name: 'Vashya Koota',
    sanskritName: 'वश्य कूट',
    maxPoints: 2,
    obtainedPoints: vashyaPoints,
    boyAttribute: boyVashya,
    girlAttribute: girlVashya,
    description: 'Calculates mutual magnetic attraction and emotional sway in partnership.',
    status: vashyaPoints >= 1.5 ? 'Excellent' : (vashyaPoints >= 1 ? 'Good' : 'Average')
  });

  // 3. Tara Koota (3 Points) - Destiny, health & longevity
  const distGtoB = ((boyNak.number - girlNak.number + 27) % 27) + 1;
  const distBtoG = ((girlNak.number - boyNak.number + 27) % 27) + 1;
  const tara1 = distGtoB % 9;
  const tara2 = distBtoG % 9;

  const inauspiciousTaras = [3, 5, 7]; // Vipat, Pratyak, Naidhana
  const isTara1Good = !inauspiciousTaras.includes(tara1);
  const isTara2Good = !inauspiciousTaras.includes(tara2);

  let taraPoints = 0;
  if (isTara1Good && isTara2Good) taraPoints = 3;
  else if (isTara1Good || isTara2Good) taraPoints = 1.5;
  else taraPoints = 0;

  gunas.push({
    name: 'Tara Koota (Dina)',
    sanskritName: 'तारा कूट',
    maxPoints: 3,
    obtainedPoints: taraPoints,
    boyAttribute: `Tara ${tara1}`,
    girlAttribute: `Tara ${tara2}`,
    description: 'Evaluates mutual health, fortune, vitality and destiny resonance.',
    status: taraPoints === 3 ? 'Excellent' : (taraPoints === 1.5 ? 'Good' : 'Average')
  });

  // 4. Yoni Koota (4 Points) - Biological & physical compatibility
  let yoniPoints = 0;
  const bYoni = boyNakFull.yoni;
  const gYoni = girlNakFull.yoni;

  if (bYoni === gYoni) {
    yoniPoints = 4;
  } else if (YONI_ENEMIES[bYoni] === gYoni) {
    yoniPoints = 0; // Sworn enemy Yonis
  } else {
    yoniPoints = 2; // Neutral / Friendly
  }

  gunas.push({
    name: 'Yoni Koota',
    sanskritName: 'योनि कूट',
    maxPoints: 4,
    obtainedPoints: yoniPoints,
    boyAttribute: `${bYoni} Yoni`,
    girlAttribute: `${gYoni} Yoni`,
    description: 'Assesses physical, biological and psychological temperament compatibility.',
    status: yoniPoints === 4 ? 'Excellent' : (yoniPoints >= 2 ? 'Good' : 'Dosha')
  });

  // 5. Graha Maitri (5 Points) - Mental wavelength & friendship
  const boyLord = boyRashi.lord;
  const girlLord = girlRashi.lord;
  let grahaPoints = 0;

  if (boyLord === girlLord) {
    grahaPoints = 5;
  } else {
    const bFriends = PLANETS_DATA[boyLord].friends;
    const bEnemies = PLANETS_DATA[boyLord].enemies;
    const gFriends = PLANETS_DATA[girlLord].friends;
    const gEnemies = PLANETS_DATA[girlLord].enemies;

    const bLikesG = bFriends.includes(girlLord);
    const gLikesB = gFriends.includes(boyLord);
    const bHatesG = bEnemies.includes(girlLord);
    const gHatesB = gEnemies.includes(boyLord);

    if (bLikesG && gLikesB) grahaPoints = 5;
    else if ((bLikesG && !gHatesB) || (gLikesB && !bHatesG)) grahaPoints = 4;
    else if (!bHatesG && !gHatesB) grahaPoints = 3;
    else if (bHatesG && gHatesB) grahaPoints = 0;
    else grahaPoints = 1;
  }

  gunas.push({
    name: 'Graha Maitri',
    sanskritName: 'ग्रहमैत्री कूट',
    maxPoints: 5,
    obtainedPoints: grahaPoints,
    boyAttribute: `${boyRashi.sanskritName} (${boyLord})`,
    girlAttribute: `${girlRashi.sanskritName} (${girlLord})`,
    description: 'Mental wavelength, friendship, intellectual understanding and worldview.',
    status: grahaPoints >= 4 ? 'Excellent' : (grahaPoints >= 3 ? 'Good' : (grahaPoints >= 1 ? 'Average' : 'Poor'))
  });

  // 6. Gana Koota (6 Points) - Temperament compatibility
  const bGana = boyNakFull.gana;
  const gGana = girlNakFull.gana;
  let ganaPoints = 0;

  if (bGana === gGana) {
    ganaPoints = 6;
  } else if ((bGana === 'Deva' && gGana === 'Manushya') || (bGana === 'Manushya' && gGana === 'Deva')) {
    ganaPoints = 5;
  } else if (bGana === 'Rakshasa' && gGana === 'Deva') {
    ganaPoints = 1;
  } else {
    ganaPoints = 0; // Gana Dosha
  }

  gunas.push({
    name: 'Gana Koota',
    sanskritName: 'गण कूट',
    maxPoints: 6,
    obtainedPoints: ganaPoints,
    boyAttribute: `${bGana} Gana`,
    girlAttribute: `${gGana} Gana`,
    description: 'Assesses behavioral temperament (Deva: divine, Manushya: mortal, Rakshasa: dominant).',
    status: ganaPoints >= 5 ? 'Excellent' : (ganaPoints > 0 ? 'Average' : 'Dosha')
  });

  // 7. Bhakoot Koota (7 Points) - Emotional & financial stability
  const rashiDist = ((girlRashi.number - boyRashi.number + 12) % 12) + 1;
  const inauspiciousRashiDist = [2, 12, 6, 8, 9, 5]; // 2/12, 6/8, 9/5
  const hasBhakootDosha = inauspiciousRashiDist.includes(rashiDist);

  // Bhakoot cancellation: same rashi lord or mutual friends
  const bhakootCancelled = boyLord === girlLord || (PLANETS_DATA[boyLord].friends.includes(girlLord) && PLANETS_DATA[girlLord].friends.includes(boyLord));
  const bhakootPoints = !hasBhakootDosha || bhakootCancelled ? 7 : 0;

  gunas.push({
    name: 'Bhakoot Koota',
    sanskritName: 'भकूट कूट',
    maxPoints: 7,
    obtainedPoints: bhakootPoints,
    boyAttribute: boyRashi.sanskritName,
    girlAttribute: girlRashi.sanskritName,
    description: 'Governs emotional health, financial growth, family happiness and long-term harmony.',
    status: bhakootPoints === 7 ? 'Excellent' : (bhakootCancelled ? 'Good' : 'Dosha')
  });

  // 8. Nadi Koota (8 Points) - Genetic & physiological compatibility
  const bNadi = boyNakFull.nadi;
  const gNadi = girlNakFull.nadi;
  const hasNadiDosha = bNadi === gNadi;

  // Nadi cancellation: different nakshatras in same rashi, or same nakshatra with different padas
  const nadiCancelled = hasNadiDosha && (boyNak.number !== girlNak.number || boyNak.pada !== girlNak.pada);
  const nadiPoints = !hasNadiDosha ? 8 : (nadiCancelled ? 8 : 0);

  gunas.push({
    name: 'Nadi Koota',
    sanskritName: 'नाड़ी कूट',
    maxPoints: 8,
    obtainedPoints: nadiPoints,
    boyAttribute: `${bNadi} Nadi`,
    girlAttribute: `${gNadi} Nadi`,
    description: 'Crucial for genetic vitality, progeny well-being, physiological harmony and longevity.',
    status: nadiPoints === 8 ? 'Excellent' : 'Dosha'
  });

  const totalScore = gunas.reduce((sum, g) => sum + g.obtainedPoints, 0);
  const percentage = Math.round((totalScore / 36) * 100);

  const boyManglik = analyzeManglikDosha(boyPlanets);
  const girlManglik = analyzeManglikDosha(girlPlanets);

  let compatibilityVerdict: KundaliMilanResult['compatibilityVerdict'] = 'Average';
  let recommendation = '';

  if (totalScore >= 28 && (!hasNadiDosha || nadiCancelled)) {
    compatibilityVerdict = 'Highly Auspicious';
    recommendation = `Outstanding Match (${totalScore}/36)! The planetary energies of both charts form a deeply harmonious, prosperous and enduring bond.`;
  } else if (totalScore >= 18) {
    compatibilityVerdict = 'Auspicious';
    recommendation = `Good Match (${totalScore}/36). The core fundamentals of relationship harmony, mutual respect and growth are well-aligned.`;
  } else if (totalScore >= 12) {
    compatibilityVerdict = 'Average';
    recommendation = `Average Match (${totalScore}/36). Key areas require conscious understanding and mutual accommodation. Consultation and traditional remedies are helpful.`;
  } else {
    compatibilityVerdict = 'Inauspicious';
    recommendation = `Below recommended threshold (${totalScore}/36). Notable friction detected in emotional or physiological koots. Detailed astrological remedies are advised before solemnization.`;
  }

  return {
    totalScore,
    maxScore: 36,
    percentage,
    gunas,
    nadiDosha: hasNadiDosha,
    nadiDoshaCancelled: nadiCancelled,
    bhakootDosha: hasBhakootDosha,
    bhakootDoshaCancelled: bhakootCancelled,
    boyManglik,
    girlManglik,
    compatibilityVerdict,
    recommendation
  };
}
