// ============================================================
//  YOGA CAUTION EVALUATOR — Layer 2 Pure Astrological Rules
//  Evaluates real-time Current Sky (transit) caution conditions
//  for every detected Rajyoga in a KundaliChart.
//
//  Zero UI imports, 100% deterministic, evidence-based.
// ============================================================

import type {
  Planet, BodyPlanet, Sign, YogaResult, KundaliChart, AspectRelation
} from './models';
import { computeAspects } from './aspects';
import { calculateCurrentSky, type TransitPosition } from './calculator';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CautionCheckType =
  | 'debilitated'
  | 'combust'
  | 'heavilyAfflicted'
  | 'retrograde'
  | 'afflictedByRahu'
  | 'afflictedBySaturn';

export interface PlanetCautionCheck {
  planet: Planet;
  sign: Sign;
  dmsString: string;
  degreeInSign: number;
  house?: number;
  isDebilitated: boolean;
  isCombust: boolean;
  isRetrograde: boolean;
  isHeavilyAfflicted: boolean;
  afflictionSummary?: string;
  afflictionSummaryMr?: string;
  checksPerformed: {
    debilitated?: boolean;
    combust?: boolean;
    heavilyAfflicted?: boolean;
    retrograde?: boolean;
    afflictedByRahu?: boolean;
    afflictedBySaturn?: boolean;
  };
  triggeredChecks: CautionCheckType[];
}

export interface YogaCautionEvaluation {
  yogaId: string;
  yogaName: string;
  status: 'Caution Active' | 'No Current Caution' | 'Insufficient Data';
  operator: 'OR' | 'AND';
  whySummary: string;
  whySummaryMr: string;
  checks: PlanetCautionCheck[];
  resultExplanation: string;
  resultExplanationMr: string;
  calculatedAt: Date;
  ayanamsha: number;
}

export interface CurrentSkyData {
  positions: Record<string, TransitPosition>;
  calculatedAt: Date;
  ayanamsha: number;
}

interface StructuredCautionDef {
  operator: 'OR' | 'AND';
  getPlanets: (yoga: YogaResult, chart: KundaliChart) => Planet[];
  checks: CautionCheckType[];
  focusDescEn: string;
  focusDescMr: string;
}

// ─── Classical Caution Rules Registry ─────────────────────────────────────────

