// ============================================================
//  KUNDALI ANALYSIS STUDIO — CENTRALIZED DATA MODELS
//  Layer 2: Astrological Rules (no UI imports allowed here)
// ============================================================

// ─── Primitive Enums / Unions ────────────────────────────────────────────────

export type Planet =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter'
  | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu' | 'Ascendant';

export type BodyPlanet = Exclude<Planet, 'Ascendant'>; // planets only, no Asc

export type Sign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type Dignity =
  | 'Exalted'         // Uchha
  | 'Moolatrikona'
  | 'OwnSign'         // Swakshetra
  | 'GreatFriend'
  | 'Friend'
  | 'Neutral'
  | 'Enemy'
  | 'GreatEnemy'
  | 'Debilitated';    // Neecha

export type Avastha =
  | 'Bala'      // Infant — 0-6° in sign
  | 'Kumara'    // Youth — 6-12°
  | 'Yuva'      // Mature — 12-18°
  | 'Vriddha'   // Old — 18-24°
  | 'Mrita';    // Dead — 24-30°

export type GanaType = 'Deva' | 'Manushya' | 'Rakshasa';
export type NadiType = 'Aadi' | 'Madhya' | 'Antya';
export type VarnaType = 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
export type YoniAnimal =
  | 'Horse' | 'Elephant' | 'Sheep' | 'Serpent' | 'Dog' | 'Cat'
  | 'Rat' | 'Cow' | 'Buffalo' | 'Tiger' | 'Hare' | 'Monkey'
  | 'Mongoose' | 'Lion';

export type AspectStrength = 'Full' | 'ThreeQuarter' | 'Half' | 'Quarter';

export type YogaCategory =
  | 'Mahapurusha'
  | 'RajaYoga'
  | 'DhanaYoga'
  | 'AuspiciousYoga'
  | 'InauspiciousYoga'
  | 'VipareetsRajaYoga';

export type YogaStrength = 'Exceptional' | 'Strong' | 'Moderate' | 'Mild';

export type FunctionalNature = 'Benefic' | 'Malefic' | 'Neutral' | 'Yogakaraka';

export type StrengthLevel = 'Strong' | 'Moderate' | 'Weak';

// ─── Nakshatra ───────────────────────────────────────────────────────────────

export interface Nakshatra {
  index: number;          // 1–27
  name: string;
  sanskritName: string;
  lord: BodyPlanet;
  deity: string;
  symbol: string;
  gana: GanaType;
  yoni: YoniAnimal;
  nadi: NadiType;
  varna: VarnaType;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  startDegree: number;    // absolute sidereal degree (0–360)
  endDegree: number;
}

export interface NakshatraPosition {
  nakshatra: Nakshatra;
  pada: number;           // 1–4
  degreeInNakshatra: number;
}

// ─── Planet Position ─────────────────────────────────────────────────────────

export interface PlanetPosition {
  planet: Planet;
  longitude: number;        // sidereal 0–360°
  degreeInSign: number;     // 0–30°
  sign: Sign;
  signIndex: number;        // 0–11
  house: number;            // 1–12
  nakshatra: Nakshatra;
  nakshatraPosition: NakshatraPosition;
  speed: number;            // degrees/day
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: Dignity;
  avastha: Avastha;
  // formatted strings for display
  dmsString: string;        // e.g. "14° 23' 45\""
}

// ─── House ───────────────────────────────────────────────────────────────────

export interface House {
  number: number;           // 1–12
  sign: Sign;
  signIndex: number;        // 0–11
  lord: Planet;
  cuspLongitude: number;    // sidereal degree of cusp
  planets: Planet[];        // planets occupying this house
  // metadata
  sanskritName: string;
  significance: string;
  isKendra: boolean;        // 1,4,7,10
  isTrikona: boolean;       // 1,5,9
  isDusthana: boolean;      // 6,8,12
  isUpachaya: boolean;      // 3,6,10,11
}

// ─── Aspect / Drishti ────────────────────────────────────────────────────────

export interface AspectRelation {
  fromPlanet: Planet;
  fromHouse: number;
  toHouse: number;
  toPlanet?: Planet;        // if a planet occupies the aspected house
  houseOffset: number;      // 1–12 counted from fromHouse
  strength: AspectStrength;
  rule: string;             // human-readable rule description
}

// ─── Yoga ────────────────────────────────────────────────────────────────────

export interface YogaResult {
  id: string;
  name: string;
  sanskritName: string;
  category: YogaCategory;
  description: string;          // what condition was found
  planetsInvolved: Planet[];
  housesInvolved: number[];
  signsInvolved: Sign[];
  strength: YogaStrength;
  positiveEffects: string;
  cautionaryEffects: string;
  ruleReference: string;        // classical text / shastra reference
}

// YogaRule: the definition object, evaluate() produces result or null
export interface YogaRule {
  id: string;
  name: string;
  category: YogaCategory;
  ruleReference: string;
  evaluate(ctx: ChartContext): YogaResult | null;
}

// ─── Dosha ───────────────────────────────────────────────────────────────────

