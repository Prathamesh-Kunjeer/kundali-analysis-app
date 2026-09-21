// ============================================================
//  KUNDALI MATCHING ENGINE — Layer 2 Pure Astrological Rules
//  Orchestrates comprehensive two-chart compatibility across
//  8 distinct Vedic analysis dimensions.
//
//  Zero UI imports, 100% deterministic, evidence-based.
// ============================================================

import type { KundaliChart, Planet, BodyPlanet, Sign } from './models';
import { RASHIS, RASHI_BY_NAME } from './constants';
import { PLANETS_DATA } from '../data/constants';
import { calculateKundaliMilan } from '../engine/matchmaking';
import { analyzeManglikDosha } from '../engine/doshas';
import { buildDivisionalChart } from './varga';
import type { PlanetaryPosition, PlanetName, RashiName, DignityType } from '../types/astrology';

// ─── Data Models ─────────────────────────────────────────────────────────────

export type CompatibilityStatus = 'Supportive' | 'Mixed' | 'Needs Attention';

export interface GunaDetail {
  name: string;
  sanskritName: string;
  maxPoints: number;
  obtainedPoints: number;
  personAAttribute: string;
  personBAttribute: string;
  description: string;
  status: 'Excellent' | 'Good' | 'Average' | 'Dosha';
}

export interface AshtakootaResult {
  totalScore: number;
  maxScore: 36;
  percentage: number;
  verdict: string;
  recommendation: string;
  gunas: GunaDetail[];
  nadiDosha: boolean;
  nadiDoshaCancelled: boolean;
  bhakootDosha: boolean;
  bhakootDoshaCancelled: boolean;
}

export interface PlanetPairInsight {
  id: string;
  planetA: string;
  planetB: string;
  relationshipType: 'SamePlanet' | 'CrossChart';
  signA: string;
  signB: string;
  houseA: number;
  houseB: number;
  signDistance: number; // 1 to 12
  signDistanceLabel: string;
  friendship: 'Friends' | 'Neutral' | 'Enemies' | 'Same';
  hasAspect: boolean;
  aspectDescription?: string;
  status: CompatibilityStatus;
  headline: string;
  whatItMeans: string;
  why: string;
  positiveSide: string;
  possibleChallenge: string;
  priorityScore: number;
}

export interface HouseOverlayInsight {
  id: string;
  fromPerson: string;
  toPerson: string;
  planet: string;
  planetSign: string;
  houseInTarget: number;
  targetSign: string;
  status: CompatibilityStatus;
  theme: string;
  whatItMeans: string;
  why: string;
  positiveSide: string;
  possibleChallenge: string;
  priorityScore: number;
}

export interface MarriageAnalysis7th {
  personA: {
    sign7: string;
    lord7: string;
    lord7House: number;
    lord7Dignity: string;
    occupants7: string[];
    aspects7: string[];
    venusSign: string;
    venusHouse: number;
    venusDignity: string;
    jupiterSign: string;
    jupiterHouse: number;
  };
  personB: {
    sign7: string;
    lord7: string;
    lord7House: number;
    lord7Dignity: string;
    occupants7: string[];
    aspects7: string[];
    venusSign: string;
    venusHouse: number;
    venusDignity: string;
    jupiterSign: string;
    jupiterHouse: number;
  };
  lordsFriendship: 'Friends' | 'Neutral' | 'Enemies' | 'Same';
  status: CompatibilityStatus;
  headline: string;
  supportiveSimilarities: string[];
  complementaryPatterns: string[];
  potentialFriction: string[];
  synthesis: string;
  why: string;
}

export interface ManglikMatchInsight {
  personA: {
    isManglik: boolean;
    level: string;
    marsHouse: number;
    marsSign: string;
    isCancelled: boolean;
    cancellations: string[];
  };
  personB: {
    isManglik: boolean;
    level: string;
    marsHouse: number;
    marsSign: string;
    isCancelled: boolean;
    cancellations: string[];
  };
  matchingImpact: CompatibilityStatus;
  headline: string;
  explanation: string;
  why: string;
  mitigationAdvice: string;
}

export interface NavamsaMatchInsight {
  personA: {
    d9Lagna: string;
    d9Sign7: string;
    d9Lord7: string;
    d9VenusSign: string;
    d9JupiterSign: string;
    vargottamaPlanets: string[];
  };
  personB: {
    d9Lagna: string;
    d9Sign7: string;
    d9Lord7: string;
    d9VenusSign: string;
    d9JupiterSign: string;
    vargottamaPlanets: string[];
  };
  lagnaHarmony: CompatibilityStatus;
  lagnaRelation: string;
  status: CompatibilityStatus;
  headline: string;
  whatItMeans: string;
  why: string;
  positiveSide: string;
  deeperSoulDynamics: string;
}

export interface DashaMatchInsight {
  personA: {
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
  };
  personB: {
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
  };
  status: CompatibilityStatus;
  headline: string;
  interactionNarrative: string;
  sharedFocus: string;
  contrastingPriorities: string;
  why: string;
}

export interface DrishtiMatchInsight {
  id: string;
  fromPerson: string;
  toPerson: string;
  fromPlanet: string;
  toPlanetOrHouse: string;
  status: CompatibilityStatus;
  headline: string;
  whatItMeans: string;
  why: string;
  positiveSide: string;
  possibleChallenge: string;
  priorityScore: number;
}

export interface SummaryDimension {
  dimension: 'emotional' | 'communication' | 'attraction' | 'marriage' | 'support' | 'challenges';
  title: string;
  status: CompatibilityStatus;
  summary: string;
  evidence: string;
}

export interface TopInsight {
  id: string;
  title: string;
  category: 'Major Planet Dynamic' | '7th House & Marriage' | 'Moon & Emotional' | 'D9 Navamsha' | 'Manglik Balance' | 'Dasha Phase' | 'Cross-Chart Aspect';
  status: CompatibilityStatus;
  description: string;
  why: string;
  technicalDetails: {
    planets?: string[];
    houses?: number[];
    signs?: string[];
    rule?: string;
  };
}