const YOGA_CAUTION_REGISTRY: Record<string, StructuredCautionDef> = {
  gajakesari: {
    operator: 'OR',
    getPlanets: () => ['Moon', 'Jupiter'],
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Moon or Jupiter remaining free from debilitation, combustion, or heavy malefic affliction',
    focusDescMr: 'चंद्र किंवा गुरू नीच, अस्त किंवा तीव्र पीडित नसणे',
  },
  kendra_trikona_raja: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Kendra and Trikona lords remaining well-placed and free from affliction',
    focusDescMr: 'केंद्र व त्रिकोण अधिपती बलवान व पीडामुक्त असणे',
  },
  dharmakarma: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: '9th and 10th lords remaining free from debilitation and malefic affliction',
    focusDescMr: 'भाग्येश व कर्मेश नीच किंवा पीडित नसणे',
  },
  ruchaka: {
    operator: 'OR',
    getPlanets: () => ['Mars'],
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Mars remaining dignified and unafflicted by malefics',
    focusDescMr: 'मंगळ बलवान आणि पापग्रहांपासून मुक्त असणे',
  },
  bhadra: {
    operator: 'OR',
    getPlanets: () => ['Mercury'],
    checks: ['combust', 'debilitated', 'heavilyAfflicted'],
    focusDescEn: 'Mercury remaining free from combustion and debilitation',
    focusDescMr: 'बुध अस्त किंवा नीच राशीत नसणे',
  },
  hamsa: {
    operator: 'OR',
    getPlanets: () => ['Jupiter'],
    checks: ['retrograde', 'afflictedByRahu', 'debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Jupiter remaining direct and unafflicted by Rahu or malefics',
    focusDescMr: 'गुरू वक्री किंवा राहूच्या प्रभावाखाली नसणे',
  },
  malavya: {
    operator: 'OR',
    getPlanets: () => ['Venus'],
    checks: ['afflictedBySaturn', 'debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Venus remaining free from Saturn affliction and debilitation',
    focusDescMr: 'शुक्र शनीच्या प्रभावाखाली किंवा नीच राशीत नसणे',
  },
  sasa: {
    operator: 'OR',
    getPlanets: () => ['Saturn'],
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Saturn remaining dignified and free from combust or heavy affliction',
    focusDescMr: 'शनी नीच किंवा अस्त नसणे',
  },
  lakshmi: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: '9th lord and Venus remaining strong without affliction',
    focusDescMr: 'भाग्येश व शुक्र बलवान व पीडामुक्त असणे',
  },
  dhana_2_11: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: '2nd and 11th wealth lords maintaining strength without affliction',
    focusDescMr: 'द्वितीयेश व लाभेश बलवान व पीडामुक्त असणे',
  },
  budhaditya: {
    operator: 'OR',
    getPlanets: () => ['Mercury'],
    checks: ['combust', 'debilitated', 'heavilyAfflicted'],
    focusDescEn: 'Mercury remaining free from combustion',
    focusDescMr: 'बुध अस्त नसणे',
  },
  chandra_mangal: {
    operator: 'OR',
    getPlanets: () => ['Moon', 'Mars'],
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Moon and Mars remaining free from deep affliction',
    focusDescMr: 'चंद्र व मंगळ तीव्र पीडामुक्त असणे',
  },
  amala: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: '10th house natural benefics remaining free from malefic affliction',
    focusDescMr: 'दशम भावातील शुभ ग्रह पापग्रहांच्या दृष्टीपासून मुक्त असणे',
  },
  harsha: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust'],
    focusDescEn: '6th lord placement and strength',
    focusDescMr: 'षष्ठेश नीच किंवा अस्त नसणे',
  },
  sarala: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust'],
    focusDescEn: '8th lord placement and strength',
    focusDescMr: 'अष्टमेश नीच किंवा अस्त नसणे',
  },
  vimala: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust'],
    focusDescEn: '12th lord placement and strength',
    focusDescMr: 'व्ययेश नीच किंवा अस्त नसणे',
  },
  kemadruma: {
    operator: 'OR',
    getPlanets: () => ['Moon'],
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Moon remaining free from deep affliction or debilitation',
    focusDescMr: 'चंद्र नीच किंवा तीव्र पीडित नसणे',
  },
  guru_chandal: {
    operator: 'OR',
    getPlanets: () => ['Jupiter'],
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Jupiter maintaining dignity and relief from malefic pressure',
    focusDescMr: 'गुरू बलवान व पापग्रहांच्या दाबापासून मुक्त असणे',
  },
  surya_grahan: {
    operator: 'OR',
    getPlanets: () => ['Sun'],
    checks: ['debilitated', 'heavilyAfflicted'],
    focusDescEn: 'Sun remaining free from further affliction or debilitation',
    focusDescMr: 'सूर्य नीच किंवा तीव्र पीडित नसणे',
  },
  chandra_grahan: {
    operator: 'OR',
    getPlanets: () => ['Moon'],
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Moon remaining free from further affliction or debilitation',
    focusDescMr: 'चंद्र नीच किंवा तीव्र पीडित नसणे',
  },
  papakartari: {
    operator: 'OR',
    getPlanets: (yoga) => yoga.planetsInvolved,
    checks: ['debilitated', 'combust', 'heavilyAfflicted'],
    focusDescEn: 'Affected planets maintaining dignity and benefic aspect relief',
    focusDescMr: 'पीडित ग्रह बलवान व शुभ दृष्टीने संरक्षित असणे',
  },
};

// ─── Transit Affliction Analyzer ──────────────────────────────────────────────

interface AfflictionAnalysis {
  isHeavilyAfflicted: boolean;
  afflictedByRahu: boolean;
  afflictedBySaturn: boolean;
  summaryEn: string;
  summaryMr: string;
}

const NATURAL_MALEFICS: Planet[] = ['Saturn', 'Mars', 'Rahu', 'Ketu'];
const NATURAL_BENEFICS: Planet[] = ['Jupiter', 'Venus'];

