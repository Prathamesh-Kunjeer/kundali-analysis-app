export type PlanetName = 
  | 'Sun' 
  | 'Moon' 
  | 'Mars' 
  | 'Mercury' 
  | 'Jupiter' 
  | 'Venus' 
  | 'Saturn' 
  | 'Rahu' 
  | 'Ketu' 
  | 'Ascendant';

export type RashiName = 
  | 'Aries' 
  | 'Taurus' 
  | 'Gemini' 
  | 'Cancer' 
  | 'Leo' 
  | 'Virgo' 
  | 'Libra' 
  | 'Scorpio' 
  | 'Sagittarius' 
  | 'Capricorn' 
  | 'Aquarius' 
  | 'Pisces';

export type DignityType = 
  | 'Exalted' 
  | 'Moolatrikona' 
  | 'Own Sign' 
  | 'Great Friend' 
  | 'Friend' 
  | 'Neutral' 
  | 'Enemy' 
  | 'Great Enemy' 
  | 'Debilitated';

export type GanaType = 'Deva' | 'Manushya' | 'Rakshasa';
export type NadiType = 'Aadi' | 'Madhya' | 'Antya';
export type YoniAnimal = 
  | 'Horse' | 'Elephant' | 'Sheep' | 'Serpent' | 'Dog' | 'Cat' 
  | 'Rat' | 'Cow' | 'Buffalo' | 'Tiger' | 'Hare' | 'Monkey' 
  | 'Mongoose' | 'Lion';

export type VarnaType = 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
export type VashyaType = 'Chatushpada' | 'Manava' | 'Jalachara' | 'Vanachara' | 'Keeta';

export interface NakshatraInfo {
  index: number;
  name: string;
  sanskritName: string;
  lord: PlanetName;
  deity: string;
  symbol: string;
  gana: GanaType;
  yoni: YoniAnimal;
  nadi: NadiType;
  varna: VarnaType;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
}

export interface PlanetaryPosition {
  name: PlanetName;
  sanskritName: string;
  longitude: number; // 0 to 360 degrees sidereal
  speed: number;
  isRetrograde: boolean;
  house: number; // 1 to 12
  rashi: RashiName;
  rashiNumber: number; // 1 (Aries) to 12 (Pisces)
  rashiLord: PlanetName;
  degreeInRashi: number; // 0 to 30
  formattedDegree: string; // e.g. 14° 23' 45"
  nakshatra: string;
  nakshatraNumber: number; // 1 to 27
  nakshatraLord: PlanetName;
  pada: number; // 1 to 4
  dignity: DignityType;
  isCombust: boolean;
  avastha: string; // 'Baladi' avastha: Infant, Youth, Mature, Old, Dead
  navamshaRashi: RashiName;
  navamshaRashiNumber: number;
}

export interface HouseInfo {
  houseNumber: number; // 1 to 12
  rashi: RashiName;
  rashiNumber: number; // 1 to 12
  rashiLord: PlanetName;
  cuspLongitude: number;
  formattedDegree: string;
  planets: PlanetaryPosition[];
  sanskritName: string;
  significance: string;
}

export type DivisionalChartType = 
  | 'D1'  // Rashi / Lagna
  | 'D2'  // Hora (Wealth)
  | 'D3'  // Drekkana (Courage/Siblings)
  | 'D7'  // Saptamsha (Children)
  | 'D9'  // Navamsha (Dharma, Marriage, Soul)
  | 'D10' // Dashamsha (Career, Status)
  | 'D12' // Dwadashamsha (Parents, Lineage)
  | 'Chandra' // Moon Chart
  | 'Surya';  // Sun Chart

export interface DivisionalChart {
  type: DivisionalChartType;
  title: string;
  sanskritTitle: string;
  purpose: string;
  ascendantRashiNumber: number;
  houses: {
    houseNumber: number;
    rashiNumber: number;
    rashi: RashiName;
    planets: {
      name: PlanetName;
      sanskritName: string;
      isRetrograde: boolean;
      isCombust?: boolean;
    }[];
  }[];
}

export interface DashaPeriod {
  planet: PlanetName;
  sanskritName: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  isCurrent: boolean;
  subPeriods?: DashaPeriod[]; // Antardashas
  subSubPeriods?: DashaPeriod[]; // Pratyantardashas
}

export interface VimshottariDashaResult {
  birthBalance: {
    nakshatraLord: PlanetName;
    balanceYears: number;
    balanceMonths: number;
    balanceDays: number;
  };
  mahadashas: DashaPeriod[];
  currentMahadasha: DashaPeriod | null;
  currentAntardasha: DashaPeriod | null;
  currentPratyantardasha: DashaPeriod | null;
}

export interface YogaInfo {
  id: string;
  name: string;
  sanskritName: string;
  category: 'Raja Yoga' | 'Dhana Yoga' | 'Mahapurusha Yoga' | 'Auspicious Yoga' | 'Inauspicious Yoga';
  planetsInvolved: PlanetName[];
  housesInvolved: number[];
  description: string;
  effects: string;
  strength: 'Exceptional' | 'Strong' | 'Moderate' | 'Mild';
  isAuspicious: boolean;
}