export interface DoshaResult {
  id: string;
  name: string;
  isPresent: boolean;
  severity: 'High' | 'Medium' | 'Low' | 'Cancelled';
  description: string;
  planetsInvolved: Planet[];
  housesInvolved: number[];
  cancellations: string[];      // which cancellation rules applied
  isCancelled: boolean;
  effects: string;
  remedies: string[];
}

export interface DoshaRule {
  id: string;
  name: string;
  evaluate(ctx: ChartContext): DoshaResult;
}

// ─── Dasha ───────────────────────────────────────────────────────────────────

export interface DashaPeriod {
  planet: Planet;
  planetLabel: string;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  isCurrent: boolean;
  antardasha: DashaPeriod[];     // Bhukti / Antardasha
  pratyantardasha?: DashaPeriod[]; // for current AD only
}

export interface DashaBalance {
  nakshatraLord: Planet;
  balanceYears: number;
  balanceMonths: number;
  balanceDays: number;
  totalBalanceDays: number;
}

export interface DashaChart {
  system: 'Vimshottari'; // extensible: can add Yogini, Kalachakra etc.
  birthBalance: DashaBalance;
  mahadashas: DashaPeriod[];
  currentMahadasha: DashaPeriod | null;
  currentAntardasha: DashaPeriod | null;
  currentPratyantardasha: DashaPeriod | null;
}

// ─── Planet Analysis ─────────────────────────────────────────────────────────

export interface PlanetInterpretation {
  career: string;
  wealth: string;
  relationships: string;
  health: string;
  personality: string;
  education: string;
  spirituality: string;
}

export interface PlanetAnalysis {
  planet: Planet;
  position: PlanetPosition;
  // condition flags
  isExalted: boolean;
  isDebilitated: boolean;
  isInOwnSign: boolean;
  isInFriendlySign: boolean;
  isInEnemySign: boolean;
  isRetrograde: boolean;
  isCombust: boolean;
  isAfflicted: boolean;           // malefic aspects with no benefic relief
  isVargottama: boolean;          // same sign in D1 and D9
  // strength
  strengthScore: number;          // 0–100
  strengthLevel: StrengthLevel;
  // functional role (from Lagna)
  functionalNature: FunctionalNature;
  houseOwnership: number[];        // houses this planet lords
  // aspects
  aspectsGiven: AspectRelation[];
  aspectsReceived: AspectRelation[];
  // interpretation
  interpretation: PlanetInterpretation;
}

// ─── Panchang ────────────────────────────────────────────────────────────────

export interface Panchang {
  tithi: { name: string; paksha: 'Shukla' | 'Krishna'; number: number };
  nakshatra: NakshatraPosition & { nakshatra: Nakshatra };
  yoga: { name: string; number: number; isAuspicious: boolean };
  karana: { name: string; number: number };
  vaar: { name: string; lord: Planet };
  ayanamsha: number;
  rahuKaal: string;
  abhijitMuhurat: string;
}



// --- Birth Data -----------------------------------------------------------

export interface BirthData {
  id?: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  dob: string;        // YYYY-MM-DD
  tob: string;        // HH:MM (24-hour)
  latitude: number;
  longitude: number;
  timezone: number;   // UTC offset e.g. 5.5 for IST
  tzName?: string;    // IANA timezone e.g. "Asia/Kolkata" (display only)
  cityName: string;
  state?: string;     // state/province - optional, old profiles may not have it
  country: string;
}

// --- Chart Context (passed to rule evaluators) ----------------------------
export interface ChartContext {
  birthData: BirthData;
  ayanamsha: number;
  ascendant: PlanetPosition;
  planets: Record<Planet, PlanetPosition>;
  houses: House[];
  aspects: AspectRelation[];
  // helpers
  getPlanet(p: Planet): PlanetPosition;
  getHouse(n: number): House;
  houseLord(n: number): Planet;
  planetHouse(p: Planet): number;
  // house-type helpers
  isKendra(house: number): boolean;
  isTrikona(house: number): boolean;
  isDusthana(house: number): boolean;
}

// ─── Aspect Configuration ─────────────────────────────────────────────────────

export interface SingleAspectDef {
  houseOffset: number;      // counted from planet's house (1 = own house, 7 = opposite)
  strength: AspectStrength;
}

export interface PlanetAspectConfig {
  planet: Planet | 'ALL'; // 'ALL' applies to every planet
  aspects: SingleAspectDef[];
}

export interface AspectConfig {
  rules: PlanetAspectConfig[];
  rahuKetuTreatment: 'FifthNinth' | 'Conjunction' | 'Custom';
}

// ─── Kundali Chart (final output consumed by UI) ──────────────────────────────

export interface KundaliChart {
  birthData: BirthData;
  calculatedAt: Date;
  ayanamsha: number;
  // Positions
  ascendant: PlanetPosition;
  planets: Record<Planet, PlanetPosition>;   // includes Ascendant
  houses: House[];                            // 1–12
  // Analysis
  aspects: AspectRelation[];
  planetAnalysis: Record<Planet, PlanetAnalysis>;
  yogas: YogaResult[];
  doshas: DoshaResult[];
  dasha: DashaChart;
  panchang: Panchang;
  // Convenience
  lagnaSign: Sign;
  lagnaLord: Planet;
  moonSign: Sign;
  sunSign: Sign;
  janmaNakshatra: Nakshatra;
  janmaNakshatraPada: number;
}