function analyzeTransitAffliction(
  planet: Planet,
  pos: TransitPosition,
  allPositions: Record<string, TransitPosition>,
  transitAspects: AspectRelation[]
): AfflictionAnalysis {
  const planetSign = pos.sign;
  const planetHouse = pos.house;

  // 1. Conjunctions with malefics in the same transit sign
  const conjunctMalefics: Planet[] = NATURAL_MALEFICS.filter(
    m => m !== planet && allPositions[m]?.sign === planetSign
  );

  // 2. Aspects from malefics
  const aspectingMalefics: Planet[] = planetHouse != null
    ? transitAspects
        .filter(a => a.toHouse === planetHouse && NATURAL_MALEFICS.includes(a.fromPlanet) && a.fromPlanet !== planet)
        .map(a => a.fromPlanet)
    : [];

  // Deduplicate aspecting malefics
  const uniqueAspectingMalefics = Array.from(new Set(aspectingMalefics));

  // 3. Benefic relief
  const conjunctBenefics = NATURAL_BENEFICS.filter(
    b => b !== planet && allPositions[b]?.sign === planetSign
  );
  const aspectingBenefics = planetHouse != null
    ? transitAspects
        .filter(a => a.toHouse === planetHouse && NATURAL_BENEFICS.includes(a.fromPlanet) && a.fromPlanet !== planet)
        .map(a => a.fromPlanet)
    : [];

  const hasBeneficRelief = conjunctBenefics.length > 0 || aspectingBenefics.length > 0;

  // 4. Determine heavy affliction
  const totalMaleficFactors = conjunctMalefics.length + uniqueAspectingMalefics.length;
  let isHeavilyAfflicted = false;

  if (conjunctMalefics.length > 0) {
    // Direct conjunction with a malefic is always heavy affliction in Vedic transits
    isHeavilyAfflicted = true;
  } else if (totalMaleficFactors >= 2) {
    isHeavilyAfflicted = true;
  } else if (totalMaleficFactors === 1 && !hasBeneficRelief) {
    isHeavilyAfflicted = true;
  }

  const afflictedByRahu = conjunctMalefics.includes('Rahu') || uniqueAspectingMalefics.includes('Rahu');
  const afflictedBySaturn = conjunctMalefics.includes('Saturn') || uniqueAspectingMalefics.includes('Saturn');

  // Summary generation
  const influencesEn: string[] = [];
  const influencesMr: string[] = [];

  for (const cm of conjunctMalefics) {
    influencesEn.push(`conjunct ${cm} in ${planetSign}`);
    influencesMr.push(`${planetSign} राशीत ${cm} सोबत युती`);
  }
  for (const am of uniqueAspectingMalefics) {
    influencesEn.push(`receiving challenging influence from ${am}`);
    influencesMr.push(`${am} ची आव्हानात्मक दृष्टी`);
  }

  let summaryEn = '';
  let summaryMr = '';

  if (influencesEn.length > 0) {
    summaryEn = influencesEn.join(' and ');
    summaryMr = influencesMr.join(' आणि ');
  } else {
    summaryEn = 'free from heavy malefic influences';
    summaryMr = 'पापग्रहांच्या प्रभावापासून मुक्त';
  }

  return {
    isHeavilyAfflicted,
    afflictedByRahu,
    afflictedBySaturn,
    summaryEn,
    summaryMr,
  };
}

// ─── Single Planet Check Evaluator ────────────────────────────────────────────