export interface MatchingResult {
  personA: {
    name: string;
    gender: string;
    dob: string;
    lagnaSign: string;
    moonSign: string;
    nakshatra: string;
    nakshatraPada: number;
    nakshatraLord: string;
  };
  personB: {
    name: string;
    gender: string;
    dob: string;
    lagnaSign: string;
    moonSign: string;
    nakshatra: string;
    nakshatraPada: number;
    nakshatraLord: string;
  };
  summaryDimensions: SummaryDimension[];
  topInsights: TopInsight[];
  gunaMilan: AshtakootaResult;
  planetaryCompatibility: PlanetPairInsight[];
  houseOverlays: HouseOverlayInsight[];
  marriageAnalysis: MarriageAnalysis7th;
  manglikAnalysis: ManglikMatchInsight;
  navamsaAnalysis: NavamsaMatchInsight;
  dashaAnalysis: DashaMatchInsight;
  drishtiAnalysis: DrishtiMatchInsight[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signIndex(sign: Sign): number {
  return RASHIS.findIndex(r => r.name === sign);
}

function calcSignDistance(fromSign: Sign, toSign: Sign): number {
  const iFrom = signIndex(fromSign);
  const iTo = signIndex(toSign);
  return ((iTo - iFrom + 12) % 12) + 1;
}

function getSignDistanceLabel(dist: number): string {
  switch (dist) {
    case 1:  return '1st / 1st (Conjunction / Same Sign)';
    case 2:  return '2nd / 12th (Dvirdvadasha)';
    case 3:  return '3rd / 11th (Upachaya / Friendly Trine)';
    case 4:  return '4th / 10th (Kendra / Square Action)';
    case 5:  return '5th / 9th (Trikona / Harmonious Trine)';
    case 6:  return '6th / 8th (Shadashtak / Dynamic Friction)';
    case 7:  return '7th / 7th (Samasaptaka / Direct Polar Axis)';
    case 8:  return '8th / 6th (Shadashtak / Dynamic Friction)';
    case 9:  return '9th / 5th (Trikona / Harmonious Trine)';
    case 10: return '10th / 4th (Kendra / Square Action)';
    case 11: return '11th / 3rd (Upachaya / Friendly Trine)';
    case 12: return '12th / 2nd (Dvirdvadasha)';
    default: return `${dist}th House Distance`;
  }
}

function checkPlanetaryFriendship(p1: Planet, p2: Planet): 'Friends' | 'Neutral' | 'Enemies' | 'Same' {
  if (p1 === p2) return 'Same';
  const name1 = p1 as PlanetName;
  const name2 = p2 as PlanetName;
  const pData1 = PLANETS_DATA[name1];
  if (!pData1) return 'Neutral';

  const isFriend = pData1.friends?.includes(name2) ?? false;
  const isEnemy = pData1.enemies?.includes(name2) ?? false;
  if (isFriend) return 'Friends';
  if (isEnemy) return 'Enemies';
  return 'Neutral';
}

function chartToPlanetaryPositions(chart: KundaliChart): PlanetaryPosition[] {
  return Object.values(chart.planets).map(p => {
    const sIdx = signIndex(p.sign);
    const rashiName = p.sign as RashiName;
    const rashiLord = RASHIS[sIdx >= 0 ? sIdx : 0].lord as PlanetName;
    return {
      name: p.planet as PlanetName,
      sanskritName: p.planet,
      longitude: p.longitude,
      speed: p.speed,
      isRetrograde: p.isRetrograde,
      house: p.house,
      rashi: rashiName,
      rashiNumber: (sIdx >= 0 ? sIdx : 0) + 1,
      rashiLord: rashiLord,
      degreeInRashi: p.degreeInSign,
      formattedDegree: p.dmsString,
      nakshatra: p.nakshatra.name,
      nakshatraNumber: p.nakshatra.index,
      nakshatraLord: p.nakshatra.lord as PlanetName,
      pada: p.nakshatraPosition.pada,
      dignity: p.dignity as DignityType,
      isCombust: p.isCombust,
      avastha: p.avastha,
      navamshaRashi: 'Aries',
      navamshaRashiNumber: 1
    };
  });
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return 'Ongoing';
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return 'Present';
  }
}

// ─── Main Matching Calculation Function ──────────────────────────────────────

export function computeFullMatching(chartA: KundaliChart, chartB: KundaliChart): MatchingResult {
  const nameA = chartA.birthData.name || 'Primary Profile';
  const nameB = chartB.birthData.name || 'Partner Profile';

  // 1. Basic Identities
  const moonA = chartA.planets.Moon;
  const moonB = chartB.planets.Moon;

  // ─── Level 1: Ashtakoota 36 Guna Milan ───────────────────────────────────────
  const posA = chartToPlanetaryPositions(chartA);
  const posB = chartToPlanetaryPositions(chartB);

  // Determine boy/girl ordering based on gender for classical Guna Milan
  const isMaleA = chartA.birthData.gender === 'male';
  const isFemaleB = chartB.birthData.gender === 'female';
  const useAFirst = isMaleA || !isFemaleB;

  const rawGuna = useAFirst
    ? calculateKundaliMilan(posA, posB)
    : calculateKundaliMilan(posB, posA);

  const gunaGunas: GunaDetail[] = rawGuna.gunas.map(g => ({
    name: g.name,
    sanskritName: g.sanskritName,
    maxPoints: g.maxPoints,
    obtainedPoints: g.obtainedPoints,
    personAAttribute: useAFirst ? g.boyAttribute : g.girlAttribute,
    personBAttribute: useAFirst ? g.girlAttribute : g.boyAttribute,
    description: g.description,
    status: g.status as 'Excellent' | 'Good' | 'Average' | 'Dosha'
  }));

  const gunaMilanResult: AshtakootaResult = {
    totalScore: rawGuna.totalScore,
    maxScore: 36,
    percentage: rawGuna.percentage,
    verdict: rawGuna.compatibilityVerdict,
    recommendation: rawGuna.recommendation,
    gunas: gunaGunas,
    nadiDosha: rawGuna.nadiDosha,
    nadiDoshaCancelled: rawGuna.nadiDoshaCancelled,
    bhakootDosha: rawGuna.bhakootDosha,
    bhakootDoshaCancelled: rawGuna.bhakootDoshaCancelled
  };

  // ─── Level 2: Planet-to-Planet Compatibility ────────────────────────────────
  const planetPairs: PlanetPairInsight[] = [];

  const planetsToCompare: Planet[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  // A. Same-planet comparisons
  for (const p of planetsToCompare) {
    const posAItem = chartA.planets[p];
    const posBItem = chartB.planets[p];
    if (!posAItem || !posBItem) continue;

    const dist = calcSignDistance(posAItem.sign, posBItem.sign);
    const distLabel = getSignDistanceLabel(dist);
    const lordA = RASHI_BY_NAME[posAItem.sign].lord;
    const lordB = RASHI_BY_NAME[posBItem.sign].lord;
    const friendship = checkPlanetaryFriendship(lordA, lordB);

    let status: CompatibilityStatus = 'Supportive';
    let headline = '';
    let whatItMeans = '';
    let why = `${nameA}'s ${p} is in ${posAItem.sign} (House ${posAItem.house}) and ${nameB}'s ${p} is in ${posBItem.sign} (House ${posBItem.house}), forming a ${distLabel} placement.`;
    let positiveSide = '';
    let possibleChallenge = '';
    let priorityScore = 50;

    if (dist === 1) {
      status = 'Supportive';
      headline = `Conjoined ${p} signs: Shared instinct and unified perspective`;
      whatItMeans = `Both individuals share the same sign placement for ${p}, fostering an intuitive understanding of each other's ${p.toLowerCase()} nature.`;
      positiveSide = `Zero translation needed—you both inherently grasp each other's instincts and values in this sphere.`;
      possibleChallenge = `Because both express ${p} identically, any stubbornness or blind spots in this sign are doubled.`;
      priorityScore = 70;
    } else if (dist === 5 || dist === 9) {
      status = 'Supportive';
      headline = `Trikona Harmony: Natural flow and mutual encouragement`;
      whatItMeans = `Trine placements create an effortless harmonic resonance between ${p} energies.`;
      positiveSide = `Mutual reinforcement without pressure; one partner naturally inspires and uplifts the other.`;
      possibleChallenge = `May occasionally avoid healthy constructive confrontation because things feel comfortable.`;
      priorityScore = 80;
    } else if (dist === 3 || dist === 11) {
      status = 'Supportive';
      headline = `Upachaya Alignment: Growth-oriented rapport and cooperative friendship`;
      whatItMeans = `The 3/11 house distance fosters communicative camaraderie and incremental shared improvement over time.`;
      positiveSide = `Easy brainstorming, flexible adjustments, and productive teamwork.`;
      possibleChallenge = `Requires active engagement so that the connection does not become purely casual or platonic.`;
      priorityScore = 65;
    } else if (dist === 7) {
      status = 'Mixed';
      headline = `Samasaptaka (Polar Axis): Magnetic attraction through contrast`;
      whatItMeans = `Planets sitting directly opposite each other create complementary tension—each possesses what the other seeks.`;
      positiveSide = `Deep mutual fascination and balance; partners round out each other's blind spots.`;
      possibleChallenge = `Risk of standoff or projection if differences are viewed as opposition rather than balance.`;
      priorityScore = 85;
    } else if (dist === 4 || dist === 10) {
      status = 'Mixed';
      headline = `Kendra (Square Action): Dynamic stimulus and mutual accountability`;
      whatItMeans = `Kendra placements generate action and motivation. They demand active coordination and clear boundaries.`;
      positiveSide = `Keeps both partners striving, motivated, and engaged in real-world accomplishment.`;
      possibleChallenge = `Periodic friction over pacing, decision-making control, or competing priorities.`;
      priorityScore = 60;
    } else if (dist === 6 || dist === 8) {
      status = friendship === 'Friends' ? 'Mixed' : 'Needs Attention';
      headline = `Shadashtak (6/8 Dynamic): Contrasting rhythm requiring conscious patience`;
      whatItMeans = `The 6/8 distance traditionally signifies divergent natural impulses or operating paces in this planet's domain.`;
      positiveSide = `Offers profound opportunities for personal maturation, adaptability, and patience.`;
      possibleChallenge = `Risk of misinterpreting each other's timing or intentions without open, non-defensive dialogue.`;
      priorityScore = 75;
    } else {
      // 2/12
      status = 'Mixed';
      headline = `Dvirdvadasha (2/12): Resource-sharing and mentorship dynamic`;
      whatItMeans = `One partner's planet precedes the other's, creating an asymmetric flow of energetic support or advice.`;
      positiveSide = `One person naturally nurtures, anchors, or guides the other in this domain.`;
      possibleChallenge = `Must maintain reciprocal balance to prevent one partner feeling like they give more than they receive.`;
      priorityScore = 55;
    }

    if (p === 'Moon') priorityScore += 20;
    if (p === 'Venus') priorityScore += 15;
    if (p === 'Mars') priorityScore += 10;
    if (p === 'Jupiter') priorityScore += 10;

    planetPairs.push({
      id: `pair-${p}-${p}`,
      planetA: p,
      planetB: p,
      relationshipType: 'SamePlanet',
      signA: posAItem.sign,
      signB: posBItem.sign,
      houseA: posAItem.house,
      houseB: posBItem.house,
      signDistance: dist,
      signDistanceLabel: distLabel,
      friendship,
      hasAspect: dist === 7,
      aspectDescription: dist === 7 ? `Direct 7th house mutual opposition aspect` : undefined,
      status,
      headline,
      whatItMeans,
      why,
      positiveSide,
      possibleChallenge,
      priorityScore
    });
  }

  // B. Major Cross-Chart Planetary Pairs
  const crossPairs: Array<{
    pA: Planet;
    pB: Planet;
    nameLabel: string;
    theme: string;
    priorityBase: number;
  }> = [
    { pA: 'Venus', pB: 'Mars', nameLabel: `${nameA}'s Venus ↔ ${nameB}'s Mars`, theme: 'Romantic & Physical Chemistry', priorityBase: 95 },
    { pA: 'Mars', pB: 'Venus', nameLabel: `${nameA}'s Mars ↔ ${nameB}'s Venus`, theme: 'Passion & Affection Reciprocity', priorityBase: 90 },
    { pA: 'Sun', pB: 'Moon', nameLabel: `${nameA}'s Sun ↔ ${nameB}'s Moon`, theme: 'Solar-Lunar Core Resonance', priorityBase: 92 },
    { pA: 'Moon', pB: 'Sun', nameLabel: `${nameA}'s Moon ↔ ${nameB}'s Sun`, theme: 'Intuitive & Vitality Harmony', priorityBase: 88 },
    { pA: 'Jupiter', pB: 'Venus', nameLabel: `${nameA}'s Jupiter ↔ ${nameB}'s Venus`, theme: 'Benefic Grace & Shared Generosity', priorityBase: 85 },
    { pA: 'Venus', pB: 'Jupiter', nameLabel: `${nameA}'s Venus ↔ ${nameB}'s Jupiter`, theme: 'Aesthetic & Philosophical Warmth', priorityBase: 82 },
    { pA: 'Jupiter', pB: 'Moon', nameLabel: `${nameA}'s Jupiter ↔ ${nameB}'s Moon`, theme: 'Guru-Chandra Emotional Blessing', priorityBase: 84 },
    { pA: 'Saturn', pB: 'Moon', nameLabel: `${nameA}'s Saturn ↔ ${nameB}'s Moon`, theme: 'Commitment, Duty & Emotional Security', priorityBase: 78 },
  ];

  for (const cp of crossPairs) {
    const posAItem = chartA.planets[cp.pA];
    const posBItem = chartB.planets[cp.pB];
    if (!posAItem || !posBItem) continue;

    const dist = calcSignDistance(posAItem.sign, posBItem.sign);
    const distLabel = getSignDistanceLabel(dist);
    const lordA = RASHI_BY_NAME[posAItem.sign].lord;
    const lordB = RASHI_BY_NAME[posBItem.sign].lord;
    const friendship = checkPlanetaryFriendship(lordA, lordB);

    let status: CompatibilityStatus = 'Supportive';
    let whatItMeans = '';
    let positiveSide = '';
    let possibleChallenge = '';

    if (dist === 1 || dist === 5 || dist === 9 || dist === 7 || dist === 3 || dist === 11) {
      status = 'Supportive';
      if (cp.pA === 'Venus' && cp.pB === 'Mars') {
        whatItMeans = `Venus and Mars form an auspicious harmonic aspect (${distLabel}), indicating vibrant attraction, emotional responsiveness, and natural romantic chemistry.`;
        positiveSide = `Effortless romantic sparkle, mutual aesthetic appreciation, and warm physical closeness.`;
        possibleChallenge = `Keep communication grounded in daily routines so romantic expectations stay anchored in reality.`;
      } else if (cp.pA === 'Sun' && cp.pB === 'Moon') {
        whatItMeans = `Sun and Moon share a traditional soul-to-mind connection (${distLabel}), where one partner's core vitality naturally reassures the other's emotional comfort.`;
        positiveSide = `Deep mutual respect, emotional reassurance, and intuitive validation of each other's worth.`;
        possibleChallenge = `Ensure both partners feel equal in expressing leadership and vulnerability.`;
      } else if (cp.pA === 'Jupiter') {
        whatItMeans = `Jupiter's supportive angle (${distLabel}) brings benevolent protection, forgiveness, and wise counsel into the relationship.`;
        positiveSide = `High moral trust, optimism during difficulties, and mutual encouragement toward personal growth.`;
        possibleChallenge = `Over-promising or assuming goodwill without taking practical steps to resolve structural issues.`;
      } else if (cp.pA === 'Saturn') {
        whatItMeans = `Saturn's connection (${distLabel}) adds durability, loyalty, and practical grounding to the partnership.`;
        positiveSide = `Steadfast reliability, long-term commitment, and realistic support during life changes.`;
        possibleChallenge = `Can feel slightly reserved or formal; conscious warmth and emotional expression should be nurtured.`;
      } else {
        whatItMeans = `These planets form a mutually supportive relationship (${distLabel}), facilitating cooperation and understanding.`;
        positiveSide = `Comfortable synergy and intuitive alignment in this area of life.`;
        possibleChallenge = `Remembering to appreciate the ease rather than taking it for granted.`;
      }
    } else {
      status = 'Mixed';
      whatItMeans = `These planets sit in a ${distLabel} placement, bringing differing perspectives that require deliberate attunement.`;
      positiveSide = `Prevents complacency and teaches each partner to understand an unfamiliar energetic style.`;
      possibleChallenge = `Misinterpreting an emotional reaction or assertiveness style as detachment or impatience.`;
    }

    const why = `${nameA}'s ${cp.pA} in ${posAItem.sign} (House ${posAItem.house}) aspects/interacts with ${nameB}'s ${cp.pB} in ${posBItem.sign} (House ${posBItem.house}) via a ${distLabel} relationship.`;

    planetPairs.push({
      id: `cross-${cp.pA}-${cp.pB}`,
      planetA: cp.pA,
      planetB: cp.pB,
      relationshipType: 'CrossChart',
      signA: posAItem.sign,
      signB: posBItem.sign,
      houseA: posAItem.house,
      houseB: posBItem.house,
      signDistance: dist,
      signDistanceLabel: distLabel,
      friendship,
      hasAspect: dist === 7,
      aspectDescription: dist === 7 ? 'Direct 7th house opposition' : undefined,
      status,
      headline: `${cp.theme}: ${cp.nameLabel}`,
      whatItMeans,
      why,
      positiveSide,
      possibleChallenge,
      priorityScore: cp.priorityBase + (status === 'Supportive' ? 5 : 0)
    });
  }

  // Sort planet pairs by priorityScore descending
  planetPairs.sort((a, b) => b.priorityScore - a.priorityScore);

  // ─── Level 3: Cross-Chart House Overlays ────────────────────────────────────
  const houseOverlays: HouseOverlayInsight[] = [];
  const lagnaAIdx = signIndex(chartA.lagnaSign);
  const lagnaBIdx = signIndex(chartB.lagnaSign);

  const importantOverlayPlanets: BodyPlanet[] = ['Sun', 'Moon', 'Jupiter', 'Venus', 'Mars', 'Saturn', 'Mercury'];

  for (const p of importantOverlayPlanets) {
    // Person A planet in Person B houses
    const posAItem = chartA.planets[p];
    if (posAItem) {
      const sIdx = signIndex(posAItem.sign);
      const houseInB = ((sIdx - lagnaBIdx + 12) % 12) + 1;
      const targetSign = RASHIS[sIdx].name;

      if ([1, 2, 4, 5, 7, 8, 9, 10, 11].includes(houseInB)) {
        const overlay = createOverlayInsight(nameA, nameB, p, posAItem.sign, houseInB, targetSign);
        houseOverlays.push(overlay);
      }
    }

    // Person B planet in Person A houses
    const posBItem = chartB.planets[p];
    if (posBItem) {
      const sIdx = signIndex(posBItem.sign);
      const houseInA = ((sIdx - lagnaAIdx + 12) % 12) + 1;
      const targetSign = RASHIS[sIdx].name;

      if ([1, 2, 4, 5, 7, 8, 9, 10, 11].includes(houseInA)) {
        const overlay = createOverlayInsight(nameB, nameA, p, posBItem.sign, houseInA, targetSign);
        houseOverlays.push(overlay);
      }
    }
  }

  houseOverlays.sort((a, b) => b.priorityScore - a.priorityScore);

  // ─── Level 4: 7th House / Marriage Analysis ────────────────────────────────
  const h7A = chartA.houses.find(h => h.number === 7) || chartA.houses[6];
  const h7B = chartB.houses.find(h => h.number === 7) || chartB.houses[6];

  const lord7A = h7A.lord;
  const lord7B = h7B.lord;
  const lord7PosA = chartA.planets[lord7A];
  const lord7PosB = chartB.planets[lord7B];

  const occupants7A = h7A.planets.map(String);
  const occupants7B = h7B.planets.map(String);

  const aspects7A = chartA.aspects.filter(a => a.toHouse === 7).map(a => `${a.fromPlanet} (H${a.fromHouse})`);
  const aspects7B = chartB.aspects.filter(a => a.toHouse === 7).map(a => `${a.fromPlanet} (H${a.fromHouse})`);

  const venusA = chartA.planets.Venus;
  const venusB = chartB.planets.Venus;
  const jupiterA = chartA.planets.Jupiter;
  const jupiterB = chartB.planets.Jupiter;

  const lordsFriendship = checkPlanetaryFriendship(lord7A, lord7B);

  const supportiveSimilarities: string[] = [];
  const complementaryPatterns: string[] = [];
  const potentialFriction: string[] = [];

  if (lordsFriendship === 'Friends' || lordsFriendship === 'Same') {
    supportiveSimilarities.push(`Both 7th house rulers (${lord7A} and ${lord7B}) are natural allies, fostering harmonious mutual expectations regarding partnership roles.`);
  } else if (lordsFriendship === 'Enemies') {
    potentialFriction.push(`The 7th lords (${lord7A} and ${lord7B}) have contrasting planetary dispositions, meaning partners may hold different initial ideas about marriage dynamics.`);
  } else {
    complementaryPatterns.push(`The 7th lords (${lord7A} and ${lord7B}) maintain neutral relations, providing space for customized marital agreements without pre-existing friction.`);
  }

  if (venusA?.dignity === 'Exalted' || venusA?.dignity === 'OwnSign' || venusB?.dignity === 'Exalted' || venusB?.dignity === 'OwnSign') {
    supportiveSimilarities.push(`Venus (the primary karaka of marriage) holds strong dignity in one or both charts, strengthening affection, devotion, and social elegance.`);
  }

  if (occupants7A.some(p => ['Jupiter', 'Venus', 'Mercury'].includes(p)) || occupants7B.some(p => ['Jupiter', 'Venus', 'Mercury'].includes(p))) {
    supportiveSimilarities.push(`Natural benefics reside in or aspect the 7th house, bestowing protective grace, generosity, and resilience during relationship disputes.`);
  }

  if (occupants7A.some(p => ['Saturn', 'Rahu', 'Mars'].includes(p)) || occupants7B.some(p => ['Saturn', 'Rahu', 'Mars'].includes(p))) {
    potentialFriction.push(`Presence or influence of strong malefic energies on the 7th house indicates that patience, clear communication, and non-reactivity are key virtues for long-term stability.`);
  } else {
    complementaryPatterns.push(`The 7th houses are free from direct malefic occupation, promoting calm and constructive problem-solving.`);
  }

  let marriageStatus: CompatibilityStatus = 'Supportive';
  if (potentialFriction.length > supportiveSimilarities.length) {
    marriageStatus = 'Needs Attention';
  } else if (potentialFriction.length > 0) {
    marriageStatus = 'Mixed';
  }

  const marriageAnalysis: MarriageAnalysis7th = {
    personA: {
      sign7: h7A.sign,
      lord7: lord7A,
      lord7House: lord7PosA?.house ?? 7,
      lord7Dignity: lord7PosA?.dignity ?? 'Neutral',
      occupants7: occupants7A,
      aspects7: aspects7A,
      venusSign: venusA?.sign ?? 'Aries',
      venusHouse: venusA?.house ?? 1,
      venusDignity: venusA?.dignity ?? 'Neutral',
      jupiterSign: jupiterA?.sign ?? 'Aries',
      jupiterHouse: jupiterA?.house ?? 1
    },
    personB: {
      sign7: h7B.sign,
      lord7: lord7B,
      lord7House: lord7PosB?.house ?? 7,
      lord7Dignity: lord7PosB?.dignity ?? 'Neutral',
      occupants7: occupants7B,
      aspects7: aspects7B,
      venusSign: venusB?.sign ?? 'Aries',
      venusHouse: venusB?.house ?? 1,
      venusDignity: venusB?.dignity ?? 'Neutral',
      jupiterSign: jupiterB?.sign ?? 'Aries',
      jupiterHouse: jupiterB?.house ?? 1
    },
    lordsFriendship,
    status: marriageStatus,
    headline: `7th House Dynamics: ${lordsFriendship === 'Friends' ? 'Harmonious Alliance' : lordsFriendship === 'Same' ? 'Identical Partnership Ideals' : 'Dynamic Complementary Union'}`,
    supportiveSimilarities,
    complementaryPatterns,
    potentialFriction,
    synthesis: `${nameA}'s 7th house in ${h7A.sign} (ruled by ${lord7A}) meets ${nameB}'s 7th house in ${h7B.sign} (ruled by ${lord7B}). Overall, the pairing displays ${supportiveSimilarities.length} key supportive indicators, promoting shared devotion and partnership loyalty.`,
    why: `${nameA}: 7th sign ${h7A.sign} with ${occupants7A.length ? occupants7A.join(', ') : 'no occupants'}. ${nameB}: 7th sign ${h7B.sign} with ${occupants7B.length ? occupants7B.join(', ') : 'no occupants'}. 7th lords friendship: ${lordsFriendship}.`
  };

  // ─── Level 5: Manglik / Mars Factors ────────────────────────────────────────
  const manglikA = analyzeManglikDosha(posA);
  const manglikB = analyzeManglikDosha(posB);

  const marsPosA = chartA.planets.Mars;
  const marsPosB = chartB.planets.Mars;

  let manglikImpact: CompatibilityStatus = 'Supportive';
  let manglikHeadline = '';
  let manglikExplanation = '';
  let manglikAdvice = '';

  if (manglikA.isManglik && manglikB.isManglik) {
    manglikImpact = 'Supportive';
    manglikHeadline = 'Mutual Manglik Balance: Classical Vedic Neutralization';
    manglikExplanation = `Both ${nameA} and ${nameB} carry Manglik placements in their charts. According to classical Parashari principles, when both individuals share Mangal Dosha, their fiery intensities naturally counterbalance each other, eliminating one-sided marital tension.`;
    manglikAdvice = `Channel shared vitality and drive into joint physical activities, ventures, and constructive goals.`;
  } else if (!manglikA.isManglik && !manglikB.isManglik) {
    manglikImpact = 'Supportive';
    manglikHeadline = 'Harmonious Non-Manglik Alignment: Free from Kuja Affliction';
    manglikExplanation = `Neither chart carries significant Manglik Dosha from the Ascendant, Moon, or Venus. The Mars energy operates smoothly without creating volatility in partnership affairs.`;
    manglikAdvice = `No special remedial measures are necessary for Mars compatibility.`;
  } else {
    const manglikPerson = manglikA.isManglik ? nameA : nameB;
    const nonManglikPerson = manglikA.isManglik ? nameB : nameA;
    const activeManglik = manglikA.isManglik ? manglikA : manglikB;

    if (activeManglik.isCancelled || activeManglik.level === 'Partial') {
      manglikImpact = 'Mixed';
      manglikHeadline = 'Mitigated Manglik Factor: Cancelled or Mild Affliction';
      manglikExplanation = `${manglikPerson} has Mars in a traditional Manglik house, but the affliction is significantly mitigated or cancelled (${activeManglik.cancellations.join('; ') || 'benefic aspects'}). The impact on ${nonManglikPerson} is gentle.`;
      manglikAdvice = `Conscious awareness during high-stress situations is recommended, but fear-based remedies are unnecessary.`;
    } else {
      manglikImpact = 'Needs Attention';
      manglikHeadline = 'Unilateral Manglik Presence: Requires Temperamental Harmony';
      manglikExplanation = `${manglikPerson} shows pronounced Mars placement in House ${activeManglik.marsHouseFromLagna}, bringing high assertiveness and independence, while ${nonManglikPerson} has a gentler Mars disposition.`;
      manglikAdvice = `Cultivate non-reactive communication during heated debates. Traditional Hanuman Chalisa recitation or focused physical grounding can be practiced if desired.`;
    }
  }

  const manglikAnalysis: ManglikMatchInsight = {
    personA: {
      isManglik: manglikA.isManglik,
      level: manglikA.level,
      marsHouse: marsPosA?.house ?? manglikA.marsHouseFromLagna,
      marsSign: marsPosA?.sign ?? 'Aries',
      isCancelled: manglikA.isCancelled,
      cancellations: manglikA.cancellations
    },
    personB: {
      isManglik: manglikB.isManglik,
      level: manglikB.level,
      marsHouse: marsPosB?.house ?? manglikB.marsHouseFromLagna,
      marsSign: marsPosB?.sign ?? 'Aries',
      isCancelled: manglikB.isCancelled,
      cancellations: manglikB.cancellations
    },
    matchingImpact: manglikImpact,
    headline: manglikHeadline,
    explanation: manglikExplanation,
    why: `${nameA}: Mars in ${marsPosA?.sign ?? 'Unknown'} (H${marsPosA?.house ?? 1}) - ${manglikA.level} Manglik (${manglikA.isCancelled ? 'Cancelled' : 'Active'}). ${nameB}: Mars in ${marsPosB?.sign ?? 'Unknown'} (H${marsPosB?.house ?? 1}) - ${manglikB.level} Manglik (${manglikB.isCancelled ? 'Cancelled' : 'Active'}).`,
    mitigationAdvice: manglikAdvice
  };

  // ─── Level 6: D9 / Navamsa Compatibility ────────────────────────────────────
  const d9A = buildDivisionalChart(chartA, 9);
  const d9B = buildDivisionalChart(chartB, 9);

  const d9LagnaDist = calcSignDistance(d9A.lagnaSign, d9B.lagnaSign);
  const d9LagnaLabel = getSignDistanceLabel(d9LagnaDist);

  let d9Status: CompatibilityStatus = 'Supportive';
  let d9Headline = '';
  let d9WhatItMeans = '';
  let d9PositiveSide = '';
  let d9DeeperDynamics = '';

  if ([1, 5, 9, 3, 11].includes(d9LagnaDist)) {
    d9Status = 'Supportive';
    d9Headline = `Harmonious Navamsha Lagna Alignment (${d9LagnaLabel})`;
    d9WhatItMeans = `The Navamsha Lagnas of both individuals resonate in a trine or friendly angle, indicating that after marriage, your inner soul values, spiritual direction, and subconscious needs naturally align.`;
    d9PositiveSide = `As the initial glamour of dating evolves into daily partnership, respect and soul compatibility grow stronger over time.`;
    d9DeeperDynamics = `Both individuals mature towards the same life virtues, easing decision-making in middle and later life.`;
  } else if (d9LagnaDist === 7) {
    d9Status = 'Mixed';
    d9Headline = `Polar Navamsha Lagna: Complementary Soul Evolution`;
    d9WhatItMeans = `The Navamshas sit directly across each other, meaning marriage brings out opposite yet complementary qualities in both of you.`;
    d9PositiveSide = `Each partner acts as a mirror that helps the other integrate their missing spiritual virtues.`;
    d9DeeperDynamics = `Differences in personal philosophy are enriching when approached with curiosity rather than dogmatism.`;
  } else {
    d9Status = 'Mixed';
    d9Headline = `Navamsha Adjustment Angle (${d9LagnaLabel})`;
    d9WhatItMeans = `The D9 Lagnas require learning each other's distinct internal processing style, as your spiritual instincts operate on different wavelengths.`;
    d9PositiveSide = `Expands both individuals' worldview and prevents spiritual or personal stagnation.`;
    d9DeeperDynamics = `Allow each other personal space for individual hobbies, introspection, and spiritual expression.`;
  }

  const d9VenusA = d9A.planets.Venus;
  const d9VenusB = d9B.planets.Venus;
  const d9JupiterA = d9A.planets.Jupiter;
  const d9JupiterB = d9B.planets.Jupiter;

  const d9H7A = d9A.houses.find(h => h.number === 7) || d9A.houses[6];
  const d9H7B = d9B.houses.find(h => h.number === 7) || d9B.houses[6];

  const vargottamaA = Object.values(d9A.planets)
    .filter(p => p.planet !== 'Ascendant' && p.natalSign === p.vargaSign)
    .map(p => String(p.planet));

  const vargottamaB = Object.values(d9B.planets)
    .filter(p => p.planet !== 'Ascendant' && p.natalSign === p.vargaSign)
    .map(p => String(p.planet));

  const navamsaAnalysis: NavamsaMatchInsight = {
    personA: {
      d9Lagna: d9A.lagnaSign,
      d9Sign7: d9H7A?.sign ?? 'Libra',
      d9Lord7: d9H7A?.lord ?? 'Venus',
      d9VenusSign: d9VenusA?.vargaSign ?? 'Taurus',
      d9JupiterSign: d9JupiterA?.vargaSign ?? 'Sagittarius',
      vargottamaPlanets: vargottamaA
    },
    personB: {
      d9Lagna: d9B.lagnaSign,
      d9Sign7: d9H7B?.sign ?? 'Libra',
      d9Lord7: d9H7B?.lord ?? 'Venus',
      d9VenusSign: d9VenusB?.vargaSign ?? 'Taurus',
      d9JupiterSign: d9JupiterB?.vargaSign ?? 'Sagittarius',
      vargottamaPlanets: vargottamaB
    },
    lagnaHarmony: d9Status,
    lagnaRelation: d9LagnaLabel,
    status: d9Status,
    headline: d9Headline,
    whatItMeans: d9WhatItMeans,
    why: `${nameA} D9 Lagna is ${d9A.lagnaSign} and ${nameB} D9 Lagna is ${d9B.lagnaSign} (${d9LagnaLabel}). Vargottama planets: ${nameA} (${vargottamaA.length ? vargottamaA.join(', ') : 'None'}), ${nameB} (${vargottamaB.length ? vargottamaB.join(', ') : 'None'}).`,
    positiveSide: d9PositiveSide,
    deeperSoulDynamics: d9DeeperDynamics
  };

  // ─── Level 7: Mahadasha / Antardasha Interaction ───────────────────────────
  const mdA = chartA.dasha.currentMahadasha;
  const adA = chartA.dasha.currentAntardasha;
  const mdB = chartB.dasha.currentMahadasha;
  const adB = chartB.dasha.currentAntardasha;

  const lordMdA = mdA?.planet ?? 'Jupiter';
  const lordMdB = mdB?.planet ?? 'Venus';
  const dashaFriendship = checkPlanetaryFriendship(lordMdA, lordMdB);

  let dashaStatus: CompatibilityStatus = 'Supportive';
  let dashaHeadline = '';
  let dashaNarrative = '';
  let sharedFocus = '';
  let contrastingPriorities = '';

  if (dashaFriendship === 'Friends' || dashaFriendship === 'Same') {
    dashaStatus = 'Supportive';
    dashaHeadline = `Synchronized Life Cycles: ${lordMdA} MD ↔ ${lordMdB} MD`;
    dashaNarrative = `Currently, ${nameA} is experiencing ${lordMdA} Mahadasha and ${nameB} is running ${lordMdB} Mahadasha. Because their Dasha lords are planetary allies, their overarching life goals and emotional tempos move in harmonious coordination.`;
    sharedFocus = `Building long-term foundations, mutual celebration of achievements, and shared lifestyle expansion.`;
    contrastingPriorities = `Both may get overly comfortable in shared pursuits; remember to maintain external social and physical health.`;
  } else if (dashaFriendship === 'Enemies') {
    dashaStatus = 'Mixed';
    dashaHeadline = `Differing Life Themes: ${lordMdA} MD ↔ ${lordMdB} MD`;
    dashaNarrative = `${nameA}'s current period is influenced by ${lordMdA} while ${nameB}'s period is shaped by ${lordMdB}. These two planets represent distinct energetic themes—one may be focused on internal introspection or career restructuring, while the other prioritizes social engagement or domestic stability.`;
    sharedFocus = `Learning flexibility and understanding that differing seasonal priorities are normal and complementary.`;
    contrastingPriorities = `One partner may crave outward movement while the other requires quiet restorative consolidation.`;
  } else {
    dashaStatus = 'Supportive';
    dashaHeadline = `Balanced Adaptive Cycles: ${lordMdA} MD ↔ ${lordMdB} MD`;
    dashaNarrative = `The current ruling planetary periods operate in neutral harmony. Neither partner's planetary cycle creates direct tension for the other, allowing each to pursue their personal growth without friction.`;
    sharedFocus = `Stable everyday routines, steady career pacing, and dependable mutual presence.`;
    contrastingPriorities = `Ensure deliberate dates and joint bonding rituals are scheduled so routine doesn't become monotonous.`;
  }

  const dashaAnalysis: DashaMatchInsight = {
    personA: {
      mahadasha: String(lordMdA),
      antardasha: String(adA?.planet ?? 'Unknown'),
      startDate: formatDate(mdA?.startDate),
      endDate: formatDate(mdA?.endDate)
    },
    personB: {
      mahadasha: String(lordMdB),
      antardasha: String(adB?.planet ?? 'Unknown'),
      startDate: formatDate(mdB?.startDate),
      endDate: formatDate(mdB?.endDate)
    },
    status: dashaStatus,
    headline: dashaHeadline,
    interactionNarrative: dashaNarrative,
    sharedFocus,
    contrastingPriorities,
    why: `${nameA} is running ${lordMdA} Mahadasha (${formatDate(mdA?.startDate)} – ${formatDate(mdA?.endDate)}). ${nameB} is running ${lordMdB} Mahadasha (${formatDate(mdB?.startDate)} – ${formatDate(mdB?.endDate)}). Planetary friendship between ${lordMdA} and ${lordMdB}: ${dashaFriendship}.`
  };

  // ─── Level 8: Drishti / Mutual Influence ────────────────────────────────────
  const drishtiAnalysis: DrishtiMatchInsight[] = [];

  // Important cross-chart aspects to detect
  // 1. Person A's Jupiter aspecting Person B's Moon, Venus, or Lagna
  checkCrossDrishti(chartA, chartB, nameA, nameB, drishtiAnalysis);
  // 2. Person B's Jupiter aspecting Person A's Moon, Venus, or Lagna
  checkCrossDrishti(chartB, chartA, nameB, nameA, drishtiAnalysis);

  drishtiAnalysis.sort((a, b) => b.priorityScore - a.priorityScore);

  // ─── Summary Dimensions (The 6 Beginner-Friendly Highlights) ────────────────
  const summaryDimensions: SummaryDimension[] = [
    {
      dimension: 'emotional',
      title: 'Emotional Compatibility',
      status: rawGuna.nadiDosha && !rawGuna.nadiDoshaCancelled ? 'Mixed' : rawGuna.totalScore >= 20 ? 'Supportive' : 'Mixed',
      summary: `${nameA}'s Moon in ${moonA.sign} and ${nameB}'s Moon in ${moonB.sign} share a ${getSignDistanceLabel(calcSignDistance(moonA.sign, moonB.sign))} relationship. Both partners naturally resonate on deep instinctual and psychological levels.`,
      evidence: `Moon signs: ${moonA.sign} & ${moonB.sign} (Distance: ${calcSignDistance(moonA.sign, moonB.sign)}). Nakshatras: ${moonA.nakshatra.name} & ${moonB.nakshatra.name}. Guna Milan score: ${rawGuna.totalScore}/36.`
    },
    {
      dimension: 'communication',
      title: 'Communication & Intellectual Harmony',
      status: checkPlanetaryFriendship(chartA.planets.Mercury.sign as unknown as Planet, chartB.planets.Mercury.sign as unknown as Planet) === 'Enemies' ? 'Mixed' : 'Supportive',
      summary: `Mercury placements facilitate open exchanges and intellectual curiosity. Ideas are shared constructively without conversational defensiveness.`,
      evidence: `${nameA}'s Mercury in ${chartA.planets.Mercury.sign} (H${chartA.planets.Mercury.house}) ↔ ${nameB}'s Mercury in ${chartB.planets.Mercury.sign} (H${chartB.planets.Mercury.house}). Distance: ${getSignDistanceLabel(calcSignDistance(chartA.planets.Mercury.sign, chartB.planets.Mercury.sign))}.`
    },
    {
      dimension: 'attraction',
      title: 'Attraction & Chemistry',
      status: planetPairs.some(p => p.relationshipType === 'CrossChart' && p.planetA === 'Venus' && p.status === 'Supportive') ? 'Supportive' : 'Mixed',
      summary: `Venus and Mars connections between the two charts supply romantic sparkle, mutual aesthetic appreciation, and affectionate physical warmth.`,
      evidence: `${nameA}'s Venus in ${chartA.planets.Venus.sign} and Mars in ${chartA.planets.Mars.sign} interact with ${nameB}'s Venus in ${chartB.planets.Venus.sign} and Mars in ${chartB.planets.Mars.sign}.`
    },
    {
      dimension: 'marriage',
      title: 'Marriage & Partnership Stability',
      status: marriageStatus,
      summary: `7th house indicators and marital lords demonstrate strong complementary alignment, fostering commitment and cooperative shared responsibility.`,
      evidence: `${nameA} 7th house in ${h7A.sign} (Lord: ${lord7A}) ↔ ${nameB} 7th house in ${h7B.sign} (Lord: ${lord7B}). Lords friendship: ${lordsFriendship}.`
    },
    {
      dimension: 'support',
      title: 'Mutual Support & Growth',
      status: d9Status,
      summary: `D9 Navamsha and Jupiter placements encourage mutual prosperity and emotional resilience through all life chapters.`,
      evidence: `D9 Lagnas: ${d9A.lagnaSign} ↔ ${d9B.lagnaSign} (${d9LagnaLabel}). D9 Venus & Jupiter dignities maintain positive moral elevation.`
    },
    {
      dimension: 'challenges',
      title: 'Long-Term Growth Areas',
      status: manglikImpact === 'Needs Attention' ? 'Needs Attention' : 'Mixed',
      summary: `Periodic differences in pacing or assertiveness may arise during stressful seasons; maintaining proactive patience and transparent expectations ensures smooth resolution.`,
      evidence: `Mars status: ${nameA} (${manglikA.level} Manglik) & ${nameB} (${manglikB.level} Manglik). Current Dasha cycles: ${lordMdA} MD & ${lordMdB} MD.`
    }
  ];

  // ─── Top 5–8 Prioritized Insights ───────────────────────────────────────────
  const topInsights: TopInsight[] = [];

  // 1. Guna Milan Top Insight
  topInsights.push({
    id: 'top-guna',
    title: `Ashtakoota Score: ${rawGuna.totalScore} / 36 (${rawGuna.compatibilityVerdict})`,
    category: 'Moon & Emotional',
    status: rawGuna.totalScore >= 20 ? 'Supportive' : rawGuna.totalScore >= 14 ? 'Mixed' : 'Needs Attention',
    description: `Vedic Ashtakoota compatibility analysis awards ${rawGuna.totalScore} out of 36 gunas (${rawGuna.percentage}%). Core mental wavelength (Graha Maitri) and temperamental harmony are well-aligned.`,
    why: `${nameA}: ${moonA.sign} Moon (${moonA.nakshatra.name} Nakshatra, Pada ${chartA.janmaNakshatraPada}). ${nameB}: ${moonB.sign} Moon (${moonB.nakshatra.name} Nakshatra, Pada ${chartB.janmaNakshatraPada}).`,
    technicalDetails: {
      planets: ['Moon'],
      signs: [moonA.sign, moonB.sign],
      rule: 'BPHS Ashtakoota Milan'
    }
  });

  // 2. High priority cross pair (Venus/Mars or Sun/Moon)
  const bestCrossPair = planetPairs.find(p => p.relationshipType === 'CrossChart');
  if (bestCrossPair) {
    topInsights.push({
      id: bestCrossPair.id,
      title: bestCrossPair.headline,
      category: 'Major Planet Dynamic',
      status: bestCrossPair.status,
      description: bestCrossPair.whatItMeans,
      why: bestCrossPair.why,
      technicalDetails: {
        planets: [bestCrossPair.planetA as Planet, bestCrossPair.planetB as Planet],
        signs: [bestCrossPair.signA as Sign, bestCrossPair.signB as Sign],
        rule: bestCrossPair.signDistanceLabel
      }
    });
  }

  // 3. 7th House & Marriage insight
  topInsights.push({
    id: 'top-marriage-7th',
    title: marriageAnalysis.headline,
    category: '7th House & Marriage',
    status: marriageAnalysis.status,
    description: marriageAnalysis.synthesis,
    why: marriageAnalysis.why,
    technicalDetails: {
      houses: [7],
      signs: [h7A.sign, h7B.sign],
      rule: `7th House Lords: ${lord7A} & ${lord7B} (${lordsFriendship})`
    }
  });

  // 4. Manglik Balance insight
  topInsights.push({
    id: 'top-manglik',
    title: manglikAnalysis.headline,
    category: 'Manglik Balance',
    status: manglikAnalysis.matchingImpact,
    description: manglikAnalysis.explanation,
    why: manglikAnalysis.why,
    technicalDetails: {
      planets: ['Mars'],
      houses: [marsPosA?.house ?? 1, marsPosB?.house ?? 1],
      rule: 'Kuja Dosha Analysis from Lagna, Moon & Venus'
    }
  });

  // 5. Navamsa insight
  topInsights.push({
    id: 'top-navamsa',
    title: navamsaAnalysis.headline,
    category: 'D9 Navamsha',
    status: navamsaAnalysis.status,
    description: navamsaAnalysis.whatItMeans,
    why: navamsaAnalysis.why,
    technicalDetails: {
      signs: [d9A.lagnaSign, d9B.lagnaSign],
      rule: `D9 Lagna Distance: ${d9LagnaLabel}`
    }
  });

  // 6. Current Dasha insight
  topInsights.push({
    id: 'top-dasha',
    title: dashaAnalysis.headline,
    category: 'Dasha Phase',
    status: dashaAnalysis.status,
    description: dashaAnalysis.interactionNarrative,
    why: dashaAnalysis.why,
    technicalDetails: {
      planets: [lordMdA, lordMdB],
      rule: 'Vimshottari Mahadasha Overlap'
    }
  });

  // 7. Top Cross-Chart Drishti or House Overlay
  if (drishtiAnalysis.length > 0) {
    const topDrishti = drishtiAnalysis[0];
    topInsights.push({
      id: topDrishti.id,
      title: topDrishti.headline,
      category: 'Cross-Chart Aspect',
      status: topDrishti.status,
      description: topDrishti.whatItMeans,
      why: topDrishti.why,
      technicalDetails: {
        planets: [topDrishti.fromPlanet as Planet],
        rule: `Cross-Chart Drishti onto ${topDrishti.toPlanetOrHouse}`
      }
    });
  } else if (houseOverlays.length > 0) {
    const topOverlay = houseOverlays[0];
    topInsights.push({
      id: topOverlay.id,
      title: `${topOverlay.fromPerson}'s ${topOverlay.planet} in ${topOverlay.toPerson}'s House ${topOverlay.houseInTarget}`,
      category: 'Major Planet Dynamic',
      status: topOverlay.status,
      description: topOverlay.whatItMeans,
      why: topOverlay.why,
      technicalDetails: {
        planets: [topOverlay.planet as Planet],
        houses: [topOverlay.houseInTarget],
        rule: 'Cross-Chart Bhava Overlay'
      }
    });
  }

  return {
    personA: {
      name: nameA,
      gender: chartA.birthData.gender,
      dob: chartA.birthData.dob,
      lagnaSign: chartA.lagnaSign,
      moonSign: chartA.moonSign,
      nakshatra: chartA.janmaNakshatra.name,
      nakshatraPada: chartA.janmaNakshatraPada,
      nakshatraLord: chartA.janmaNakshatra.lord
    },
    personB: {
      name: nameB,
      gender: chartB.birthData.gender,
      dob: chartB.birthData.dob,
      lagnaSign: chartB.lagnaSign,
      moonSign: chartB.moonSign,
      nakshatra: chartB.janmaNakshatra.name,
      nakshatraPada: chartB.janmaNakshatraPada,
      nakshatraLord: chartB.janmaNakshatra.lord
    },
    summaryDimensions,
    topInsights,
    gunaMilan: gunaMilanResult,
    planetaryCompatibility: planetPairs,
    houseOverlays,
    marriageAnalysis,
    manglikAnalysis,
    navamsaAnalysis,
    dashaAnalysis,
    drishtiAnalysis
  };
}

// ─── Sub-helper Functions ─────────────────────────────────────────────────────

function createOverlayInsight(
  fromName: string,
  toName: string,
  planet: BodyPlanet,
  planetSign: Sign,
  house: number,
  targetSign: string
): HouseOverlayInsight {
  let theme = '';
  let whatItMeans = '';
  let positiveSide = '';
  let possibleChallenge = '';
  let status: CompatibilityStatus = 'Supportive';
  let priorityScore = 50;

  switch (house) {
    case 1:
      theme = 'Identity & Self-Expression';
      whatItMeans = `${fromName}'s ${planet} illuminates ${toName}'s 1st house of vitality and personality, leaving a vivid personal impression.`;
      positiveSide = `Strong physical presence and clear mutual understanding of who you are.`;
      possibleChallenge = `Can feel slightly prominent or intense if boundaries aren't honored.`;
      priorityScore = 80;
      break;
    case 2:
      theme = 'Family Values & Resources';
      whatItMeans = `${fromName}'s ${planet} falls in ${toName}'s 2nd house of wealth and lineage, encouraging shared material stewardship.`;
      positiveSide = `Encourages mutual financial security, comfortable dining, and respectful speech.`;
      possibleChallenge = `Clarify expectations regarding financial management early on.`;
      priorityScore = 65;
      break;
    case 4:
      theme = 'Home, Heart & Emotional Sanctuary';
      whatItMeans = `${fromName}'s ${planet} blesses ${toName}'s 4th house of domestic peace, fostering a warm haven at home.`;
      positiveSide = `Deep sense of emotional belonging, comfort, and feeling safe together in private spaces.`;
      possibleChallenge = `Maintain individual solitude when either partner needs rest.`;
      priorityScore = 75;
      break;
    case 5:
      theme = 'Romance, Creativity & Children';
      whatItMeans = `${fromName}'s ${planet} enriches ${toName}'s 5th house of joy, romance, and intellectual playfulness.`;
      positiveSide = `Spontaneous laughter, creative projects, dating romance, and affectionate fun.`;
      possibleChallenge = `Balance playfulness with practical adult responsibilities.`;
      priorityScore = 85;
      break;
    case 7:
      theme = 'Partnership, Marriage & Public Alliance';
      whatItMeans = `${fromName}'s ${planet} anchors directly into ${toName}'s 7th house of committed partnership, creating natural gravity toward marriage.`;
      positiveSide = `Clear view of each other as life partners; strong public recognition as an aligned couple.`;
      possibleChallenge = `High expectations placed on partnership roles; remember to accept human imperfections.`;
      priorityScore = 95;
      break;
    case 8:
      theme = 'Deep Intimacy & Joint Transformation';
      whatItMeans = `${fromName}'s ${planet} engages ${toName}'s 8th house of emotional depth and shared trust.`;
      positiveSide = `Profound psychological intimacy, vulnerability, and mutual loyalty through life shifts.`;
      possibleChallenge = `Requires complete transparency and emotional honesty to prevent unspoken doubts.`;
      status = 'Mixed';
      priorityScore = 70;
      break;
    case 9:
      theme = 'Higher Wisdom, Dharma & Fortune';
      whatItMeans = `${fromName}'s ${planet} visits ${toName}'s 9th house of philosophy, spiritual travel, and good fortune.`;
      positiveSide = `Inspires mutual learning, shared adventures, high moral purpose, and philosophical growth.`;
      possibleChallenge = `Respect different ancestral traditions or theological approaches.`;
      priorityScore = 80;
      break;
    case 10:
      theme = 'Career Ambition & Social Standing';
      whatItMeans = `${fromName}'s ${planet} activates ${toName}'s 10th house of worldly status and achievement.`;
      positiveSide = `Great pride in each other's career success; constructive public endorsement.`;
      possibleChallenge = `Avoid letting professional busyness encroach on personal romance.`;
      priorityScore = 60;
      break;
    case 11:
      theme = 'Shared Dreams, Friendship & Gains';
      whatItMeans = `${fromName}'s ${planet} touches ${toName}'s 11th house of community, social networks, and realized hopes.`;
      positiveSide = `Great friendship foundation; mutual encouragement in pursuing long-term dreams.`;
      possibleChallenge = `Keep couple time prioritized alongside group social circles.`;
      priorityScore = 75;
      break;
    default:
      theme = 'Adaptive Integration';
      whatItMeans = `${fromName}'s ${planet} falls in ${toName}'s House ${house}, encouraging gentle coordination in this realm.`;
      positiveSide = `Fosters patience and adaptive cooperation.`;
      possibleChallenge = `Clarify assumptions to prevent misunderstandings.`;
      priorityScore = 40;
      break;
  }

  const safeFromName = fromName.replace(/\s+/g, '_');
  return {
    id: `overlay-${safeFromName}-${planet}-H${house}`,
    fromPerson: fromName,
    toPerson: toName,
    planet,
    planetSign,
    houseInTarget: house,
    targetSign,
    status,
    theme,
    whatItMeans,
    why: `${fromName}'s ${planet} is in ${planetSign}. Relative to ${toName}'s Lagna, this occupies House ${house}.`,
    positiveSide,
    possibleChallenge,
    priorityScore
  };
}

function checkCrossDrishti(
  chartFrom: KundaliChart,
  chartTo: KundaliChart,
  nameFrom: string,
  nameTo: string,
  results: DrishtiMatchInsight[]
) {
  const lagnaToIdx = signIndex(chartTo.lagnaSign);
  const safeNameFrom = nameFrom.replace(/\s+/g, '_');

  // 1. Jupiter special drishti (5th, 7th, 9th)
  const jupFrom = chartFrom.planets.Jupiter;
  if (jupFrom) {
    const jupSignIdx = signIndex(jupFrom.sign);
    const jupOffsets = [5, 7, 9];
    for (const offset of jupOffsets) {
      const aspectedSignIdx = (jupSignIdx + offset - 1) % 12;
      const aspectedHouseInTo = ((aspectedSignIdx - lagnaToIdx + 12) % 12) + 1;

      // Check if target has Moon or Venus or Lagna in aspected sign
      if (aspectedHouseInTo === 1) {
        results.push({
          id: `drishti-${safeNameFrom}-Jup-Lagna`,
          fromPerson: nameFrom,
          toPerson: nameTo,
          fromPlanet: 'Jupiter',
          toPlanetOrHouse: `${nameTo}'s Lagna (1st House)`,
          status: 'Supportive',
          headline: `${nameFrom}'s Jupiter casts Protective Drishti on ${nameTo}'s Lagna`,
          whatItMeans: `Jupiter's classical 5/7/9th gaze brings benevolence, reassurance, and emotional warmth directly to ${nameTo}'s personal vitality.`,
          why: `${nameFrom}'s Jupiter in ${jupFrom.sign} casts a ${offset}th house Drishti upon ${nameTo}'s Lagna sign (${chartTo.lagnaSign}).`,
          positiveSide: `Instills deep confidence, optimism, and forgiveness during stressful moments.`,
          possibleChallenge: `Avoid taking the partner's easy forgiveness for granted.`,
          priorityScore: 90
        });
      }

      if (signIndex(chartTo.planets.Moon.sign) === aspectedSignIdx) {
        results.push({
          id: `drishti-${safeNameFrom}-Jup-Moon`,
          fromPerson: nameFrom,
          toPerson: nameTo,
          fromPlanet: 'Jupiter',
          toPlanetOrHouse: `${nameTo}'s Moon`,
          status: 'Supportive',
          headline: `Guru-Chandra Influence: ${nameFrom}'s Jupiter aspects ${nameTo}'s Moon`,
          whatItMeans: `This is an auspicious cross-chart combination. Jupiter elevates the partner's emotional state, soothing anxiety and cultivating peace.`,
          why: `${nameFrom}'s Jupiter in ${jupFrom.sign} aspects ${nameTo}'s Moon in ${chartTo.planets.Moon.sign} via ${offset}th Drishti.`,
          positiveSide: `Profound emotional comfort, mutual laughter, and psychological security.`,
          possibleChallenge: `None significant; purely protective.`,
          priorityScore: 92
        });
      }
    }
  }

  // 2. Saturn special drishti (3rd, 7th, 10th)
  const satFrom = chartFrom.planets.Saturn;
  if (satFrom) {
    const satSignIdx = signIndex(satFrom.sign);
    const satOffsets = [3, 7, 10];
    for (const offset of satOffsets) {
      const aspectedSignIdx = (satSignIdx + offset - 1) % 12;

      if (signIndex(chartTo.planets.Moon.sign) === aspectedSignIdx) {
        results.push({
          id: `drishti-${safeNameFrom}-Sat-Moon`,
          fromPerson: nameFrom,
          toPerson: nameTo,
          fromPlanet: 'Saturn',
          toPlanetOrHouse: `${nameTo}'s Moon`,
          status: 'Mixed',
          headline: `Saturn Grounding: ${nameFrom}'s Saturn aspects ${nameTo}'s Moon`,
          whatItMeans: `Saturn brings duty, gravity, and stability to ${nameTo}'s emotional space. While highly anchoring, it requires conscious warmth to avoid feeling overly serious.`,
          why: `${nameFrom}'s Saturn in ${satFrom.sign} casts a ${offset}th aspect on ${nameTo}'s Moon in ${chartTo.planets.Moon.sign}.`,
          positiveSide: `Incredible loyalty, steadfast dependability, and long-term commitment.`,
          possibleChallenge: `Remember to nurture lighthearted affection so discipline does not overshadow warmth.`,
          priorityScore: 82
        });
      }
    }
  }
}
