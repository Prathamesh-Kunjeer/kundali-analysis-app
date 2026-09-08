// ============================================================
//  PLANET ANALYSIS ENGINE — Per-planet structured analysis
//  Layer 2 (pure astrological rules, no UI)
// ============================================================

import type {
  Planet, BodyPlanet, PlanetPosition, PlanetAnalysis, PlanetInterpretation,
  FunctionalNature, StrengthLevel, ChartContext, AspectRelation
} from './models';
import { DIGNITY_SCORE } from './dignities';
import { aspectsGivenBy, aspectsReceivedBy } from './aspects';
import { RASHIS } from './constants';

// ─── Functional Nature from Lagna ────────────────────────────────────────────

/**
 * Returns Yogakaraka planets for each Lagna.
 * A Yogakaraka is a planet that owns both a Kendra and a Trikona house
 * (or is considered the most powerful benefic for that Lagna).
 */
const YOGAKARAKAS: Partial<Record<string, BodyPlanet[]>> = {
  Aries:       ['Sun'],       // Sun owns 5th (Trikona) — closest to Yogakaraka
  Taurus:      ['Saturn'],    // 9th + 10th lord
  Gemini:      ['Venus'],     // 5th + 12th — partial; traditional: no full Yogakaraka
  Cancer:      ['Mars'],      // 4th + 5th = Kendra + Trikona
  Leo:         ['Mars'],      // Mars rules 4th (Kendra) + 9th (Trikona)
  Virgo:       ['Venus'],     // 2nd + 9th
  Libra:       ['Saturn'],    // 4th + 5th lord
  Scorpio:     ['Moon'],      // 9th lord — partial benefic
  Sagittarius: ['Sun'],       // 5th lord (Trikona) + 9th
  Capricorn:   ['Venus', 'Mercury'], // Venus: 5th+10th, Mercury: 6th+9th (partial)
  Aquarius:    ['Venus'],     // Venus owns 4th and 9th
  Pisces:      ['Moon', 'Mars'], // Moon 5th, Mars 2nd+9th
};

const MALEFIC_LORDS: Partial<Record<string, BodyPlanet[]>> = {
  Aries:       ['Mercury', 'Saturn'],
  Taurus:      ['Venus', 'Moon'],  // 6th lord Venus (own lagna lord can be tricky)
  Gemini:      ['Mars', 'Jupiter'],
  Cancer:      ['Saturn', 'Mercury'],
  Leo:         ['Mercury', 'Venus', 'Saturn'],
  Virgo:       ['Mars', 'Jupiter', 'Moon'],
  Libra:       ['Mars', 'Jupiter', 'Sun'],
  Scorpio:     ['Mercury', 'Venus'],
  Sagittarius: ['Venus', 'Saturn'],
  Capricorn:   ['Mars', 'Jupiter', 'Moon'],
  Aquarius:    ['Moon', 'Mars', 'Jupiter'],
  Pisces:      ['Venus', 'Saturn'],
};

export function getFunctionalNature(planet: Planet, lagnaSign: string): FunctionalNature {
  if (planet === 'Ascendant') return 'Neutral';
  const p = planet as BodyPlanet;
  const yogakarakas = YOGAKARAKAS[lagnaSign] || [];
  const malefics = MALEFIC_LORDS[lagnaSign] || [];

  if (yogakarakas.includes(p)) return 'Yogakaraka';
  if (malefics.includes(p)) return 'Malefic';

  // Natural benefics: Jupiter, Venus, Mercury (when not associated with malefics), Moon
  const NATURAL_BENEFICS: BodyPlanet[] = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
  if (NATURAL_BENEFICS.includes(p)) return 'Benefic';

  return 'Neutral';
}

/** Returns which houses a planet lords (by sign) for a given Lagna */
export function getHouseOwnership(planet: Planet, lagnaSignIndex: number): number[] {
  if (planet === 'Ascendant') return [];
  const owned: number[] = [];
  for (const rashi of RASHIS) {
    if (rashi.lord === planet) {
      const houseNumber = ((rashi.index - lagnaSignIndex + 12) % 12) + 1;
      owned.push(houseNumber);
    }
  }
  return owned.sort((a, b) => a - b);
}

// ─── Strength Score ───────────────────────────────────────────────────────────

/**
 * Composite strength score 0-100 based on:
 * - Dignity (0-50 points)
 * - House placement (0-30 points)
 * - Aspect support (0-20 points — benefic aspects add, malefic aspects subtract)
 */