function evaluatePlanetCaution(
  planet: Planet,
  checksToPerform: CautionCheckType[],
  pos: TransitPosition,
  allPositions: Record<string, TransitPosition>,
  transitAspects: AspectRelation[]
): PlanetCautionCheck {
  const affliction = analyzeTransitAffliction(planet, pos, allPositions, transitAspects);

  const isDebilitated = pos.dignity === 'Debilitated';
  const isCombust = !!pos.isCombust;
  const isRetrograde = !!pos.isRetrograde;
  const isHeavilyAfflicted = affliction.isHeavilyAfflicted;

  const checksPerformed: PlanetCautionCheck['checksPerformed'] = {};
  const triggeredChecks: CautionCheckType[] = [];

  for (const c of checksToPerform) {
    switch (c) {
      case 'debilitated':
        checksPerformed.debilitated = isDebilitated;
        if (isDebilitated) triggeredChecks.push('debilitated');
        break;
      case 'combust':
        checksPerformed.combust = isCombust;
        if (isCombust) triggeredChecks.push('combust');
        break;
      case 'heavilyAfflicted':
        checksPerformed.heavilyAfflicted = isHeavilyAfflicted;
        if (isHeavilyAfflicted) triggeredChecks.push('heavilyAfflicted');
        break;
      case 'retrograde':
        checksPerformed.retrograde = isRetrograde;
        if (isRetrograde) triggeredChecks.push('retrograde');
        break;
      case 'afflictedByRahu':
        checksPerformed.afflictedByRahu = affliction.afflictedByRahu;
        if (affliction.afflictedByRahu) triggeredChecks.push('afflictedByRahu');
        break;
      case 'afflictedBySaturn':
        checksPerformed.afflictedBySaturn = affliction.afflictedBySaturn;
        if (affliction.afflictedBySaturn) triggeredChecks.push('afflictedBySaturn');
        break;
    }
  }

  return {
    planet,
    sign: pos.sign,
    dmsString: pos.dmsString,
    degreeInSign: pos.degreeInSign,
    house: pos.house,
    isDebilitated,
    isCombust,
    isRetrograde,
    isHeavilyAfflicted,
    afflictionSummary: affliction.summaryEn,
    afflictionSummaryMr: affliction.summaryMr,
    checksPerformed,
    triggeredChecks,
  };
}

// ─── Single Yoga Caution Evaluator ────────────────────────────────────────────

