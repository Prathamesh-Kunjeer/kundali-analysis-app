// ============================================================
//  CORE CONSTANTS — Rashis, Nakshatras, Planets reference data
//  Layer 2: Pure data, no UI imports
// ============================================================

import type {
  Sign, Planet, BodyPlanet, Nakshatra,
  GanaType, NadiType, VarnaType, YoniAnimal
} from './models';

// ─── Rashis (Zodiac Signs) ───────────────────────────────────────────────────

export interface RashiData {
  index: number;        // 0–11
  name: Sign;
  sanskritName: string;
  lord: Planet;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  gender: 'Masculine' | 'Feminine';
  direction: string;
  bodyPart: string;
}

export const RASHIS: RashiData[] = [
  { index: 0,  name: 'Aries',       sanskritName: 'Mesha',     lord: 'Mars',    element: 'Fire',  modality: 'Cardinal', gender: 'Masculine', direction: 'East',       bodyPart: 'Head' },
  { index: 1,  name: 'Taurus',      sanskritName: 'Vrishabha', lord: 'Venus',   element: 'Earth', modality: 'Fixed',    gender: 'Feminine',  direction: 'South',      bodyPart: 'Face/Neck' },
  { index: 2,  name: 'Gemini',      sanskritName: 'Mithuna',   lord: 'Mercury', element: 'Air',   modality: 'Mutable',  gender: 'Masculine', direction: 'West',       bodyPart: 'Shoulders/Arms' },
  { index: 3,  name: 'Cancer',      sanskritName: 'Karka',     lord: 'Moon',    element: 'Water', modality: 'Cardinal', gender: 'Feminine',  direction: 'North',      bodyPart: 'Chest/Heart' },
  { index: 4,  name: 'Leo',         sanskritName: 'Simha',     lord: 'Sun',     element: 'Fire',  modality: 'Fixed',    gender: 'Masculine', direction: 'East',       bodyPart: 'Stomach/Back' },
  { index: 5,  name: 'Virgo',       sanskritName: 'Kanya',     lord: 'Mercury', element: 'Earth', modality: 'Mutable',  gender: 'Feminine',  direction: 'South',      bodyPart: 'Waist/Hips' },
  { index: 6,  name: 'Libra',       sanskritName: 'Tula',      lord: 'Venus',   element: 'Air',   modality: 'Cardinal', gender: 'Masculine', direction: 'West',       bodyPart: 'Navel/Lower Back' },
  { index: 7,  name: 'Scorpio',     sanskritName: 'Vrishchika',lord: 'Mars',    element: 'Water', modality: 'Fixed',    gender: 'Feminine',  direction: 'North',      bodyPart: 'Genitals' },
  { index: 8,  name: 'Sagittarius', sanskritName: 'Dhanu',     lord: 'Jupiter', element: 'Fire',  modality: 'Mutable',  gender: 'Masculine', direction: 'East',       bodyPart: 'Thighs' },
  { index: 9,  name: 'Capricorn',   sanskritName: 'Makara',    lord: 'Saturn',  element: 'Earth', modality: 'Cardinal', gender: 'Feminine',  direction: 'South',      bodyPart: 'Knees' },
  { index: 10, name: 'Aquarius',    sanskritName: 'Kumbha',    lord: 'Saturn',  element: 'Air',   modality: 'Fixed',    gender: 'Masculine', direction: 'West',       bodyPart: 'Calves/Ankles' },
  { index: 11, name: 'Pisces',      sanskritName: 'Meena',     lord: 'Jupiter', element: 'Water', modality: 'Mutable',  gender: 'Feminine',  direction: 'North',      bodyPart: 'Feet' },
];

export const RASHI_BY_NAME: Record<Sign, RashiData> =
  Object.fromEntries(RASHIS.map(r => [r.name, r])) as Record<Sign, RashiData>;

// ─── Nakshatras ──────────────────────────────────────────────────────────────

