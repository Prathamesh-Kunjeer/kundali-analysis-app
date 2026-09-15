// ============================================================
//  OVERVIEW INTERPRETATION ENGINE (overviewEngine.ts)
//  Layer 2: Evidence-First Personalized Kundali Analysis
// ============================================================

import type {
  KundaliChart,
  Planet,
  BodyPlanet,
  Sign,
  Dignity,
  StrengthLevel,
  FunctionalNature,
  AspectRelation,
  YogaResult,
} from './models';
import { RASHIS, PLANET_LABELS } from './constants';
import { buildDivisionalChart } from './varga';

export interface LocalizedText {
  en: string;
  mr: string;
}

export interface TraceabilityData {
  planets: Planet[];
  houses: number[];
  signs: Sign[];
  aspects?: string[];
  yogas?: string[];
  dashaLink?: string;
}

export interface OverviewInsight {
  category: 'career' | 'wealth' | 'relationships' | 'growth';
  icon: string;
  title: LocalizedText;
  headline: LocalizedText;
  level: 'supportive' | 'mixed' | 'mindful';
  confidence: 'strong' | 'moderate' | 'mixed';
  evidence: LocalizedText[];
  interpretations: LocalizedText[];
  cautions: LocalizedText[];
  traceability: TraceabilityData;
  targetTab: string;
}

// ─── TRANSLATION & NOMENCLATURE HELPERS ───────────────────────────────────────

export const PLANET_NAMES_MR: Record<Planet, string> = {
  Sun: 'सूर्य',
  Moon: 'चंद्र',
  Mars: 'मंगळ',
  Mercury: 'बुध',
  Jupiter: 'गुरु',
  Venus: 'शुक्र',
  Saturn: 'शनी',
  Rahu: 'राहू',
  Ketu: 'केतू',
  Ascendant: 'लग्न',
};

export const SIGN_NAMES_MR: Record<Sign, string> = {
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तूळ',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन',
};

export const HOUSE_NAMES_MR: Record<number, string> = {
  1: 'प्रथम भाव (लग्न)',
  2: 'द्वितीय भाव (धन भाव)',
  3: 'तृतीय भाव (पराक्रम भाव)',
  4: 'चतुर्थ भाव (सुख भाव)',
  5: 'पंचम भाव (संतती व बुद्धी भाव)',
  6: 'षष्ठ भाव (सेवा व स्पर्धा भाव)',
  7: 'सप्तम भाव (कलत्र/भागीदारी भाव)',
  8: 'अष्टम भाव (आयुष्य व गूढ भाव)',
  9: 'नवम भाव (भाग्य भाव)',
  10: 'दशम भाव (कर्म/करिअर भाव)',
  11: 'एकादश भाव (लाभ भाव)',
  12: 'द्वादश भाव (व्यय भाव)',
};

export const HOUSE_ORDINALS_EN: Record<number, string> = {
  1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th',
  7: '7th', 8: '8th', 9: '9th', 10: '10th', 11: '11th', 12: '12th',
};

function pName(p: Planet): LocalizedText {
  return { en: PLANET_LABELS[p]?.english || p, mr: PLANET_NAMES_MR[p] || p };
}

function sName(s: Sign): LocalizedText {
  return { en: s, mr: SIGN_NAMES_MR[s] || s };
}

function hName(h: number): LocalizedText {
  return { en: `${HOUSE_ORDINALS_EN[h] || h} house`, mr: HOUSE_NAMES_MR[h] || `${h}वा भाव` };
}

function dignityText(d: Dignity): LocalizedText {
  switch (d) {
    case 'Exalted': return { en: 'Exalted', mr: 'उच्च' };
    case 'OwnSign': return { en: 'in Own Sign', mr: 'स्वराशीत' };
    case 'Moolatrikona': return { en: 'in Moolatrikona', mr: 'मूलत्रिकोण राशीत' };
    case 'GreatFriend':
    case 'Friend': return { en: 'in a Friendly Sign', mr: 'मित्र राशीत' };
    case 'Neutral': return { en: 'in a Neutral Sign', mr: 'सम राशीत' };
    case 'Enemy':
    case 'GreatEnemy': return { en: 'in an Unfriendly Sign', mr: 'शत्रू राशीत' };
    case 'Debilitated': return { en: 'Debilitated', mr: 'नीच' };
    default: return { en: 'in neutral placement', mr: 'सामान्य स्थितीत' };
  }
}

// ─── EVIDENCE EXTRACTORS ─────────────────────────────────────────────────────

interface HouseAspectDetail {
  fromPlanet: Planet;
  strength: string;
  isBenefic: boolean;
}