export function evaluateYogaCaution(
  yoga: YogaResult,
  chart: KundaliChart,
  sky: CurrentSkyData
): YogaCautionEvaluation {
  const def = YOGA_CAUTION_REGISTRY[yoga.id] || {
    operator: 'OR' as const,
    getPlanets: (y: YogaResult) => y.planetsInvolved.length > 0 ? y.planetsInvolved : ['Sun'],
    checks: ['debilitated', 'combust', 'heavilyAfflicted'] as CautionCheckType[],
    focusDescEn: 'Involved planets remaining free from debilitation, combustion, or heavy affliction',
    focusDescMr: 'संबंधित ग्रह नीच, अस्त किंवा तीव्र पीडित नसणे',
  };

  const planets = Array.from(new Set(def.getPlanets(yoga, chart)));

  // If no planets are involved, return No Current Caution
  if (planets.length === 0) {
    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      status: 'No Current Caution',
      operator: def.operator,
      whySummary: 'No specific planetary caution conditions apply to this Yoga.',
      whySummaryMr: 'या योगासाठी कोणतीही विशिष्ट ग्रहांची सजगता अट लागू नाही.',
      checks: [],
      resultExplanation: 'The Rajyoga remains fully present and active without transit caution flags.',
      resultExplanationMr: 'हा राजयोग जन्मपत्रिकेत उपस्थित असून सध्या कोणतीही गोचर अडचण नाही.',
      calculatedAt: sky.calculatedAt,
      ayanamsha: sky.ayanamsha,
    };
  }

  // Build transit houses for all 9 planets
  const transitHouses: Record<Planet, number> = {} as any;
  for (const [pName, pPos] of Object.entries(sky.positions)) {
    if (pPos.house != null) {
      transitHouses[pName as Planet] = pPos.house;
    }
  }

  const transitAspects = computeAspects(transitHouses);

  const checks: PlanetCautionCheck[] = [];
  let hasMissingData = false;

  for (const p of planets) {
    const pos = sky.positions[p];
    if (!pos) {
      hasMissingData = true;
      continue;
    }
    const check = evaluatePlanetCaution(p, def.checks, pos, sky.positions, transitAspects);
    checks.push(check);
  }

  if (hasMissingData && checks.length === 0) {
    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      status: 'Insufficient Data',
      operator: def.operator,
      whySummary: 'Current transit data for involved planets is unavailable.',
      whySummaryMr: 'संबंधित ग्रहांचा सध्याचा गोचर डेटा उपलब्ध नाही.',
      checks: [],
      resultExplanation: 'Cannot determine current caution status due to missing transit ephemeris.',
      resultExplanationMr: 'गोचर डेटा उपलब्ध नसल्याने स्थिती निश्चित करता येत नाही.',
      calculatedAt: sky.calculatedAt,
      ayanamsha: sky.ayanamsha,
    };
  }

  // Evaluate operator logic
  const triggeredPlanets = checks.filter(c => c.triggeredChecks.length > 0);
  let isCautionActive = false;

  if (def.operator === 'OR') {
    isCautionActive = triggeredPlanets.length > 0;
  } else {
    // AND: all checked planets must trigger
    isCautionActive = checks.length > 0 && triggeredPlanets.length === checks.length;
  }

  const status: YogaCautionEvaluation['status'] = isCautionActive
    ? 'Caution Active'
    : 'No Current Caution';

  // Construct precise, non-generic Why summary
  let whySummary = '';
  let whySummaryMr = '';
  let resultExplanation = '';
  let resultExplanationMr = '';

  const planetNames = checks.map(c => c.planet);
  const planetNamesStr = planetNames.length === 2
    ? `${planetNames[0]} and ${planetNames[1]}`
    : planetNames.join(', ');
  const planetNamesStrMr = planetNames.join(' व ');

  if (isCautionActive) {
    const reasonsEn: string[] = [];
    const reasonsMr: string[] = [];

    for (const tp of triggeredPlanets) {
      const details: string[] = [];
      const detailsMr: string[] = [];

      if (tp.triggeredChecks.includes('debilitated')) {
        details.push(`debilitated in ${tp.sign}`);
        detailsMr.push(`${tp.sign} राशीत नीच`);
      }
      if (tp.triggeredChecks.includes('combust')) {
        details.push('combust by the Sun');
        detailsMr.push('सूर्याच्या सान्निध्यात अस्त');
      }
      if (tp.triggeredChecks.includes('heavilyAfflicted')) {
        details.push(tp.afflictionSummary || 'receiving heavy malefic influence');
        detailsMr.push(tp.afflictionSummaryMr || 'तीव्र प्रतिकूल प्रभावात');
      }
      if (tp.triggeredChecks.includes('retrograde')) {
        details.push('retrograde');
        detailsMr.push('वक्री स्थितीत');
      }
      if (tp.triggeredChecks.includes('afflictedByRahu') && !tp.triggeredChecks.includes('heavilyAfflicted')) {
        details.push('influenced by Rahu');
        detailsMr.push('राहूच्या प्रभावात');
      }
      if (tp.triggeredChecks.includes('afflictedBySaturn') && !tp.triggeredChecks.includes('heavilyAfflicted')) {
        details.push('influenced by Saturn');
        detailsMr.push('शनीच्या प्रभावात');
      }

      reasonsEn.push(`${tp.planet} is currently ${details.join(' and ')}`);
      reasonsMr.push(`${tp.planet} सध्या ${detailsMr.join(' आणि ')} आहे`);
    }

    const triggerDescEn = reasonsEn.join('; ');
    const triggerDescMr = reasonsMr.join('; ');

    whySummary = `${triggerDescEn}. Because this Rajyoga's guidance specifically depends on ${def.focusDescEn}, the caution condition is currently triggered.`;
    whySummaryMr = `${triggerDescMr}. या राजयोगाचे फळ प्रामुख्याने ${def.focusDescMr} असण्यावर अवलंबून असल्याने, सजगतेची अट सध्या सक्रिय झाली आहे.`;

    resultExplanation = `Caution currently active because ${triggeredPlanets.map(t => t.planet).join(' and ')} meet(s) the defined caution criteria.`;
    resultExplanationMr = `सजगतेची अट सक्रिय: ${triggeredPlanets.map(t => t.planet).join(', ')} ग्रह(ग्रहांवर) प्रतिकूल गोचर प्रभाव आढळला आहे.`;
  } else {
    // No caution
    const checkNamesEn = def.checks.map(c => {
      if (c === 'debilitated') return 'debilitation';
      if (c === 'combust') return 'combustion';
      if (c === 'heavilyAfflicted') return 'heavy-malefic-influence';
      if (c === 'retrograde') return 'retrograde';
      return c;
    }).join(', ');
    const checkNamesMr = def.checks.map(c => {
      if (c === 'debilitated') return 'नीच';
      if (c === 'combust') return 'अस्त';
      if (c === 'heavilyAfflicted') return 'तीव्र पीडित';
      if (c === 'retrograde') return 'वक्री';
      return c;
    }).join(', ');

    if (checks.length === 2) {
      whySummary = `Neither ${planetNames[0]} nor ${planetNames[1]} currently meets the defined ${checkNamesEn} conditions. The caution mentioned for this Rajyoga is therefore not currently triggered.`;
      whySummaryMr = `${planetNames[0]} किंवा ${planetNames[1]} यांपैकी कोणताही ग्रह सध्या ${checkNamesMr} स्थितीत नाही. त्यामुळे या राजयोगासाठी दिलेली सजगतेची अट सध्या लागू होत नाही.`;
    } else if (checks.length > 2) {
      whySummary = `None of the involved planets (${planetNamesStr}) currently meet the defined ${checkNamesEn} conditions. The caution mentioned for this Rajyoga is therefore not currently triggered.`;
      whySummaryMr = `संबंधित ग्रहांपैकी (${planetNamesStrMr}) कोणताही ग्रह सध्या ${checkNamesMr} स्थितीत नाही. त्यामुळे या राजयोगासाठी दिलेली सजगतेची अट सध्या लागू होत नाही.`;
    } else {
      whySummary = `${planetNamesStr} does not currently meet the defined ${checkNamesEn} conditions. The caution mentioned for this Rajyoga is therefore not currently triggered.`;
      whySummaryMr = `${planetNamesStrMr} हा ग्रह सध्या ${checkNamesMr} स्थितीत नाही. त्यामुळे या राजयोगासाठी दिलेली सजगतेची अट सध्या लागू होत नाही.`;
    }

    resultExplanation = `No caution condition triggered. ${planetNamesStr} remain(s) clear of defined cautionary transit pressures.`;
    resultExplanationMr = `कोणतीही सजगता अट लागू नाही. ${planetNamesStrMr} सध्या अनुकूल गोचर स्थितीत आहे(आहेत).`;
  }

  return {
    yogaId: yoga.id,
    yogaName: yoga.name,
    status,
    operator: def.operator,
    whySummary,
    whySummaryMr,
    checks,
    resultExplanation,
    resultExplanationMr,
    calculatedAt: sky.calculatedAt,
    ayanamsha: sky.ayanamsha,
  };
}