export function computeStrengthScore(
  position: PlanetPosition,
  aspects: AspectRelation[]
): number {
  let score = 0;

  // Dignity score (0-50 points scaled from DIGNITY_SCORE 0-100)
  score += DIGNITY_SCORE[position.dignity] * 0.5;

  // House placement score (0-30 points)
  const HOUSE_SCORES: Record<number, number> = {
    1: 25, 4: 20, 7: 20, 10: 30,  // Kendras
    5: 25, 9: 25,                  // Trikonas (not 1st which is already scored)
    2: 15, 11: 15,                 // Upachaya wealth houses
    3: 10,                         // Upachaya
    6: 5, 8: 5, 12: 5,            // Dusthanas
  };
  score += HOUSE_SCORES[position.house] || 10;

  // Retrograde: mixed — adds complexity, slight boost to strength
  if (position.isRetrograde) score += 5;

  // Combust: penalty
  if (position.isCombust) score -= 20;

  // Aspect support from benefics
  const beneficAspects = aspects.filter(a =>
    a.toHouse === position.house &&
    ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(a.fromPlanet)
  );
  const maleficAspects = aspects.filter(a =>
    a.toHouse === position.house &&
    ['Saturn', 'Mars', 'Sun', 'Rahu', 'Ketu'].includes(a.fromPlanet)
  );
  score += beneficAspects.length * 5;
  score -= maleficAspects.length * 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function strengthLevel(score: number): StrengthLevel {
  if (score >= 60) return 'Strong';
  if (score >= 35) return 'Moderate';
  return 'Weak';
}

// ─── Affliction Check ─────────────────────────────────────────────────────────

export function isAfflicted(planet: Planet, house: number, aspects: AspectRelation[]): boolean {
  const MALEFICS: Planet[] = ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'];
  const BENEFICS: Planet[] = ['Jupiter', 'Venus', 'Mercury', 'Moon'];

  const maleficAspects = aspects.filter(a => a.toHouse === house && MALEFICS.includes(a.fromPlanet));
  const beneficAspects = aspects.filter(a => a.toHouse === house && BENEFICS.includes(a.fromPlanet));

  return maleficAspects.length > 0 && beneficAspects.length === 0;
}

// ─── Rule-Based Interpretation ────────────────────────────────────────────────

function generateInterpretation(
  planet: Planet,
  position: PlanetPosition,
  houseOwnership: number[],
  functionalNature: FunctionalNature,
  strengthLevel: StrengthLevel
): PlanetInterpretation {
  const sign = position.sign;
  const house = position.house;
  const dignity = position.dignity;
  const quality = strengthLevel === 'Strong' ? 'powerfully' : strengthLevel === 'Moderate' ? 'moderately' : 'weakly';

  const dignityNote = dignity === 'Exalted'
    ? `, exalted — at peak power`
    : dignity === 'Debilitated'
    ? `, debilitated — expressing with difficulty`
    : dignity === 'OwnSign' ? `, in own sign — comfortable and expressive`
    : '';

  const baseNote = `${planet} is ${quality} placed in house ${house} (${sign}${dignityNote}). `;

  const interpretations: Record<Planet, PlanetInterpretation> = {
    Sun: {
      career: baseNote + (house === 10 ? 'Exceptional leadership; government, administration, politics.' : `Career influenced by ${sign} energy in house ${house}; authority, recognition, executive roles.`),
      wealth: `Sun's ${dignity} placement in ${sign} ${house === 2 || house === 11 ? 'supports' : 'indirectly influences'} wealth through career authority.`,
      relationships: `Father figure is ${dignity === 'Exalted' ? 'powerful and supportive' : dignity === 'Debilitated' ? 'complex or challenging' : 'present but demanding'}. Ego can affect partnerships.`,
      health: `Heart, spine, eyes. ${dignity === 'Debilitated' ? 'Prone to vitality fluctuations; vitamin D focus.' : 'Generally robust constitution when Sun is strong.'}`,
      personality: `Strong ${sign} solar identity. ${dignity === 'Exalted' ? 'Natural leader, high self-esteem.' : 'Developing confidence and self-expression.'}`,
      education: `Interest in subjects related to power, governance, or ${sign} themes. Authority figures in education are significant.`,
      spirituality: `Drawn to solar deities, Surya worship, and disciplines involving fire or light. Mantra: ${PLANET_LABELS_BASIC.Sun.mantra}.`,
    },
    Moon: {
      career: baseNote + (house === 4 ? 'Strong home-based career, real estate, hospitality.' : `Career influenced by public interaction, nurturing, and emotional intelligence.`),
      wealth: `Moon's placement in ${sign} house ${house} ${['2','4','5','11'].includes(String(house)) ? 'supports' : 'fluctuates'} wealth through ${dignity === 'Exalted' ? 'excellent' : 'variable'} emotional management.`,
      relationships: `Deeply emotional in relationships. ${dignity === 'Exalted' ? 'Nurturing, devoted partner and mother.' : 'May have fluctuating emotional needs; seeks security in partnerships.'}`,
      health: `Lungs, breasts, fluids, lymphatic system. ${dignity === 'Debilitated' ? 'Emotional stress can manifest as physical ailments; mental health attention needed.' : 'Health tied to emotional wellbeing.'}`,
      personality: `Emotionally intelligent, intuitive, adaptable. ${dignity === 'Exalted' ? 'High emotional resilience; beloved by public.' : 'Mood sensitivity; rich inner world.'}`,
      education: `Retentive memory. Learning through emotional engagement. Drawn to history, literature, psychology.`,
      spirituality: `Shiva and Shakti worship, water rituals, moon fasting on Mondays. ${dignity === 'Debilitated' ? 'Deep spiritual seeking as remedy for inner restlessness.' : 'Natural affinity for devotional practices.'}`,
    },
    Mars: {
      career: baseNote + `Engineering, military, surgery, police, athletics, real estate, and any field requiring courage and initiative. ${dignity === 'Exalted' ? 'Outstanding executive and leadership capacity.' : ''}`,
      wealth: `Mars rules the ability to work hard for wealth. ${dignity === 'Exalted' ? 'Exceptional earning capacity through action and enterprise.' : 'Wealth through assertive effort; avoid impulsive financial decisions.'}`,
      relationships: `${dignity === 'Debilitated' ? 'Aggression or dominance can create conflict in partnerships; conscious effort at cooperation needed.' : 'Passionate, protective partner; may be demanding but deeply loyal.'}`,
      health: `Blood, muscles, adrenal glands, male reproductive system. ${position.isRetrograde ? 'Retrograde Mars: internal aggression, accidents less likely but internal inflammation watch.' : 'Active physical lifestyle strongly recommended.'}`,
      personality: `Courageous, decisive, goal-oriented. ${dignity === 'Exalted' ? 'Natural warrior spirit, high energy.' : 'Channel aggression constructively through sports or physical activity.'}`,
      education: `Technical, mathematical, competitive. Excels in STEM, sports management, military studies.`,
      spirituality: `Kartikeya (Murugan) worship. Hanuman Chalisa. Physical discipline as spiritual practice.`,
    },
    Mercury: {
      career: baseNote + `Communication, writing, commerce, accounting, technology, analysis, medicine (diagnostics), law, and education.`,
      wealth: `${dignity === 'Exalted' ? 'Multiple income streams through intelligence; commercial acumen is exceptional.' : 'Wealth through mental skills, trade, and communication. Avoid scattered investments.'}`,
      relationships: `Intellectual compatibility is essential. ${position.isCombust ? 'Mercury combust: communication clarity with partners may need effort.' : 'Witty, adaptable partner who values conversation and mental stimulation.'}`,
      health: `Nervous system, lungs, intestines, skin. ${dignity === 'Debilitated' ? 'Anxiety, overthinking; pranayama and grounding practices essential.' : 'Generally healthy when mind is engaged.'}`,
      personality: `Analytical, versatile, communicative. ${dignity === 'Exalted' ? 'Exceptional analytical and communication gifts.' : 'Tendency to overthink; benefit from focused mental discipline.'}`,
      education: `Mathematics, languages, science, business. Excellent memory and rapid learning ability.`,
      spirituality: `Vishnu worship, Budha puja on Wednesdays. Journaling, study of sacred texts.`,
    },
    Jupiter: {
      career: baseNote + `Law, judiciary, education, philosophy, finance, management consulting, medicine, religious institutions, administration.`,
      wealth: `${dignity === 'Exalted' ? 'Natural abundance; Jupiter in Cancer is the greatest wealth indicator.' : 'Wealth through wisdom, teaching, and righteous means. Long-term prosperity.'}`,
      relationships: `${dignity === 'Exalted' ? 'Blessed marriage; wise, spiritual, and fortunate spouse.' : 'Seeks philosophical alignment in partnerships. May idealize relationships.'}`,
      health: `Liver, hips, thighs, fat deposits. ${position.isRetrograde ? 'Retrograde Jupiter: internalized wisdom; liver and metabolism attention.' : 'Generally good constitution; monitor weight.'}`,
      personality: `Generous, optimistic, philosophical, and wisdom-seeking. ${dignity === 'Exalted' ? 'Universal magnanimity and spiritual authority.' : 'May overestimate or be overly idealistic.'}`,
      education: `Higher education, philosophy, law, and spiritual studies. Natural teacher and mentor.`,
      spirituality: `Brihaspati puja, Guru worship. Daily Vedic study or philosophical contemplation. Dakshina to learned Brahmins.`,
    },
    Venus: {
      career: baseNote + `Arts, music, fashion, beauty, hospitality, luxury goods, diplomacy, creative media, relationships counseling.`,
      wealth: `${dignity === 'Exalted' ? 'Exceptional wealth through beauty, art, and connection; financial abundance and luxury.' : 'Wealth through relationships, creative talent, and aesthetic sensibility.'}`,
      relationships: `${dignity === 'Exalted' ? 'Blissful marriage; charming, artistic, devoted spouse. Great marital happiness.' : 'Deeply values harmony, beauty, and pleasure in relationships. Sensual and loving.'}`,
      health: `Reproductive organs, kidneys, throat, skin. ${dignity === 'Debilitated' ? 'Monitor kidney health; sugar metabolism attention; avoid overindulgence.' : 'Generally healthy; self-care and beauty routines support wellbeing.'}`,
      personality: `Charming, artistic, harmonious, pleasure-seeking. ${dignity === 'Exalted' ? 'Magnetic charisma; naturally beloved.' : 'Strong aesthetic sense; may avoid conflict.'}`,
      education: `Arts, design, music, literature, relationships psychology.`,
      spirituality: `Lakshmi worship, Shukra puja on Fridays. Devotion to beauty and harmony as spiritual path.`,
    },
    Saturn: {
      career: baseNote + `Administration, law, engineering, mining, agriculture, research, social services, politics, judiciary. Long-term success through sustained effort.`,
      wealth: `${dignity === 'Exalted' ? 'Exceptional organized wealth accumulated slowly but solidly; great financial legacy.' : 'Wealth through discipline, patience, and sustained effort. Avoid shortcuts.'}`,
      relationships: `${dignity === 'Exalted' ? 'Stable, dutiful partnership; partner may be older or highly responsible.' : 'Serious approach to relationships; values loyalty and duty over romance.'}`,
      health: `Bones, joints, teeth, skin, chronic conditions. ${position.isRetrograde ? 'Retrograde Saturn: karmic debts surface; orthopedic and nervous system attention.' : 'Monitor chronic conditions; structured lifestyle essential.'}`,
      personality: `Disciplined, patient, hardworking, responsible. ${dignity === 'Exalted' ? 'Natural authority; master of timing and strategy.' : 'Fears, limitations can be transcended through persistent work.'}`,
      education: `Structured, systematic learning. Excellence in disciplines requiring patience: engineering, law, science, history.`,
      spirituality: `Shani worship on Saturdays, Hanuman puja. Service to the poor and elderly. Karma yoga.`,
    },
    Rahu: {
      career: baseNote + `Technology, foreign connections, unconventional fields, research, media, politics, or any field related to house ${house} themes — pursued with obsession.`,
      wealth: `Rahu can bring sudden, unexpected wealth — especially in ${sign} themes. Also risk of wealth through unorthodox or foreign means.`,
      relationships: `Rahu in ${sign} can bring karmic, unusual, or cross-cultural relationships. Obsessive attachment patterns possible.`,
      health: `Foreign diseases, phobias, neurological conditions. ${house === 6 || house === 8 ? 'House placement heightens health concerns; regular checkups essential.' : 'Monitor addictive tendencies.'}`,
      personality: `Worldly ambition, materialism, boundary-crossing. Rahu represents desires from past lives manifesting as irresistible drives in this life.`,
      education: `Fascination with taboo subjects, technology, occult, foreign cultures. Non-conventional learning paths.`,
      spirituality: `Rahu offers spiritual evolution through facing illusions. Kali, Durga worship. Meditation on impermanence.`,
    },
    Ketu: {
      career: baseNote + `Research, investigation, spirituality, healing, mysticism, occult sciences, or past-life-related skills. Ketu represents mastery brought from previous incarnations.`,
      wealth: `Ketu generally indicates detachment from wealth. ${house === 2 || house === 11 ? 'Placement here can disrupt wealth accumulation; savings discipline needed.' : 'Material indifference; wealth arrives when not sought directly.'}`,
      relationships: `Ketu indicates past-life connections in relationships in house ${house}. Detachment can be experienced as emotional unavailability.`,
      health: `Hidden ailments, neurological conditions, immune issues. ${house === 6 || house === 8 ? 'Heightened health sensitivity; investigate root causes thoroughly.' : 'Psychosomatic conditions possible.'}`,
      personality: `Spiritual, detached, intuitive, wisdom from past lives. May feel alien to worldly concerns of ${sign}.`,
      education: `Mastery in occult sciences, spiritual philosophy, research, and investigation. Unique perspective that transcends conventional learning.`,
      spirituality: `Ketu represents moksha path. Ganesha worship, spiritual retreat, past-life regression work, mantra japa. Ketu puja.`,
    },
    Ascendant: {
      career: 'The Ascendant defines physical constitution and life approach but does not directly govern career.',
      wealth: 'The Ascendant defines the lens through which all areas of life including wealth are expressed.',
      relationships: 'The Ascendant sign shapes relationship style and first impressions in all interactions.',
      health: `The Ascendant sign governs the body type and constitutional tendencies (${sign}).`,
      personality: `The Ascendant (Lagna) represents the core self-expression and personality blueprint — ${sign} rising.`,
      education: 'Ascendant influences learning style and intellectual approach.',
      spirituality: 'Ascendant sign indicates the spiritual path best suited to the native.',
    },
  };

  return interpretations[planet] || {
    career: baseNote + 'Career implications depend on house and sign context.',
    wealth: 'Wealth implications require broader chart analysis.',
    relationships: 'Relationship themes associated with this planet.',
    health: 'Health areas associated with this planet.',
    personality: 'Personality dimensions expressed through this placement.',
    education: 'Educational tendencies associated with this planet.',
    spirituality: 'Spiritual practices associated with this planet.',
  };
}

// Basic mantra lookup for interpretation text
const PLANET_LABELS_BASIC: Record<Planet, { mantra: string }> = {
  Sun:       { mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah' },
  Moon:      { mantra: 'Om Shraam Shreem Shraum Sah Chandraya Namah' },
  Mars:      { mantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah' },
  Mercury:   { mantra: 'Om Braam Breem Braum Sah Budhaya Namah' },
  Jupiter:   { mantra: 'Om Graam Greem Graum Sah Guruve Namah' },
  Venus:     { mantra: 'Om Draam Dreem Draum Sah Shukraya Namah' },
  Saturn:    { mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namah' },
  Rahu:      { mantra: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah' },
  Ketu:      { mantra: 'Om Sraam Sreem Sraum Sah Ketave Namah' },
  Ascendant: { mantra: '' },
};

// ─── Vargottama Check ─────────────────────────────────────────────────────────

/** A planet is Vargottama when it occupies the same sign in D1 and D9 */
export function isVargottama(d1SignIndex: number, d9SignIndex: number): boolean {
  return d1SignIndex === d9SignIndex;
}

// ─── Main Analysis Builder ────────────────────────────────────────────────────

export function buildPlanetAnalysis(
  planet: Planet,
  position: PlanetPosition,
  ctx: ChartContext,
  lagnaSignIndex: number,
  lagnaSign: string
): PlanetAnalysis {
  const aspectsGiven = aspectsGivenBy(planet, ctx.aspects);
  const aspectsReceived = aspectsReceivedBy(planet, ctx.aspects);

  const score = computeStrengthScore(position, ctx.aspects);
  const level = strengthLevel(score);
  const funcNature = getFunctionalNature(planet, lagnaSign);
  const ownership = getHouseOwnership(planet, lagnaSignIndex);
  const afflicted = isAfflicted(planet, position.house, ctx.aspects);

  const interpretation = generateInterpretation(planet, position, ownership, funcNature, level);

  return {
    planet,
    position,
    isExalted:          position.dignity === 'Exalted',
    isDebilitated:      position.dignity === 'Debilitated',
    isInOwnSign:        position.dignity === 'OwnSign' || position.dignity === 'Moolatrikona',
    isInFriendlySign:   position.dignity === 'Friend' || position.dignity === 'GreatFriend',
    isInEnemySign:      position.dignity === 'Enemy' || position.dignity === 'GreatEnemy',
    isRetrograde:       position.isRetrograde,
    isCombust:          position.isCombust,
    isAfflicted:        afflicted,
    isVargottama:       false, // Will be updated by calculator with D9 data
    strengthScore:      score,
    strengthLevel:      level,
    functionalNature:   funcNature,
    houseOwnership:     ownership,
    aspectsGiven,
    aspectsReceived,
    interpretation,
  };
}