export interface ManglikAnalysis {
  isManglik: boolean;
  percentage: number;
  level: 'High' | 'Partial' | 'None';
  marsHouseFromLagna: number;
  marsHouseFromMoon: number;
  marsHouseFromVenus: number;
  cancellations: string[];
  isCancelled: boolean;
  description: string;
  remedies: string[];
}

export interface KaalSarpAnalysis {
  hasKaalSarp: boolean;
  type: string | null;
  direction: 'Ascending (Savya)' | 'Descending (Apasavya)' | null;
  rahuHouse: number;
  ketuHouse: number;
  description: string;
  remedies: string[];
}

export interface SadeSatiAnalysis {
  isInSadeSati: boolean;
  phase: 'Rising (1st Phase)' | 'Peak (2nd Phase)' | 'Setting (3rd Phase)' | 'Dhaiya (Small Phase)' | 'None';
  saturnCurrentRashi: RashiName;
  moonRashi: RashiName;
  startDate?: string;
  endDate?: string;
  effects: string;
  remedies: string[];
}

export interface AshtakavargaChart {
  planet: PlanetName;
  points: number[]; // 12 houses points (0 to 8)
}

export interface AshtakavargaResult {
  bav: AshtakavargaChart[]; // 7 main planets
  sav: number[]; // Sarvashtakavarga 12 house total points
  totalSavPoints: number; // Typically 337
}

export interface GunaScore {
  name: string;
  sanskritName: string;
  maxPoints: number;
  obtainedPoints: number;
  boyAttribute: string;
  girlAttribute: string;
  description: string;
  status: 'Excellent' | 'Good' | 'Average' | 'Dosha' | 'Poor';
}

export interface KundaliMilanResult {
  totalScore: number;
  maxScore: number; // 36
  percentage: number;
  gunas: GunaScore[];
  nadiDosha: boolean;
  nadiDoshaCancelled: boolean;
  bhakootDosha: boolean;
  bhakootDoshaCancelled: boolean;
  boyManglik: ManglikAnalysis;
  girlManglik: ManglikAnalysis;
  compatibilityVerdict: 'Highly Auspicious' | 'Auspicious' | 'Average' | 'Inauspicious';
  recommendation: string;
}

export interface GemstoneRecommendation {
  type: 'Life Stone' | 'Lucky Stone' | 'Fortune Stone';
  name: string;
  hindiName: string;
  planet: PlanetName;
  rashi: RashiName;
  metal: string;
  finger: string;
  auspiciousDay: string;
  mantra: string;
  benefits: string;
  cautions: string;
  colorHex: string;
}

export interface RemedyItem {
  category: 'Gemstone' | 'Rudraksha' | 'Mantra' | 'Charity' | 'Yantra' | 'Lifestyle';
  title: string;
  targetPlanet: PlanetName;
  instructions: string;
  benefits: string;
}

export interface PanchangInfo {
  tithi: { name: string; paksha: 'Shukla' | 'Krishna'; number: number };
  nakshatra: { name: string; number: number; lord: PlanetName; pada: number };
  yoga: { name: string; number: number; isAuspicious: boolean };
  karana: { name: string; number: number };
  vaar: { name: string; lord: PlanetName };
  sunSign: RashiName;
  moonSign: RashiName;
  ayanamsha: string;
  rahuKaal: string;
  gulikaKaal: string;
  yamaganda: string;
  abhijitMuhurat: string;
  sunrise: string;
  sunset: string;
}

export interface BirthDetails {
  id?: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM (24h)
  latitude: number;
  longitude: number;
  timezone: number; // e.g. +5.5 for IST
  cityName: string;
  country: string;
}

export interface FullKundaliAnalysis {
  birthDetails: BirthDetails;
  calculationDate: string;
  ayanamsa: number; // Lahiri in degrees
  formattedAyanamsa: string;
  ascendant: PlanetaryPosition;
  planets: PlanetaryPosition[];
  houses: HouseInfo[];
  divisionalCharts: Record<DivisionalChartType, DivisionalChart>;
  dasha: VimshottariDashaResult;
  yogas: YogaInfo[];
  manglik: ManglikAnalysis;
  kaalSarp: KaalSarpAnalysis;
  sadeSati: SadeSatiAnalysis;
  ashtakavarga: AshtakavargaResult;
  gemstones: GemstoneRecommendation[];
  remedies: RemedyItem[];
  panchang: PanchangInfo;
  luckyFactors: {
    luckyNumbers: number[];
    luckyColors: string[];
    luckyDays: string[];
    luckyDirections: string[];
    luckyGemstones: string[];
    friendlySigns: RashiName[];
    favorablePlanets: PlanetName[];
  };
  personalityProfile: {
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
}