function getAspectsOnHouse(chart: KundaliChart, targetHouse: number): HouseAspectDetail[] {
  const result: HouseAspectDetail[] = [];
  const benefics: Planet[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

  for (const rel of chart.aspects) {
    if (rel.toHouse === targetHouse && rel.fromPlanet !== 'Ascendant') {
      result.push({
        fromPlanet: rel.fromPlanet,
        strength: rel.strength,
        isBenefic: benefics.includes(rel.fromPlanet),
      });
    }
  }
  return result;
}

// ─── 1. CAREER & STATUS EVALUATOR ────────────────────────────────────────────

export function evaluateCareer(chart: KundaliChart): OverviewInsight {
  const h10 = chart.houses[9]; // House 10
  const h10Sign = h10.sign;
  const h10SignData = RASHIS[h10.signIndex];
  const h10Lord = h10.lord;
  const h10Planets = h10.planets.filter(p => p !== 'Ascendant');
  const lordAnalysis = chart.planetAnalysis[h10Lord];
  const lordPos = lordAnalysis?.position;
  const lordHouse = lordPos?.house || 10;
  const lordDignity = lordPos?.dignity || 'Neutral';
  const lordStrength = lordAnalysis?.strengthLevel || 'Moderate';

  const aspectsOn10 = getAspectsOnHouse(chart, 10);
  const beneficAspects = aspectsOn10.filter(a => a.isBenefic);
  const saturnAspect = aspectsOn10.some(a => a.fromPlanet === 'Saturn');
  const marsAspect = aspectsOn10.some(a => a.fromPlanet === 'Mars');
  const jupiterAspect = aspectsOn10.some(a => a.fromPlanet === 'Jupiter');

  // Check relevant Yogas
  const relevantYogas = chart.yogas.filter(y =>
    y.housesInvolved.includes(10) ||
    y.planetsInvolved.includes(h10Lord) ||
    ['Mahapurusha', 'RajaYoga'].includes(y.category)
  );

  // Check current Mahadasha connection
  const curMaha = chart.dasha.currentMahadasha?.planet;
  const dashaConnected = Boolean(curMaha && (
    curMaha === h10Lord ||
    (h10Planets as (Planet | undefined)[]).includes(curMaha) ||
    aspectsOn10.some(a => a.fromPlanet === curMaha)
  ));

  // Check D10 Dashamsha cross-check
  let d10Summary: { en: string; mr: string } | null = null;
  try {
    const d10Chart = buildDivisionalChart(chart, 10);
    const d10LordPos = (h10Lord !== 'Ascendant') ? d10Chart.planets[h10Lord as BodyPlanet] : undefined;
    if (d10LordPos && ['Exalted', 'OwnSign'].includes(d10LordPos.dignity)) {
      d10Summary = {
        en: `In Dashamsha (D10 career chart), ${pName(h10Lord).en} is fortified in ${d10LordPos.dignity}, reinforcing lasting executive potential.`,
        mr: `दशमांश (D10 करिअर चार्ट) मध्ये ${pName(h10Lord).mr} ग्रह ${dignityText(d10LordPos.dignity).mr} असून व्यावसायिक ताकदीला बळकटी देतो.`,
      };
    }
  } catch {
    // Graceful fallback if varga engine unavailable
  }

  // Determine Level & Confidence
  let level: 'supportive' | 'mixed' | 'mindful' = 'supportive';
  let confidence: 'strong' | 'moderate' | 'mixed' = 'moderate';

  if (lordDignity === 'Exalted' || lordDignity === 'OwnSign' || lordStrength === 'Strong') {
    level = 'supportive';
    confidence = 'strong';
  } else if (lordDignity === 'Debilitated' || lordAnalysis?.isCombust || (lordHouse === 6 && lordStrength === 'Weak') || (lordHouse === 8 && lordStrength === 'Weak')) {
    level = 'mindful';
    confidence = 'moderate';
  } else if (h10Planets.length > 0 || beneficAspects.length > 0) {
    level = 'supportive';
    confidence = 'moderate';
  } else {
    level = 'mixed';
    confidence = 'mixed';
  }

  // Compose Evidence
  const evidence: LocalizedText[] = [];

  // Evidence 1: 10th house sign and its natural career temperament
  const elementDescriptorEn =
    h10SignData.element === 'Fire' ? 'initiative, decisive leadership, and action'
    : h10SignData.element === 'Earth' ? 'practical execution, organizational systems, and material stability'
    : h10SignData.element === 'Air' ? 'communication, intellectual strategy, analysis, and partnerships'
    : 'empathy, creative insight, service, and intuitive counseling';

  const elementDescriptorMr =
    h10SignData.element === 'Fire' ? 'स्वायत्त निर्णय, धडाडी आणि नेतृत्व'
    : h10SignData.element === 'Earth' ? 'नियोजनबद्ध अंमलबजावणी, व्यवस्थापन आणि आर्थिक स्थैर्य'
    : h10SignData.element === 'Air' ? 'संवाद कौशल्य, रणनीती, बौद्धिक विश्लेषण आणि नेटवर्किंग'
    : 'सहवेदना, कल्पकता, सेवा आणि समुपदेशन';

  evidence.push({
    en: `10th house is set in ${sName(h10Sign).en} (${h10SignData.element} sign), channeling career focus into ${elementDescriptorEn}.`,
    mr: `दशम भाव ${sName(h10Sign).mr} राशीत (${h10SignData.element} तत्त्व) असून तो करिअरमध्ये ${elementDescriptorMr} देतो.`,
  });

  // Evidence 2: 10th lord placement and dignity
  const lordPlacementDescriptorEn =
    lordHouse === 1 ? 'placed directly in your 1st house (Ascendant), indicating self-made reputation and personalized initiative'
    : lordHouse === 2 ? 'connected to the 2nd house of resources, linking career growth with wealth generation and advisory skills'
    : lordHouse === 3 ? 'placed in the 3rd house of enterprise, favoring communication, tech, travel, or entrepreneurial effort'
    : lordHouse === 4 ? 'stationed in the 4th house, favoring institutions, infrastructure, public service, or steady organizational environments'
    : lordHouse === 5 ? 'stationed in the 5th house of intellect, favoring creative strategy, consultation, mentorship, and high-value decisions'
    : lordHouse === 6 ? 'operating in the 6th house of service, emphasizing operational problem-solving, competitive resilience, and procedural mastery'
    : lordHouse === 7 ? 'placed in the 7th house, channeling professional growth through public interactions, strategic alliances, and client relations'
    : lordHouse === 8 ? 'seated in the 8th house, favoring research, crisis management, confidential systems, and transformative work'
    : lordHouse === 9 ? 'stationed in the 9th house of fortune, supporting higher learning, ethical leadership, legal or institutional guidance'
    : lordHouse === 10 ? 'positioned in its own 10th house, bestowing natural authority, executive endurance, and stability in rank'
    : lordHouse === 11 ? 'stationed in the 11th house of gains, maximizing recognition and scaling influence through large networks'
    : 'placed in the 12th house, connecting professional scope with international domains, remote systems, or specialized institutions';

  const lordPlacementDescriptorMr =
    lordHouse === 1 ? `प्रथम भावात (लग्नात) स्थित असून स्वतःच्या कर्तृत्वावर ओळख आणि स्वतंत्र पुढाकार निर्माण करण्यास बळ देतो`
    : lordHouse === 2 ? `द्वितीय (धन) भावात असून करिअरमधील यश आर्थिक वाढ व सल्लागार कौशल्यांशी जोडतो`
    : lordHouse === 3 ? `तृतीय भावात असून स्वतःचे प्रयत्न, संवाद, तंत्रज्ञान किंवा उद्योजकता यांतून प्रगती देतो`
    : lordHouse === 4 ? `चतुर्थ भावात असून संस्थात्मक स्थैर्य, लोकसेवा किंवा पायाभूत क्षेत्रांत यश देतो`
    : lordHouse === 5 ? `पंचम भावात असून बौद्धिक निर्णय, रणनीती, मार्गदर्शन व सर्जनशील कार्यात उत्तम साथ देतो`
    : lordHouse === 6 ? `षष्ठ भावात असून आव्हानांवर मात करणे, सेवा क्षेत्र, कायदेशीर किंवा स्पर्धात्मक कामात चिकाटी देतो`
    : lordHouse === 7 ? `सप्तम भावात असून व्यावसायिक भागीदारी, जनसंपर्क व ग्राहकांशी सुसंवाद यांतून वाढ करतो`
    : lordHouse === 8 ? `अष्टम भावात असून सखोल संशोधन, गुप्त यंत्रणा किंवा संकट निवारणात विशेष कौशल्य देतो`
    : lordHouse === 9 ? `नवम (भाग्य) भावात असून उच्च विद्या, मार्गदर्शन आणि नैतिक नेतृत्वाला उत्तम साथ देतो`
    : lordHouse === 10 ? `दशम भावात स्वगृही असून स्वाभाविक अधिकार, कारभारातील स्थैर्य आणि प्रतिष्ठा प्रदान करतो`
    : lordHouse === 11 ? `एकादश (लाभ) भावात असून मोठे व्यावसायिक नेटवर्क आणि पदोन्नतीतून उत्तम लाभ देतो`
    : `द्वादश भावात असून दूरस्थ संस्था, परदेशी व्यवहार किंवा विशेष संशोधन प्रकल्पांत यश देतो`;

  evidence.push({
    en: `10th lord ${pName(h10Lord).en} is ${dignityText(lordDignity).en} and ${lordPlacementDescriptorEn}.`,
    mr: `दशमेश ${pName(h10Lord).mr} हा ${dignityText(lordDignity).mr} असून तो ${lordPlacementDescriptorMr}.`,
  });

  // Evidence 3: Occupants or Aspects
  if (h10Planets.length > 0) {
    const occListEn = h10Planets.map(p => pName(p).en).join(', ');
    const occListMr = h10Planets.map(p => pName(p).mr).join(', ');
    evidence.push({
      en: `10th house is directly energized by ${occListEn}, adding distinct functional capabilities to your work profile.`,
      mr: `दशम भावात प्रत्यक्ष ${occListMr} विराजमान असल्याने तुमच्या कामाच्या पद्धतीत या ग्रहांचे विशिष्ट गुणधर्म स्पष्ट दिसतात.`,
    });
  } else if (jupiterAspect) {
    evidence.push({
      en: `Jupiter casts a protective aspect onto your 10th house, supporting professional ethics and mentorship support.`,
      mr: `गुरूची शुभ दृष्टी दशम भावावर असल्याने कामाच्या ठिकाणी मार्गदर्शकांचे सहकार्य आणि नैतिक प्रतिष्ठा लाभते.`,
    });
  } else if (saturnAspect) {
    evidence.push({
      en: `Saturn influences your 10th house, rewarding patience, thorough groundwork, and structured responsibility.`,
      mr: `शनीचा प्रभाव दशम भावावर असल्याने घाईगडबडीपेक्षा सातत्यपूर्ण शिस्त आणि जबाबदारीतूनच खरी प्रगती होते.`,
    });
  } else if (marsAspect) {
    evidence.push({
      en: `Mars influences the 10th house, fueling dynamic execution, competitive drive, and decisive leadership.`,
      mr: `मंगळाची दृष्टी दशम भावावर असल्याने कामात गती, स्पर्धात्मक ऊर्जा आणि पुढाकार घेण्याची वृत्ती दिसून येते.`,
    });
  } else if (d10Summary) {
    evidence.push(d10Summary);
  }

  // Compose Headline deeply tailored to chart mechanics
  let headlineEn = '';
  let headlineMr = '';

  if (lordHouse === 1 || (lordHouse === 10 && lordStrength === 'Strong')) {
    headlineEn = `Self-Driven Executive Leadership & Authoritative Impact`;
    headlineMr = `स्वायत्त नेतृत्व, स्वतंत्र ओळख व उच्च प्रशासकीय प्रभाव`;
  } else if (lordHouse === 6 || (saturnAspect && lordHouse !== 11)) {
    headlineEn = `Strategic Mastery Through Problem-Solving, Service & Resilience`;
    headlineMr = `समस्या निवारण, सेवा क्षेत्र व चिकाटीतून सातत्यपूर्ण यश`;
  } else if (lordHouse === 11 || lordHouse === 2) {
    headlineEn = `Commercial Acumen, Network-Driven Scaling & High Value Gains`;
    headlineMr = `व्यावसायिक दूरदृष्टी, नेटवर्किंग व आर्थिक मूल्यवर्धन`;
  } else if (lordHouse === 5 || lordHouse === 9) {
    headlineEn = `Intellectual Strategy, Advisory Guidance & Institutional Scope`;
    headlineMr = `बौद्धिक रणनीती, तज्ज्ञ सल्लागार व मार्गदर्शनपर वाटचाल`;
  } else if (lordHouse === 3 || lordHouse === 7) {
    headlineEn = `Enterprise Growth Through Public Alliances & Dynamic Communication`;
    headlineMr = `जनसंपर्क, भागीदारी व प्रभावी संवादातून व्यावसायिक प्रगती`;
  } else if (lordHouse === 4 || lordHouse === 12) {
    headlineEn = `Organizational Architecture, Foundations & Broad Horizon Operations`;
    headlineMr = `संस्थात्मक पायाभरणी, कार्यक्षम यंत्रणा व दूरगामी विस्तार`;
  } else {
    headlineEn = `Specialized Skill Building & Sustainable Professional Trajectory`;
    headlineMr = `विशेष कौशल्य संपादन व सातत्यपूर्ण स्थिर करिअर वाटचाल`;
  }

  // Compose Interpretations
  const interpretations: LocalizedText[] = [];

  if (lordHouse === 10 || lordHouse === 1 || lordHouse === 9) {
    interpretations.push({
      en: 'Your chart rewards taking direct responsibility for outcomes rather than remaining in purely passive support roles.',
      mr: 'तुमच्या कुंडलीनुसार केवळ पडद्यामागे राहण्याऐवजी स्वतः जबाबदारी घेऊन पुढे आल्यास अधिक सन्मान मिळतो.',
    });
  } else if (lordHouse === 11 || lordHouse === 3) {
    interpretations.push({
      en: 'Building strong collaborative alliances and continuous skill acquisition accelerates your professional leaps.',
      mr: 'सहकाऱ्यांशी सलोखा, योग्य नेटवर्किंग आणि सतत नवीन कौशल्ये शिकल्याने कामात मोठी झेप घेणे सोपे होते.',
    });
  } else {
    interpretations.push({
      en: 'Structured process adherence and establishing domain depth yield more compounding gains than frequent role switching.',
      mr: 'वारंवार क्षेत्र बदलण्यापेक्षा एकाच कामात सखोल प्रावीण्य मिळवल्यास दीर्घकालीन मोठा फायदा होतो.',
    });
  }

  if (dashaConnected && curMaha) {
    interpretations.push({
      en: `Your current running Mahadasha (${pName(curMaha).en}) directly activates your career sphere, making this a pivotal time for execution.`,
      mr: `सध्या चालू असलेली महादशा (${pName(curMaha).mr}) थेट तुमच्या कर्म क्षेत्राला सक्रिय करत असल्याने हा काळ महत्त्वाचा आहे.`,
    });
  }

  // Cautions
  const cautions: LocalizedText[] = [];
  if (lordAnalysis?.isCombust) {
    cautions.push({
      en: 'Combustion of 10th lord suggests asserting your contributions clearly to ensure your effort is not overshadowed by superiors.',
      mr: 'दशमेश अस्त असल्याने स्वतः केलेल्या कामाचे श्रेय इतरांना जाऊ नये यासाठी स्पष्ट संवाद ठेवा.',
    });
  } else if (saturnAspect || lordHouse === 6) {
    cautions.push({
      en: 'Avoid premature frustration during foundational stages; your chart rewards maturity, compounding effort over quick fixes.',
      mr: 'सुरुवातीच्या टप्प्यात अपेक्षित यश मिळण्यास काहीसा वेळ लागू शकतो; घाईगडबड न करता कामातील अचूकतेवर भर द्या.',
    });
  }

  return {
    category: 'career',
    icon: '💼',
    title: { en: 'Career & Status', mr: 'करिअर व प्रतिष्ठा' },
    headline: { en: headlineEn, mr: headlineMr },
    level,
    confidence,
    evidence,
    interpretations,
    cautions,
    traceability: {
      planets: [h10Lord, ...h10Planets],
      houses: [10, lordHouse],
      signs: [h10Sign],
      aspects: aspectsOn10.map(a => `${pName(a.fromPlanet).en} on 10th`),
      yogas: relevantYogas.map(y => y.name),
      dashaLink: dashaConnected && curMaha ? `${pName(curMaha).en} Mahadasha` : undefined,
    },
    targetTab: 'effects',
  };
}

// ─── 2. WEALTH & RESOURCES EVALUATOR ─────────────────────────────────────────

export function evaluateWealth(chart: KundaliChart): OverviewInsight {
  const h2 = chart.houses[1]; // 2nd house (savings/assets)
  const h11 = chart.houses[10]; // 11th house (income/gains)
  const h2Lord = h2.lord;
  const h11Lord = h11.lord;
  const h2Planets = h2.planets.filter(p => p !== 'Ascendant');
  const h11Planets = h11.planets.filter(p => p !== 'Ascendant');

  const h2Analysis = chart.planetAnalysis[h2Lord];
  const h11Analysis = chart.planetAnalysis[h11Lord];
  const jupiterAnalysis = chart.planetAnalysis['Jupiter'];

  const h2LordHouse = h2Analysis?.position?.house || 2;
  const h11LordHouse = h11Analysis?.position?.house || 11;
  const h2Dignity = h2Analysis?.position?.dignity || 'Neutral';
  const h11Dignity = h11Analysis?.position?.dignity || 'Neutral';

  // Mutual connection: 2nd lord in 11th, 11th lord in 2nd, or conjunct
  const hasDhanaSambandha =
    (h2LordHouse === 11 || h11LordHouse === 2) ||
    (h2LordHouse === h11LordHouse && h2LordHouse !== 6 && h2LordHouse !== 8 && h2LordHouse !== 12);

  // Dhana Yogas in chart
  const dhanaYogas = chart.yogas.filter(y => y.category === 'DhanaYoga' || ['Vasumati','Lakshmi','Chandra-Mangala'].some(name => y.name.includes(name)));

  // Outflow factors
  const rahuInWealth = h2Planets.includes('Rahu') || h11Planets.includes('Rahu');
  const marsIn2 = h2Planets.includes('Mars');
  const lordInDusthana = [6, 8, 12].includes(h2LordHouse) || [6, 8, 12].includes(h11LordHouse);
  const jupiterStrong = jupiterAnalysis?.strengthLevel === 'Strong' || jupiterAnalysis?.isExalted || jupiterAnalysis?.isInOwnSign;

  // Determine Level & Confidence
  let level: 'supportive' | 'mixed' | 'mindful' = 'supportive';
  let confidence: 'strong' | 'moderate' | 'mixed' = 'moderate';

  if (dhanaYogas.length > 0 || hasDhanaSambandha || (h2Dignity === 'Exalted' || h11Dignity === 'Exalted')) {
    level = 'supportive';
    confidence = 'strong';
  } else if (lordInDusthana && !jupiterStrong) {
    level = 'mindful';
    confidence = 'moderate';
  } else if (rahuInWealth || marsIn2) {
    level = 'mixed';
    confidence = 'moderate';
  } else {
    level = (h2Analysis?.strengthLevel === 'Strong' || h11Analysis?.strengthLevel === 'Strong') ? 'supportive' : 'mixed';
    confidence = 'moderate';
  }

  // Evidence construction
  const evidence: LocalizedText[] = [];

  // Evidence 1: 2nd & 11th lord dynamics
  if (hasDhanaSambandha) {
    evidence.push({
      en: `Direct link between 2nd lord (${pName(h2Lord).en}) and 11th lord (${pName(h11Lord).en}), forming a classical mutual wealth connection.`,
      mr: `द्वितीयेश (${pName(h2Lord).mr}) आणि एकादशेश (${pName(h11Lord).mr}) यांच्यात परस्पर संबंध असल्याने उत्तम धनयोगाची निर्मिती होते.`,
    });
  } else {
    evidence.push({
      en: `2nd house (accumulation) is governed by ${pName(h2Lord).en} in ${hName(h2LordHouse).en} (${dignityText(h2Dignity).en}).`,
      mr: `संचित धनाचा द्वितीय भाव ${pName(h2Lord).mr} च्या अधिपत्याखाली असून तो ${hName(h2LordHouse).mr} मध्ये ${dignityText(h2Dignity).mr} आहे.`,
    });
  }

  // Evidence 2: Income & Gains (11th house)
  evidence.push({
    en: `11th house of ongoing gains is lorded by ${pName(h11Lord).en} in ${hName(h11LordHouse).en} (${dignityText(h11Dignity).en}).`,
    mr: `नियमित लाभाचा ११वा भाव ${pName(h11Lord).mr} च्या अधिपत्याखाली असून तो ${hName(h11LordHouse).mr} मध्ये स्थित आहे.`,
  });

  // Evidence 3: Specific planetary influences (Jupiter, Rahu, Mars, occupants)
  if (h2Planets.length > 0) {
    const pListEn = h2Planets.map(p => pName(p).en).join(', ');
    const pListMr = h2Planets.map(p => pName(p).mr).join(', ');
    evidence.push({
      en: `2nd house hosts ${pListEn}, directly influencing your spending choices and asset-holding patterns.`,
      mr: `द्वितीय भावात ${pListMr} ग्रह असल्याने आर्थिक बचत व खर्चाच्या सवयींवर त्यांचा थेट प्रभाव पडतो.`,
    });
  } else if (jupiterStrong) {
    evidence.push({
      en: `Natural wealth karaka Jupiter is dignified in ${sName(chart.planets.Jupiter.sign).en}, providing broad financial resilience.`,
      mr: `नैसर्गिक धनकारक गुरु ${sName(chart.planets.Jupiter.sign).mr} राशीत उत्तम स्थितीत असल्याने आर्थिक संकटात आधार मिळतो.`,
    });
  } else if (dhanaYogas.length > 0) {
    const yogaName = dhanaYogas[0].name;
    evidence.push({
      en: `Presence of ${yogaName} strengthens financial returns from long-term productive assets.`,
      mr: `पत्रिकेत ${yogaName} सक्रिय असल्याने दीर्घकालीन संपत्ती उभारणीस विशेष अनुकूलता मिळते.`,
    });
  }

  // Headline deeply tailored to chart mechanics
  let headlineEn = '';
  let headlineMr = '';
  if (dhanaYogas.length > 0) {
    const yName = dhanaYogas[0].name;
    if (yName.includes('Lakshmi')) {
      headlineEn = `Prosperity Expansion Through Lakshmi Yoga & Auspicious Merit`;
      headlineMr = `लक्ष्मी योगाचा प्रभाव: भाग्योदय व दीर्घकालीन संपत्ती वृद्धी`;
    } else if (yName.includes('Vasumati')) {
      headlineEn = `Self-Generated Material Abundance Through Vasumati Yoga`;
      headlineMr = `वसुमती योगाचा प्रभाव: स्वकर्तृत्वातून निरंतर धनलाभ व संपन्नता`;
    } else if (yName.includes('Chandra-Mangala')) {
      headlineEn = `Enterprise Momentum & Commercial Resource Growth`;
      headlineMr = `चंद्र-मंगळ योग: व्यावसायिक उद्यमशीलता व जलद धनार्जन`;
    } else {
      headlineEn = `Elevated Capital Compounding via Fortified Dhana Combinations`;
      headlineMr = `विशेष धनयोग: नियोजित गुंतवणूक व दीर्घकालीन समृद्धी`;
    }
  } else if (hasDhanaSambandha) {
    headlineEn = `Harmonious Income-to-Asset Compounding via Mutual Dhana Links`;
    headlineMr = `उत्तम धनयोग: नियमित आवक व संपत्ती संचयाचा दुहेरी संगम`;
  } else if (h2LordHouse === 2 || h2Dignity === 'OwnSign' || h2Dignity === 'Moolatrikona' || h2Dignity === 'Exalted') {
    headlineEn = `Deep Asset Preservation, Tangible Security & Resource Endurance`;
    headlineMr = `मजबूत धनसंचय, स्थावर मालमत्ता व सुरक्षित आर्थिक पाया`;
  } else if (h11LordHouse === 11 || h11Dignity === 'OwnSign' || h11Dignity === 'Exalted' || h11Planets.length > 0) {
    headlineEn = `Expansive Inflow Streams & Enterprise Network-Driven Gains`;
    headlineMr = `विस्तारित उत्पन्न स्रोत, व्यावसायिक लाभ व आर्थिक वृद्धी`;
  } else if (rahuInWealth || marsIn2) {
    headlineEn = `Dynamic High-Velocity Cash Flows Requiring Deliberate Pacing`;
    headlineMr = `द्रुतगती रोख प्रवाह व खर्चावर सतर्क नियोजनाची आवश्यकता`;
  } else if (lordInDusthana) {
    headlineEn = `Capital Ring-Fencing & Safeguarding Against Sudden Outflows`;
    headlineMr = `आर्थिक गळती रोखणे, कायदेशीर स्पष्टता व सुरक्षित भांडवल`;
  } else {
    headlineEn = `Disciplined Accumulation & Prudent Long-Term Resource Growth`;
    headlineMr = `नियोजनबद्ध बचत, संयमी गुंतवणूक व संतुलित आर्थिक वाटचाल`;
  }

  // Interpretations
  const interpretations: LocalizedText[] = [];
  if (hasDhanaSambandha || dhanaYogas.length > 0) {
    interpretations.push({
      en: 'Income streams expand through building enterprise systems and compounding savings, rather than isolated speculative bets.',
      mr: 'सट्टेबाजीपेक्षा नियमित गुंतवणूक आणि कार्यक्षम व्यावसायिक यंत्रणेतून संपत्ती वेगाने वाढते.',
    });
  } else {
    interpretations.push({
      en: 'Financial stability compounds steadily when savings are automated and distinct from operational liquid cash.',
      mr: 'दैनिक खर्च आणि भविष्यातील बचत यांचे नियोजन स्वतंत्र ठेवल्यास आर्थिक चणचण भासत नाही.',
    });
  }

  // Cautions
  const cautions: LocalizedText[] = [];
  if (rahuInWealth) {
    cautions.push({
      en: 'Rahu in financial houses warns against high-risk speculation and emotional spending during high-confidence periods.',
      mr: 'धन किंवा लाभ भावात राहू असल्याने झटपट श्रीमंत होण्याच्या योजना व अतिजोखमीच्या व्यवहारांपासून सावध राहावे.',
    });
  } else if (marsIn2) {
    cautions.push({
      en: 'Mars in the 2nd house can trigger sudden, impulsive outlays; cultivate a mandatory 48-hour pause before major purchases.',
      mr: 'दुसऱ्या भावात मंगळ असल्याने अचानक मोठे खर्च होऊ शकतात; मोठा खरेदी निर्णय घेण्यापूर्वी थोडा वेळ विचार करा.',
    });
  } else if (lordInDusthana) {
    cautions.push({
      en: 'A wealth lord connected with the 6th/8th/12th houses emphasizes careful contract review and avoiding informal lending.',
      mr: 'धन स्वामी ६/८/१२ भावांशी संबंधित असल्याने मित्रांना विनाकागदपत्र उसनवारी देणे किंवा अनपेक्षित हमी घेणे टाळा.',
    });
  }

  return {
    category: 'wealth',
    icon: '💰',
    title: { en: 'Wealth & Resources', mr: 'धनसंपत्ती व आर्थिक स्थिती' },
    headline: { en: headlineEn, mr: headlineMr },
    level,
    confidence,
    evidence,
    interpretations,
    cautions,
    traceability: {
      planets: [h2Lord, h11Lord, ...h2Planets, ...h11Planets],
      houses: [2, 11, h2LordHouse, h11LordHouse],
      signs: [h2.sign, h11.sign],
      yogas: dhanaYogas.map(y => y.name),
    },
    targetTab: 'houses',
  };
}

// ─── 3. RELATIONSHIPS & PARTNERSHIPS EVALUATOR ───────────────────────────────

export function evaluateRelationships(chart: KundaliChart): OverviewInsight {
  const h7 = chart.houses[6]; // 7th house
  const h7Sign = h7.sign;
  const h7SignData = RASHIS[h7.signIndex];
  const h7Lord = h7.lord;
  const h7Planets = h7.planets.filter(p => p !== 'Ascendant');

  const lordAnalysis = chart.planetAnalysis[h7Lord];
  const lordPos = lordAnalysis?.position;
  const lordHouse = lordPos?.house || 7;
  const lordDignity = lordPos?.dignity || 'Neutral';
  const lordStrength = lordAnalysis?.strengthLevel || 'Moderate';

  const venusAnalysis = chart.planetAnalysis['Venus'];
  const venusHouse = venusAnalysis?.position?.house || 1;
  const venusDignity = venusAnalysis?.position?.dignity || 'Neutral';

  const aspectsOn7 = getAspectsOnHouse(chart, 7);
  const jupiterAspect = aspectsOn7.some(a => a.fromPlanet === 'Jupiter');
  const saturnAspect = aspectsOn7.some(a => a.fromPlanet === 'Saturn');
  const marsAspect = aspectsOn7.some(a => a.fromPlanet === 'Mars');

  // Check Manglik from doshas
  const manglik = chart.doshas.find(d => d.id === 'manglik' && d.isPresent && !d.isCancelled);

  // Check D9 Navamsha 7th lord & Venus
  let d9Detail: LocalizedText | null = null;
  try {
    const d9 = buildDivisionalChart(chart, 9);
    const d9Venus = d9.planets.Venus;
    if (d9Venus && ['Exalted', 'OwnSign'].includes(d9Venus.dignity)) {
      d9Detail = {
        en: `In Navamsha (D9), Venus is fortified in ${d9Venus.dignity}, indicating growing mutual understanding and emotional maturity over time.`,
        mr: `नवांश कुंडलीत (D9) शुक्र ${dignityText(d9Venus.dignity).mr} असल्याने वयानुसार नातेसंबंधात परिपक्वता व समजूतदारपणा वाढतो.`,
      };
    } else if (d9Venus && d9Venus.dignity === 'Debilitated') {
      d9Detail = {
        en: `In Navamsha (D9), Venus meets subtle tension, suggesting mutual expectations should be clarified clearly early on.`,
        mr: `नवांश कुंडलीत शुक्र काहीसा संवेदनशील असल्याने एकमेकांकडून असलेल्या अपेक्षा सुरुवातीलाच स्पष्ट ठेवणे हिताचे ठरते.`,
      };
    }
  } catch {
    // Graceful fallback
  }

  // Level & Confidence
  let level: 'supportive' | 'mixed' | 'mindful' = 'supportive';
  let confidence: 'strong' | 'moderate' | 'mixed' = 'moderate';

  if ((lordDignity === 'Exalted' || lordDignity === 'OwnSign' || jupiterAspect) && !manglik) {
    level = 'supportive';
    confidence = 'strong';
  } else if ((lordDignity === 'Debilitated' || lordHouse === 6 || lordHouse === 8 || lordHouse === 12) && !jupiterAspect) {
    level = 'mindful';
    confidence = 'moderate';
  } else if (saturnAspect || marsAspect || manglik) {
    level = 'mixed';
    confidence = 'moderate';
  } else {
    level = lordStrength === 'Strong' ? 'supportive' : 'mixed';
    confidence = 'moderate';
  }

  // Evidence
  const evidence: LocalizedText[] = [];

  // Evidence 1: 7th sign temperament
  const signRelDescriptorEn =
    h7SignData.element === 'Fire' ? 'passionate, direct, and dynamic interactions'
    : h7SignData.element === 'Earth' ? 'stability, practical commitment, and mutual dependability'
    : h7SignData.element === 'Air' ? 'intellectual bonding, open dialogue, and shared social interests'
    : 'deep emotional sensitivity, protective warmth, and intuitive connection';

  const signRelDescriptorMr =
    h7SignData.element === 'Fire' ? 'उत्साही, स्पष्टवक्ता आणि स्पष्ट अपेक्षा ठेवणारा'
    : h7SignData.element === 'Earth' ? 'विश्वासू, व्यावहारिक आणि दीर्घकालीन स्थैर्य जपणारा'
    : h7SignData.element === 'Air' ? 'बौद्धिक सुसंवाद, मोकळी चर्चा आणि मैत्रीपूर्ण'
    : 'सखोल भावनिक ओढ, काळजीवाहू वृत्ती आणि संवेदनशील';

  evidence.push({
    en: `7th house of partnerships falls in ${sName(h7Sign).en} (${h7SignData.element} sign), valuing ${signRelDescriptorEn}.`,
    mr: `भागीदारी व विवाहाचा ७वा भाव ${sName(h7Sign).mr} राशीत असून जोडीदाराकडून ${signRelDescriptorMr} स्वभाव अपेक्षित असतो.`,
  });

  // Evidence 2: 7th lord position
  evidence.push({
    en: `7th lord ${pName(h7Lord).en} is seated in ${hName(lordHouse).en} (${dignityText(lordDignity).en}).`,
    mr: `सप्तमेश ${pName(h7Lord).mr} हा ${hName(lordHouse).mr} मध्ये ${dignityText(lordDignity).mr} स्थित आहे.`,
  });

  // Evidence 3: Planetary aspects/occupants
  if (h7Planets.length > 0) {
    const pListEn = h7Planets.map(p => pName(p).en).join(', ');
    const pListMr = h7Planets.map(p => pName(p).mr).join(', ');
    evidence.push({
      en: `Direct occupancy of ${pListEn} in the 7th house shapes the primary atmosphere of close relationships.`,
      mr: `सप्तम भावात प्रत्यक्ष ${pListMr} ग्रह असल्याने वैवाहिक वातावरणावर त्यांचा ठळक प्रभाव पडतो.`,
    });
  } else if (jupiterAspect) {
    evidence.push({
      en: `Jupiter casts an auspicious aspect on the 7th house, buffering friction with constructive empathy and respect.`,
      mr: `गुरूची शुभ दृष्टी सप्तम भावावर असल्याने मतभेद मिटवण्यास आणि परस्पर आदर राखण्यास दैवी मदत मिळते.`,
    });
  } else if (saturnAspect) {
    evidence.push({
      en: `Saturn influences the 7th house, calling for emotional maturity, loyalty, and patience over rushed expectations.`,
      mr: `शनीची दृष्टी सप्तम भावावर असल्याने नातेसंबंधात घाईगडबड न करता संयम आणि निष्ठेने बंध दृढ होतात.`,
    });
  } else if (d9Detail) {
    evidence.push(d9Detail);
  }

  // Headline deeply tailored to chart mechanics
  let headlineEn = '';
  let headlineMr = '';
  if (jupiterAspect || h7Planets.includes('Jupiter')) {
    headlineEn = `Constructive Harmony, Mutual Elevation & Philosophical Respect`;
    headlineMr = `परस्पर आदर, समंजस संवाद व मार्गदर्शक नातेसंबंध`;
  } else if (manglik || h7Planets.includes('Mars')) {
    headlineEn = `Dynamic Assertiveness Requiring Intentional Emotional Tempering`;
    headlineMr = `उत्साही व स्वाभिमानी स्वभाव; आवेगावर संयम राखण्याची गरज`;
  } else if (saturnAspect || h7Planets.includes('Saturn')) {
    headlineEn = `Enduring Commitment, Grounded Loyalty & Maturing Partnerships`;
    headlineMr = `दीर्घकालीन निष्ठा, संयमी समजूतदारपणा व परिपक्व वैवाहिक बंध`;
  } else if (lordHouse === 5 || lordHouse === 9) {
    headlineEn = `Intellectual Warmth, Shared Creativity & Heartfelt Understanding`;
    headlineMr = `बौद्धिक सुसंवाद, सर्जनशीलता व परस्पर जिव्हाळा`;
  } else if (lordHouse === 6 || lordHouse === 8 || lordHouse === 12) {
    headlineEn = `Conscious Empathy & Problem-Solving Partnership Over Idealization`;
    headlineMr = `समस्या निवारण, संयम व व्यावहारिक समजुतीतून नाते दृढ करणे`;
  } else if (h7SignData.element === 'Air' || lordHouse === 3 || lordHouse === 7) {
    headlineEn = `Intellectual Resonance, Open Dialogue & Collaborative Partnership`;
    headlineMr = `बौद्धिक सुसंवाद, मैत्रीपूर्ण संवाद व समान विचारसरणी`;
  } else if (h7SignData.element === 'Earth' || lordHouse === 2 || lordHouse === 4) {
    headlineEn = `Practical Dependability, Shared Foundations & Steady Loyalty`;
    headlineMr = `व्यावहारिक स्थैर्य, विश्वासार्हता व सुरक्षित कौटुंबिक पाया`;
  } else if (h7SignData.element === 'Water') {
    headlineEn = `Empathetic Connection, Deep Emotional Resonance & Devoted Care`;
    headlineMr = `भावनिक ओढ, संवेदनशील काळजी व सखोल जिव्हाळा`;
  } else {
    headlineEn = `Values-Aligned Partnership Built on Clarity & Clear Boundaries`;
    headlineMr = `समान मूल्ये, मोकळा संवाद व परस्पर आदरावर आधारित सहजीवन`;
  }

  // Interpretations
  const interpretations: LocalizedText[] = [];
  interpretations.push({
    en: 'True relationship satisfaction here develops through clear shared agreements rather than unspoken assumptions.',
    mr: 'नातेसंबंधात गृहीत धरण्यापेक्षा मोकळेपणाने संवाद ठेवून घेतलेले संयुक्त निर्णय अधिक सुखदायक ठरतात.',
  });

  if (lordHouse === 1 || lordHouse === 7) {
    interpretations.push({
      en: 'Your partner serves as an essential sounding board, significantly influencing your personal perspective and life decisions.',
      mr: 'जोडीदार तुमच्या जीवनात महत्त्वाचा मार्गदर्शक ठरून तुमच्या व्यक्तिगत निर्णयांवर मोलाचा प्रभाव टाकतो.',
    });
  }

  // Cautions
  const cautions: LocalizedText[] = [];
  if (manglik) {
    cautions.push({
      en: 'Active Mars influence in relational houses advises cooling down reactive temper before engaging in key discussions.',
      mr: 'मंगळाचा प्रभाव असल्याने रागाच्या किंवा आवेगाच्या भरात त्वरित प्रतिक्रिया देणे टाळावे.',
    });
  } else if (saturnAspect) {
    cautions.push({
      en: 'Saturnian aspect suggests not misinterpreting quiet periods as detachment; steady dedication outlasts fleeting excitement.',
      mr: 'शनीच्या प्रभावामुळे कधीकधी संवादात संथपणा जाणवू शकतो; याला दुरावा न समजता संयम बाळगणे आवश्यक आहे.',
    });
  }

  return {
    category: 'relationships',
    icon: '💖',
    title: { en: 'Relationships & Partnerships', mr: 'नातेसंबंध व वैवाहिक जीवन' },
    headline: { en: headlineEn, mr: headlineMr },
    level,
    confidence,
    evidence,
    interpretations,
    cautions,
    traceability: {
      planets: [h7Lord, ...h7Planets, 'Venus'],
      houses: [7, lordHouse, venusHouse],
      signs: [h7Sign],
      aspects: aspectsOn7.map(a => `${pName(a.fromPlanet).en} on 7th`),
    },
    targetTab: 'effects',
  };
}

// ─── 4. KEY GROWTH FOCUS EVALUATOR ───────────────────────────────────────────

export function evaluateGrowthFocus(chart: KundaliChart): OverviewInsight {
  // Rank candidate developmental areas based on actual chart stress points
  interface CandidateChallenge {
    theme: 'emotional_equanimity' | 'impulse_control' | 'patience_discipline' | 'communication_focus' | 'confidence_purpose' | 'financial_discernment' | 'boundary_setting';
    score: number;
    leadPlanet: Planet;
    houses: number[];
    evidenceEn: string;
    evidenceMr: string;
    headlineEn: string;
    headlineMr: string;
    practiceEn: string;
    practiceMr: string;
    cautionEn: string;
    cautionMr: string;
  }

  const candidates: CandidateChallenge[] = [];

  // Check Moon (Mind / Emotional Equanimity)
  const moon = chart.planetAnalysis['Moon'];
  const moonHouse = moon?.position?.house || 1;
  const moonSaturnAspect = chart.aspects.some(a => a.fromPlanet === 'Saturn' && a.toPlanet === 'Moon');
  const moonRahuConj = chart.houses.some(h => h.planets.includes('Moon') && h.planets.includes('Rahu'));

  if (moon?.isDebilitated || [6, 8, 12].includes(moonHouse) || moonSaturnAspect || moonRahuConj) {
    let score = 50;
    if (moon?.isDebilitated) score += 30;
    if (moonHouse === 8) score += 25;
    if (moonSaturnAspect || moonRahuConj) score += 20;

    candidates.push({
      theme: 'emotional_equanimity',
      score,
      leadPlanet: 'Moon',
      houses: [moonHouse],
      evidenceEn: `Moon (${pName('Moon').en}) placed in ${hName(moonHouse).en} (${dignityText(moon.position.dignity).en})${moonSaturnAspect ? ' under Saturn aspect' : ''}${moonRahuConj ? ' alongside Rahu' : ''}.`,
      evidenceMr: `चंद्र हा ${hName(moonHouse).mr} मध्ये ${dignityText(moon.position.dignity).mr} असून${moonSaturnAspect ? ' त्यावर शनीची दृष्टी आहे' : ''}${moonRahuConj ? ' राहूची युती आहे' : ''}.`,
      headlineEn: 'Cultivating Emotional Resilience & Mental Equanimity',
      headlineMr: 'भावनिक स्थैर्य व मानसिक शांतता संवर्धन',
      practiceEn: 'Establish a steady evening wind-down routine, meditation, and conscious breathing to soothe cognitive over-stimulation.',
      practiceMr: 'दररोज रात्री शांत झोपेचे नियोजन, ध्यानधारणा आणि प्राणायामाचा सराव केल्याने मन शांत राहण्यास मदत होते.',
      cautionEn: 'Avoid making definitive life judgments during late-night hours or periods of acute fatigue.',
      cautionMr: 'अतिथकवा किंवा रात्रीच्या वेळी भावनिक भरात मोठे निर्णय घेणे टाळा.',
    });
  }

  // Check Mars (Temper / Impulsiveness)
  const mars = chart.planetAnalysis['Mars'];
  const marsHouse = mars?.position?.house || 1;
  const marsInAction = [1, 7, 8].includes(marsHouse) || mars?.isDebilitated;

  if (marsInAction) {
    let score = 40;
    if (marsHouse === 1) score += 30;
    if (marsHouse === 8) score += 25;
    if (mars?.isDebilitated) score += 20;

    candidates.push({
      theme: 'impulse_control',
      score,
      leadPlanet: 'Mars',
      houses: [marsHouse],
      evidenceEn: `Mars is placed in ${hName(marsHouse).en} in ${sName(mars.position.sign).en}, providing high drive that requires intentional channelization.`,
      evidenceMr: `मंगळ ${hName(marsHouse).mr} मध्ये ${sName(mars.position.sign).mr} राशीत स्थित असल्याने आक्रमक ऊर्जेला सकारात्मक वळण देणे आवश्यक आहे.`,
      headlineEn: 'Channeling Fiery Impulse Into Constructive Focus',
      headlineMr: 'आक्रमक ऊर्जा व आवेगाचे सकारात्मक उपयोजन',
      practiceEn: 'Channel excess adrenaline through vigorous physical discipline, strategic athletic outlets, and measured speech.',
      practiceMr: 'शारीरिक व्यायाम, खेळ आणि संयमी भाषेचा अवलंब करून ऊर्जा विधायक कामांत गुंतवा.',
      cautionEn: 'Beware of mistaking urgency for importance; pause before escalating disagreements.',
      cautionMr: 'तातडी आणि खरे महत्त्व यातील फरक ओळखून वादाच्या वेळी त्वरित भडकणे टाळा.',
    });
  }

  // Check Saturn (Patience & Structured Responsibility)
  const saturn = chart.planetAnalysis['Saturn'];
  const saturnHouse = saturn?.position?.house || 1;
  const saturnLagnaInfluence = saturnHouse === 1 || chart.aspects.some(a => a.fromPlanet === 'Saturn' && a.toHouse === 1);

  if (saturnLagnaInfluence || saturn?.isDebilitated) {
    let score = 45;
    if (saturnHouse === 1) score += 25;
    if (saturn?.isDebilitated) score += 25;

    candidates.push({
      theme: 'patience_discipline',
      score,
      leadPlanet: 'Saturn',
      houses: [saturnHouse, 1],
      evidenceEn: `Saturn influences your 1st house / Lagna, asking you to embrace deep patience and structured routines over instant gratification.`,
      evidenceMr: `शनीचा प्रभाव लग्न भावावर असल्याने तत्काळ यशाची अपेक्षा न करता दीर्घकालीन शिस्तीवर भर देणे आवश्यक आहे.`,
      headlineEn: 'Building Mastery Through Long-Horizon Discipline',
      headlineMr: 'दीर्घकालीन शिस्त व सातत्यातून आत्मविकास',
      practiceEn: 'Break ambitious goals into non-negotiable daily micro-habits and celebrate steady incremental progress.',
      practiceMr: 'मोठ्या उद्दिष्टांची विभागणी दैनंदिन छोट्या सवयींमध्ये करून सातत्यपूर्ण प्रयत्नांवर विश्वास ठेवा.',
      cautionEn: 'Do not allow temporary setbacks to foster self-criticism or cynicism.',
      cautionMr: 'तात्पुरत्या अडचणी आल्यास स्वतःबद्दल नकारात्मक विचार करणे किंवा नैराश्य बाळगणे टाळा.',
    });
  }

  // Check Mercury (Communication & Clarity)
  const mercury = chart.planetAnalysis['Mercury'];
  const mercuryHouse = mercury?.position?.house || 1;
  if (mercury?.isCombust || mercury?.isDebilitated || mercury?.isRetrograde) {
    let score = 35;
    if (mercury?.isCombust) score += 25;
    if (mercury?.isDebilitated) score += 20;

    candidates.push({
      theme: 'communication_focus',
      score,
      leadPlanet: 'Mercury',
      houses: [mercuryHouse],
      evidenceEn: `Mercury (${pName('Mercury').en}) is ${mercury.isCombust ? 'combust the Sun' : ''}${mercury.isRetrograde ? ' retrograde' : ''} in ${hName(mercuryHouse).en}.`,
      evidenceMr: `बुध हा ${mercury.isCombust ? 'सूर्याच्या सान्निध्यात अस्त' : ''}${mercury.isRetrograde ? ' वक्री' : ''} असून ${hName(mercuryHouse).mr} मध्ये स्थित आहे.`,
      headlineEn: 'Sharpening Clarity & Eliminating Analysis-Paralysis',
      headlineMr: 'विचारांची स्पष्टता व संवादातील सुस्पष्टता',
      practiceEn: 'Put agreements and strategies in writing; double-check message tone before sending critical correspondence.',
      practiceMr: 'महत्त्वाचे निर्णय व करार लिखित स्वरूपात ठेवा आणि महत्त्वाचे निरोप पाठवण्यापूर्वी पुन्हा तपासा.',
      cautionEn: 'Avoid over-complicating straightforward situations with excessive scenario-modeling.',
      cautionMr: 'सोप्या गोष्टींवर अतिविचार करून संभ्रम निर्माण करणे टाळा.',
    });
  }

  // Check Rahu / Ketu Evolutionary Karmic Axis
  const rahu = chart.planetAnalysis['Rahu'];
  const rahuHouse = rahu?.position?.house || 1;

  if (rahuHouse === 2) {
    candidates.push({
      theme: 'boundary_setting',
      score: 43,
      leadPlanet: 'Rahu',
      houses: [2, 8],
      evidenceEn: `Rahu in the 2nd house (with Ketu in the 8th) highlights speech, resource management, and family values as primary evolutionary themes.`,
      evidenceMr: `द्वितीय भावात राहू (व अष्टमात केतू) असल्याने संवाद, संपत्ती व्यवस्थापन आणि कौटुंबिक मूल्यांचे भान हा मुख्य विकास पैलू ठरतो.`,
      headlineEn: 'Cultivating Mindful Speech & Authentic Financial Values',
      headlineMr: 'संयमी संवाद, पारदर्शक व्यवहार व मूल्याधिष्ठित संपत्ती व्यवस्थापन',
      practiceEn: 'Cultivate mindful speech, transparent financial habits, and genuine self-worth rooted in inner ethics rather than external validation.',
      practiceMr: 'गोड व संयमी संवाद, पारदर्शक आर्थिक सवयी आणि बाह्य प्रतिष्ठेपेक्षा आंतरिक मूल्यांना प्राधान्य द्या.',
      cautionEn: 'Avoid exaggerating claims or succumbing to status-driven financial comparison.',
      cautionMr: 'दिखाऊपणासाठी अवाजवी खर्च किंवा संवादात अतिशयोक्ती करणे टाळा.',
    });
  } else if (rahuHouse === 8) {
    candidates.push({
      theme: 'boundary_setting',
      score: 44,
      leadPlanet: 'Rahu',
      houses: [8, 2],
      evidenceEn: `Rahu in the 8th house prompts deep psychological resilience, urging you to navigate unexpected shifts without anxiety.`,
      evidenceMr: `अष्टम भावात राहू असल्याने अनपेक्षित बदलांना घाबरून न जाता मानसिक स्थितप्रज्ञता व सखोल आत्मपरीक्षण करणे आवश्यक ठरते.`,
      headlineEn: 'Developing Inner Resilience & Embracing Life Shifts',
      headlineMr: 'मानसिक स्थितप्रज्ञता व अनपेक्षित बदलांना सामोरे जाण्याचे सामर्थ्य',
      practiceEn: 'Embrace psychological adaptability; view unforeseen life transitions as evolutionary upgrades rather than disruptions.',
      practiceMr: 'अनपेक्षित बदलांना घाबरून न जाता आत्मपरीक्षण आणि मानसिक कणखरतेतून नवीन संधी शोधा.',
      cautionEn: 'Guard against unnecessary secrecy, catastrophic thinking, or distrusting close allies during stress.',
      cautionMr: 'तणावाच्या वेळी अतिसंशयी वृत्ती किंवा विनाकारण गुप्तता बाळगणे टाळा.',
    });
  } else if (rahuHouse === 1) {
    candidates.push({
      theme: 'boundary_setting',
      score: 44,
      leadPlanet: 'Rahu',
      houses: [1, 7],
      evidenceEn: `Rahu in the 1st house urges developing authentic self-identity and self-reliance rather than seeking external validation.`,
      evidenceMr: `प्रथम भावात राहू असल्याने इतरांच्या मान्यतेवर अवलंबून न राहता स्वतःचा आत्मविश्वास आणि ओळख निर्माण करणे महत्त्वाचे आहे.`,
      headlineEn: 'Cultivating Authentic Self-Identity & Personal Agency',
      headlineMr: 'स्वतंत्र ओळख, आत्मविश्वास व स्वतःचे अस्तित्व निर्माण करणे',
      practiceEn: 'Trust your authentic instincts and develop independent confidence rather than relying entirely on others for validation.',
      practiceMr: 'दुसऱ्यांच्या मान्यतेवर अवलंबून न राहता स्वतःच्या आंतरिक क्षमतेवर आणि निर्णयांवर विश्वास ठेवा.',
      cautionEn: 'Avoid neglecting cooperative empathy while asserting your individuality.',
      cautionMr: 'स्वतःचे मत मांडताना इतरांच्या भावनांचा अनादर होणार नाही याची काळजी घ्या.',
    });
  } else if (rahuHouse === 6) {
    candidates.push({
      theme: 'patience_discipline',
      score: 42,
      leadPlanet: 'Rahu',
      houses: [6, 12],
      evidenceEn: `Rahu in the 6th house channels energy into mastering practical problem-solving, health routines, and overcoming obstacles.`,
      evidenceMr: `षष्ठ भावात राहू असल्याने दैनंदिन शिस्त, आरोग्याची काळजी आणि स्पर्धात्मक आव्हानांवर मात करणे हा महत्त्वाचा पैलू आहे.`,
      headlineEn: 'Disciplined Problem-Solving & Daily Health Stewardship',
      headlineMr: 'दैनंदिन आरोग्य, शिस्त व समस्या निवारण कौशल्य',
      practiceEn: 'Maintain systematic daily habits, nutritional discipline, and proactive conflict resolution.',
      practiceMr: 'नियमित दिनचर्या, आरोग्याची काळजी आणि आव्हानांना धैर्याने सामोरे जाण्याची तयारी ठेवा.',
      cautionEn: 'Guard against over-exhaustion through relentless work or micromanagement.',
      cautionMr: 'अति कामामुळे येणारा मानसिक थकवा आणि छोट्या गोष्टींचे अतिनियंत्रण टाळा.',
    });
  } else if (rahuHouse === 10) {
    candidates.push({
      theme: 'confidence_purpose',
      score: 43,
      leadPlanet: 'Rahu',
      houses: [10, 4],
      evidenceEn: `Rahu in the 10th house calls for courageous leadership and taking visible executive responsibility in your chosen field.`,
      evidenceMr: `दशम भावात राहू असल्याने सुरक्षित कोषातून बाहेर पडून कामाच्या ठिकाणी धाडसी पुढाकार व नेतृत्व स्वीकारणे आवश्यक ठरते.`,
      headlineEn: 'Stepping Confidently Into Public Executive Responsibility',
      headlineMr: 'सार्वजनिक जबाबदारी व व्यावसायिक कर्तृत्वाचा स्वीकार',
      practiceEn: 'Step out of comfort zones and courageously claim leadership opportunities in your field.',
      practiceMr: 'घरगुती किंवा सुरक्षित कोषातून बाहेर पडून कामाच्या ठिकाणी धाडसी पुढाकार घ्या.',
      cautionEn: 'Balance ambitious career drives with restorative emotional self-care.',
      cautionMr: 'कामाच्या व्यापात कौटुंबिक शांतता आणि मानसिक विश्रांतीकडे दुर्लक्ष करू नका.',
    });
  }

  // Fallback / General Strength Focus
  if (candidates.length === 0) {
    const lagnaLord = chart.lagnaLord;
    const lagnaLordAnalysis = chart.planetAnalysis[lagnaLord];
    const llHouse = lagnaLordAnalysis?.position?.house || 1;

    let fbHeadlineEn = 'Aligning Daily Action With Core Personal Purpose';
    let fbHeadlineMr = 'दैनंदिन प्रयत्नांना आत्मविश्वासाची व ध्येयाची दिशा देणे';

    if (llHouse === 1) {
      fbHeadlineEn = 'Establishing Anchored Self-Reliance & Purposeful Initiative';
      fbHeadlineMr = 'स्वावलंबी आत्मविश्वास व स्वतंत्र उद्दिष्टांची पूर्तता';
    } else if (llHouse === 10) {
      fbHeadlineEn = 'Harmonizing Professional Impact With Core Ethical Values';
      fbHeadlineMr = 'व्यावसायिक प्रभाव व नैतिक मूल्यांचा समतोल';
    } else if (llHouse === 5 || llHouse === 9) {
      fbHeadlineEn = 'Higher Wisdom Integration & Principled Life Trajectory';
      fbHeadlineMr = 'सखोल विवेक, नैतिक मार्ग व ध्येयनिष्ठ वाटचाल';
    } else if (llHouse === 4) {
      fbHeadlineEn = 'Cultivating Inner Sanctuary, Peace & Rooted Belonging';
      fbHeadlineMr = 'मानसिक शांतता, कौटुंबिक स्वास्थ्य व अंतर्गत समाधान';
    }

    candidates.push({
      theme: 'confidence_purpose',
      score: 30,
      leadPlanet: lagnaLord,
      houses: [1, llHouse],
      evidenceEn: `Your Lagna Lord ${pName(lagnaLord).en} is placed in ${hName(llHouse).en}, acting as the central anchor of your vitality.`,
      evidenceMr: `तुमचा लग्नेश ${pName(lagnaLord).mr} हा ${hName(llHouse).mr} मध्ये स्थित असून तो व्यक्तिमत्त्वाचा मुख्य आधार आहे.`,
      headlineEn: fbHeadlineEn,
      headlineMr: fbHeadlineMr,
      practiceEn: 'Prioritize physical vitality and align weekly priorities with your intrinsic core values.',
      practiceMr: 'शारीरिक आरोग्याला प्राधान्य देऊन आठवड्याचे नियोजन स्वतःच्या मुख्य मूल्यांनुसार करा.',
      cautionEn: 'Avoid letting external opinions dilute your inner compass.',
      cautionMr: 'इतरांच्या मतांमुळे स्वतःच्या मूळ उद्दिष्टांपासून भरकटणे टाळा.',
    });
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);
  const topCandidate = candidates[0];

  return {
    category: 'growth',
    icon: '🛡️',
    title: { en: 'Key Growth Focus', mr: 'दक्षता व विकासाचा मुख्य पैलू' },
    headline: { en: topCandidate.headlineEn, mr: topCandidate.headlineMr },
    level: 'mindful',
    confidence: topCandidate.score >= 60 ? 'strong' : 'moderate',
    evidence: [
      { en: topCandidate.evidenceEn, mr: topCandidate.evidenceMr },
      {
        en: `This placement highlights a core karmic growth curve where deliberate awareness transforms a potential hurdle into personal strength.`,
        mr: `या ग्रहस्थितीमुळे दिसून येणारे आव्हान हे योग्य सजगतेने हाताळल्यास तेच तुमच्या जीवनातील सर्वात मोठे बलस्थान ठरते.`,
      },
    ],
    interpretations: [
      { en: topCandidate.practiceEn, mr: topCandidate.practiceMr },
    ],
    cautions: [
      { en: topCandidate.cautionEn, mr: topCandidate.cautionMr },
    ],
    traceability: {
      planets: [topCandidate.leadPlanet],
      houses: topCandidate.houses,
      signs: [chart.planets[topCandidate.leadPlanet]?.sign || chart.lagnaSign],
    },
    targetTab: 'effects',
  };
}

// ─── MASTER ENGINE EXPORT WITH DUPLICATION CHECK ─────────────────────────────

export function generateOverviewInsights(chart: KundaliChart): OverviewInsight[] {
  const career = evaluateCareer(chart);
  const wealth = evaluateWealth(chart);
  const relationships = evaluateRelationships(chart);
  const growth = evaluateGrowthFocus(chart);

  const list = [career, wealth, relationships, growth];

  // Duplication guard: ensure no two headlines are identical
  const seenHeadlines = new Set<string>();
  for (const item of list) {
    if (seenHeadlines.has(item.headline.en)) {
      item.headline.en = `${item.headline.en} (${item.title.en})`;
      item.headline.mr = `${item.headline.mr} (${item.title.mr})`;
    }
    seenHeadlines.add(item.headline.en);
  }

  return list;
}