export const NAKSHATRAS: Nakshatra[] = [
  { index:  1, name: 'Ashwini',      sanskritName: 'Ashvini',      lord: 'Ketu',    deity: 'Ashwini Kumaras',  symbol: 'Horse Head',       gana: 'Deva',     yoni: 'Horse',    nadi: 'Aadi',   varna: 'Vaishya',  element: 'Earth', startDegree:   0.0000, endDegree:  13.3333 },
  { index:  2, name: 'Bharani',      sanskritName: 'Bharani',      lord: 'Venus',   deity: 'Yama',             symbol: 'Yoni',             gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', varna: 'Shudra',   element: 'Earth', startDegree:  13.3333, endDegree:  26.6667 },
  { index:  3, name: 'Krittika',     sanskritName: 'Krittika',     lord: 'Sun',     deity: 'Agni',             symbol: 'Knife/Razor',      gana: 'Rakshasa', yoni: 'Sheep',    nadi: 'Antya',  varna: 'Brahmin',  element: 'Earth', startDegree:  26.6667, endDegree:  40.0000 },
  { index:  4, name: 'Rohini',       sanskritName: 'Rohini',       lord: 'Moon',    deity: 'Brahma',           symbol: 'Chariot',          gana: 'Manushya', yoni: 'Serpent',  nadi: 'Aadi',   varna: 'Shudra',   element: 'Earth', startDegree:  40.0000, endDegree:  53.3333 },
  { index:  5, name: 'Mrigashira',   sanskritName: 'Mrigashira',   lord: 'Mars',    deity: 'Soma (Moon)',      symbol: "Deer's Head",      gana: 'Deva',     yoni: 'Serpent',  nadi: 'Madhya', varna: 'Vaishya',  element: 'Earth', startDegree:  53.3333, endDegree:  66.6667 },
  { index:  6, name: 'Ardra',        sanskritName: 'Ardra',        lord: 'Rahu',    deity: 'Rudra',            symbol: 'Teardrop/Diamond', gana: 'Manushya', yoni: 'Dog',      nadi: 'Antya',  varna: 'Shudra',   element: 'Air',   startDegree:  66.6667, endDegree:  80.0000 },
  { index:  7, name: 'Punarvasu',    sanskritName: 'Punarvasu',    lord: 'Jupiter', deity: 'Aditi',            symbol: 'Quiver of Arrows', gana: 'Deva',     yoni: 'Cat',      nadi: 'Aadi',   varna: 'Vaishya',  element: 'Air',   startDegree:  80.0000, endDegree:  93.3333 },
  { index:  8, name: 'Pushya',       sanskritName: 'Pushya',       lord: 'Saturn',  deity: 'Brihaspati',       symbol: 'Flower/Circle',    gana: 'Deva',     yoni: 'Sheep',    nadi: 'Madhya', varna: 'Kshatriya',element: 'Water', startDegree:  93.3333, endDegree: 106.6667 },
  { index:  9, name: 'Ashlesha',     sanskritName: 'Ashlesha',     lord: 'Mercury', deity: 'Sarpa',            symbol: 'Serpent',          gana: 'Rakshasa', yoni: 'Cat',      nadi: 'Antya',  varna: 'Shudra',   element: 'Water', startDegree: 106.6667, endDegree: 120.0000 },
  { index: 10, name: 'Magha',        sanskritName: 'Magha',        lord: 'Ketu',    deity: 'Pitri (Ancestors)',symbol: 'Throne',           gana: 'Rakshasa', yoni: 'Rat',      nadi: 'Aadi',   varna: 'Shudra',   element: 'Fire',  startDegree: 120.0000, endDegree: 133.3333 },
  { index: 11, name: 'Purva Phalguni',sanskritName: 'Purva Phalguni',lord:'Venus',  deity: 'Bhaga',            symbol: 'Front of Bed',     gana: 'Manushya', yoni: 'Rat',      nadi: 'Madhya', varna: 'Brahmin',  element: 'Fire',  startDegree: 133.3333, endDegree: 146.6667 },
  { index: 12, name: 'Uttara Phalguni',sanskritName:'Uttara Phalguni',lord:'Sun',   deity: 'Aryaman',          symbol: 'Back of Bed',      gana: 'Manushya', yoni: 'Cow',      nadi: 'Antya',  varna: 'Kshatriya',element: 'Fire',  startDegree: 146.6667, endDegree: 160.0000 },
  { index: 13, name: 'Hasta',        sanskritName: 'Hasta',        lord: 'Moon',    deity: 'Savitar (Sun)',    symbol: 'Hand',             gana: 'Deva',     yoni: 'Buffalo',  nadi: 'Aadi',   varna: 'Vaishya',  element: 'Earth', startDegree: 160.0000, endDegree: 173.3333 },
  { index: 14, name: 'Chitra',       sanskritName: 'Chitra',       lord: 'Mars',    deity: 'Tvashtar/Vishwakarma',symbol:'Pearl/Bright Jewel',gana:'Rakshasa',yoni: 'Tiger',   nadi: 'Madhya', varna: 'Vaishya',  element: 'Fire',  startDegree: 173.3333, endDegree: 186.6667 },
  { index: 15, name: 'Swati',        sanskritName: 'Swati',        lord: 'Rahu',    deity: 'Vayu',             symbol: 'Coral/Sword',      gana: 'Deva',     yoni: 'Buffalo',  nadi: 'Antya',  varna: 'Shudra',   element: 'Air',   startDegree: 186.6667, endDegree: 200.0000 },
  { index: 16, name: 'Vishakha',     sanskritName: 'Vishakha',     lord: 'Jupiter', deity: 'Indra/Agni',       symbol: 'Triumphal Arch',   gana: 'Rakshasa', yoni: 'Tiger',    nadi: 'Aadi',   varna: 'Shudra',   element: 'Fire',  startDegree: 200.0000, endDegree: 213.3333 },
  { index: 17, name: 'Anuradha',     sanskritName: 'Anuradha',     lord: 'Saturn',  deity: 'Mitra',            symbol: 'Lotus Flower',     gana: 'Deva',     yoni: 'Hare',     nadi: 'Madhya', varna: 'Shudra',   element: 'Water', startDegree: 213.3333, endDegree: 226.6667 },
  { index: 18, name: 'Jyeshtha',     sanskritName: 'Jyeshtha',     lord: 'Mercury', deity: 'Indra',            symbol: 'Earring/Umbrella', gana: 'Rakshasa', yoni: 'Hare',     nadi: 'Antya',  varna: 'Vaishya',  element: 'Air',   startDegree: 226.6667, endDegree: 240.0000 },
  { index: 19, name: 'Mula',         sanskritName: 'Mula',         lord: 'Ketu',    deity: 'Nirriti',          symbol: 'Roots Tied Together',gana:'Rakshasa', yoni: 'Dog',     nadi: 'Aadi',   varna: 'Vaishya',  element: 'Fire',  startDegree: 240.0000, endDegree: 253.3333 },
  { index: 20, name: 'Purva Ashadha',sanskritName: 'Purva Ashadha',lord: 'Venus',   deity: 'Apas (Water)',     symbol: 'Elephant Tusk',    gana: 'Manushya', yoni: 'Monkey',   nadi: 'Madhya', varna: 'Brahmin',  element: 'Water', startDegree: 253.3333, endDegree: 266.6667 },
  { index: 21, name: 'Uttara Ashadha',sanskritName:'Uttara Ashadha',lord: 'Sun',    deity: 'Vishwedevas',      symbol: 'Elephant Tusk',    gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya',  varna: 'Kshatriya',element: 'Fire',  startDegree: 266.6667, endDegree: 280.0000 },
  { index: 22, name: 'Shravana',     sanskritName: 'Shravana',     lord: 'Moon',    deity: 'Vishnu',           symbol: 'Ear/Three Footprints',gana:'Deva',   yoni: 'Monkey',   nadi: 'Aadi',   varna: 'Vaishya',  element: 'Air',   startDegree: 280.0000, endDegree: 293.3333 },
  { index: 23, name: 'Dhanistha',    sanskritName: 'Dhanistha',    lord: 'Mars',    deity: 'Eight Vasus',      symbol: 'Drum/Flute',       gana: 'Rakshasa', yoni: 'Lion',     nadi: 'Madhya', varna: 'Vaishya',  element: 'Air',   startDegree: 293.3333, endDegree: 306.6667 },
  { index: 24, name: 'Shatabhisha',  sanskritName: 'Shatabhisha',  lord: 'Rahu',    deity: 'Varuna',           symbol: 'Empty Circle',     gana: 'Rakshasa', yoni: 'Horse',    nadi: 'Antya',  varna: 'Shudra',   element: 'Air',   startDegree: 306.6667, endDegree: 320.0000 },
  { index: 25, name: 'Purva Bhadrapada',sanskritName:'Purva Bhadrapada',lord:'Jupiter',deity:'Aja Ekapada',   symbol: 'Swords/Front of Funeral Cot',gana:'Manushya',yoni:'Lion',nadi:'Aadi',varna:'Brahmin',  element: 'Air',   startDegree: 320.0000, endDegree: 333.3333 },
  { index: 26, name: 'Uttara Bhadrapada',sanskritName:'Uttara Bhadrapada',lord:'Saturn',deity:'Ahir Budhnya', symbol: 'Back of Funeral Cot',gana:'Manushya',yoni:'Cow',     nadi: 'Madhya', varna: 'Kshatriya',element: 'Water', startDegree: 333.3333, endDegree: 346.6667 },
  { index: 27, name: 'Revati',       sanskritName: 'Revati',       lord: 'Mercury', deity: 'Pushan',           symbol: 'Fish/Drum',        gana: 'Deva',     yoni: 'Elephant', nadi: 'Antya',  varna: 'Shudra',   element: 'Water', startDegree: 346.6667, endDegree: 360.0000 },
];

// ─── Vimshottari Dasha Periods ───────────────────────────────────────────────

export const VIMSHOTTARI_YEARS: Record<BodyPlanet, number> = {
  Sun:     6,
  Moon:    10,
  Mars:    7,
  Rahu:    18,
  Jupiter: 16,
  Saturn:  19,
  Mercury: 17,
  Ketu:    7,
  Venus:   20,
};

// Vimshottari order starting from Ketu
export const DASHA_ORDER: BodyPlanet[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

// ─── Planetary Labels ────────────────────────────────────────────────────────

export const PLANET_LABELS: Record<Planet, { english: string; sanskrit: string; symbol: string }> = {
  Sun:       { english: 'Sun',       sanskrit: 'Surya',   symbol: '☉' },
  Moon:      { english: 'Moon',      sanskrit: 'Chandra', symbol: '☽' },
  Mars:      { english: 'Mars',      sanskrit: 'Mangal',  symbol: '♂' },
  Mercury:   { english: 'Mercury',   sanskrit: 'Budha',   symbol: '☿' },
  Jupiter:   { english: 'Jupiter',   sanskrit: 'Guru',    symbol: '♃' },
  Venus:     { english: 'Venus',     sanskrit: 'Shukra',  symbol: '♀' },
  Saturn:    { english: 'Saturn',    sanskrit: 'Shani',   symbol: '♄' },
  Rahu:      { english: 'Rahu',      sanskrit: 'Rahu',    symbol: '☊' },
  Ketu:      { english: 'Ketu',      sanskrit: 'Ketu',    symbol: '☋' },
  Ascendant: { english: 'Ascendant', sanskrit: 'Lagna',   symbol: 'Asc' },
};

// ─── Exaltation / Debilitation / Moolatrikona ────────────────────────────────

export interface PlanetDignityData {
  exaltedSign: Sign;
  exaltedDegree: number;     // peak exaltation degree in that sign
  debilitatedSign: Sign;
  debilitatedDegree: number;
  moolatrikonaSign: Sign;
  moolatrikonaStart: number;
  moolatrikonaEnd: number;
  ownSigns: Sign[];
  color: string;
  gemstone: string;
  metal: string;
  day: string;
  beejMantra: string;
}

export const PLANET_DIGNITY_DATA: Partial<Record<BodyPlanet, PlanetDignityData>> = {
  Sun: {
    exaltedSign: 'Aries',       exaltedDegree: 10,
    debilitatedSign: 'Libra',   debilitatedDegree: 10,
    moolatrikonaSign: 'Leo',    moolatrikonaStart: 0,  moolatrikonaEnd: 20,
    ownSigns: ['Leo'],
    color: '#FF8C00', gemstone: 'Ruby', metal: 'Gold', day: 'Sunday',
    beejMantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah',
  },
  Moon: {
    exaltedSign: 'Taurus',      exaltedDegree: 3,
    debilitatedSign: 'Scorpio', debilitatedDegree: 3,
    moolatrikonaSign: 'Taurus', moolatrikonaStart: 4,  moolatrikonaEnd: 30,
    ownSigns: ['Cancer'],
    color: '#C0C0FF', gemstone: 'Pearl / Moon Stone', metal: 'Silver', day: 'Monday',
    beejMantra: 'Om Shraam Shreem Shraum Sah Chandraya Namah',
  },
  Mars: {
    exaltedSign: 'Capricorn',   exaltedDegree: 28,
    debilitatedSign: 'Cancer',  debilitatedDegree: 28,
    moolatrikonaSign: 'Aries',  moolatrikonaStart: 0,  moolatrikonaEnd: 12,
    ownSigns: ['Aries', 'Scorpio'],
    color: '#FF4500', gemstone: 'Red Coral', metal: 'Copper', day: 'Tuesday',
    beejMantra: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah',
  },
  Mercury: {
    exaltedSign: 'Virgo',       exaltedDegree: 15,
    debilitatedSign: 'Pisces',  debilitatedDegree: 15,
    moolatrikonaSign: 'Virgo',  moolatrikonaStart: 16, moolatrikonaEnd: 20,
    ownSigns: ['Gemini', 'Virgo'],
    color: '#32CD32', gemstone: 'Emerald', metal: 'Bronze', day: 'Wednesday',
    beejMantra: 'Om Braam Breem Braum Sah Budhaya Namah',
  },
  Jupiter: {
    exaltedSign: 'Cancer',      exaltedDegree: 5,
    debilitatedSign: 'Capricorn',debilitatedDegree: 5,
    moolatrikonaSign: 'Sagittarius', moolatrikonaStart: 0, moolatrikonaEnd: 10,
    ownSigns: ['Sagittarius', 'Pisces'],
    color: '#FFD700', gemstone: 'Yellow Sapphire', metal: 'Gold', day: 'Thursday',
    beejMantra: 'Om Graam Greem Graum Sah Guruve Namah',
  },
  Venus: {
    exaltedSign: 'Pisces',      exaltedDegree: 27,
    debilitatedSign: 'Virgo',   debilitatedDegree: 27,
    moolatrikonaSign: 'Libra',  moolatrikonaStart: 0,  moolatrikonaEnd: 15,
    ownSigns: ['Taurus', 'Libra'],
    color: '#FF69B4', gemstone: 'Diamond / White Sapphire', metal: 'Silver', day: 'Friday',
    beejMantra: 'Om Draam Dreem Draum Sah Shukraya Namah',
  },
  Saturn: {
    exaltedSign: 'Libra',       exaltedDegree: 20,
    debilitatedSign: 'Aries',   debilitatedDegree: 20,
    moolatrikonaSign: 'Aquarius',moolatrikonaStart: 0, moolatrikonaEnd: 20,
    ownSigns: ['Capricorn', 'Aquarius'],
    color: '#4169E1', gemstone: 'Blue Sapphire', metal: 'Iron', day: 'Saturday',
    beejMantra: 'Om Praam Preem Praum Sah Shanaischaraya Namah',
  },
  Rahu: {
    exaltedSign: 'Gemini',      exaltedDegree: 20,
    debilitatedSign: 'Sagittarius', debilitatedDegree: 20,
    moolatrikonaSign: 'Gemini', moolatrikonaStart: 0, moolatrikonaEnd: 20,
    ownSigns: ['Gemini'],
    color: '#8B008B', gemstone: 'Hessonite (Gomed)', metal: 'Mixed Metals', day: 'Saturday',
    beejMantra: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah',
  },
  Ketu: {
    exaltedSign: 'Sagittarius', exaltedDegree: 20,
    debilitatedSign: 'Gemini',  debilitatedDegree: 20,
    moolatrikonaSign: 'Scorpio',moolatrikonaStart: 0, moolatrikonaEnd: 20,
    ownSigns: ['Scorpio'],
    color: '#808080', gemstone: "Cat's Eye (Lehsunia)", metal: 'Mixed Metals', day: 'Tuesday',
    beejMantra: 'Om Sraam Sreem Sraum Sah Ketave Namah',
  },
};

// ─── Panchadha Maitri (Permanent Friendships) ─────────────────────────────────

// Natural (Naisargika) friendship table — keys are planet, values group signs by relationship
export const NATURAL_FRIENDS: Partial<Record<BodyPlanet, BodyPlanet[]>> = {
  Sun:     ['Moon', 'Mars', 'Jupiter'],
  Moon:    ['Sun', 'Mercury'],
  Mars:    ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus:   ['Mercury', 'Saturn'],
  Saturn:  ['Mercury', 'Venus'],
  Rahu:    ['Venus', 'Saturn'],
  Ketu:    ['Mars', 'Venus'],
};

export const NATURAL_ENEMIES: Partial<Record<BodyPlanet, BodyPlanet[]>> = {
  Sun:     ['Venus', 'Saturn'],
  Moon:    ['Rahu', 'Ketu'],
  Mars:    ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus:   ['Sun', 'Moon'],
  Saturn:  ['Sun', 'Moon', 'Mars'],
  Rahu:    ['Sun', 'Moon', 'Mars'],
  Ketu:    ['Sun', 'Moon', 'Mercury'],
};

// ─── House Metadata ───────────────────────────────────────────────────────────

export interface HouseMetadata {
  number: number;
  sanskritName: string;
  significance: string;
}

export const HOUSE_METADATA: HouseMetadata[] = [
  { number:  1, sanskritName: 'Tanu Bhava',    significance: 'Self, personality, body, appearance, vitality, beginnings' },
  { number:  2, sanskritName: 'Dhana Bhava',   significance: 'Wealth, speech, family, food, early childhood, face' },
  { number:  3, sanskritName: 'Sahaja Bhava',  significance: 'Siblings, courage, communication, short journeys, hobbies' },
  { number:  4, sanskritName: 'Sukha Bhava',   significance: 'Mother, home, happiness, property, education, emotional foundation' },
  { number:  5, sanskritName: 'Putra Bhava',   significance: 'Children, creativity, intelligence, romance, speculation, past merit' },
  { number:  6, sanskritName: 'Shatru Bhava',  significance: 'Enemies, debts, disease, service, litigation, daily work' },
  { number:  7, sanskritName: 'Kalatra Bhava', significance: 'Spouse, partnerships, business, open enemies, foreign travel' },
  { number:  8, sanskritName: 'Mrityu Bhava',  significance: 'Longevity, transformation, death, occult, inheritance, hidden matters' },
  { number:  9, sanskritName: 'Dharma Bhava',  significance: 'Father, luck, higher wisdom, dharma, long journeys, guru' },
  { number: 10, sanskritName: 'Karma Bhava',   significance: 'Career, authority, reputation, government, social status, actions' },
  { number: 11, sanskritName: 'Labha Bhava',   significance: 'Gains, income, elder siblings, friends, fulfillment of desires' },
  { number: 12, sanskritName: 'Vyaya Bhava',   significance: 'Loss, expenditure, liberation, foreign lands, isolation, spirituality' },
];

// ─── Panchang — Tithis, Yogas, Karanas ───────────────────────────────────────

export const TITHI_NAMES = [
  'Pratipada','Dvitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dvadashi','Trayodashi','Chaturdashi','Purnima/Amavasya'
];

export const YOGA_NAMES = [
  'Vishkumbha','Preeti','Ayushman','Saubhagya','Shobhana',
  'Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi',
  'Dhruva','Vyaghata','Harshana','Vajra','Siddhi','Vyatipata',
  'Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha',
  'Shukla','Brahma','Indra','Vaidhriti'
];

export const KARANA_NAMES = [
  'Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti',
  'Shakuni','Chatushpada','Naga','Kimstughna'
];

export const VAAR_LORDS: Planet[] = [
  'Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'
];
// ─── Combustion Orbs ─────────────────────────────────────────────────────────

export const COMBUSTION_ORBS: Partial<Record<BodyPlanet, number>> = {
  Moon:    12, // Degrees from Sun
  Mars:    17,
  Mercury:  8, // 14 when retrograde (handled in dignity calc)
  Jupiter: 11,
  Venus:   10, // 8 when retrograde
  Saturn:  15,
};