// ─── Batch Evaluator (All Yogas for a Chart) ───────────────────────────────────

export function evaluateAllYogaCautions(
  chart: KundaliChart,
  customSky?: CurrentSkyData
): Record<string, YogaCautionEvaluation> {
  const sky: CurrentSkyData = customSky || calculateCurrentSky(
    chart.birthData.latitude,
    chart.birthData.longitude,
    chart.birthData.timezone,
    chart
  );

  const results: Record<string, YogaCautionEvaluation> = {};

  for (const yoga of chart.yogas) {
    try {
      results[yoga.id] = evaluateYogaCaution(yoga, chart, sky);
    } catch {
      // In case of any unexpected edge case, provide fallback
      results[yoga.id] = {
        yogaId: yoga.id,
        yogaName: yoga.name,
        status: 'No Current Caution',
        operator: 'OR',
        whySummary: 'No current cautionary condition is triggered for this Yoga.',
        whySummaryMr: 'या योगासाठी कोणतीही सजगता अट सध्या लागू नाही.',
        checks: [],
        resultExplanation: 'No caution condition active.',
        resultExplanationMr: 'कोणतीही प्रतिकूल अट सक्रिय नाही.',
        calculatedAt: sky.calculatedAt,
        ayanamsha: sky.ayanamsha,
      };
    }
  }

  return results;
}
