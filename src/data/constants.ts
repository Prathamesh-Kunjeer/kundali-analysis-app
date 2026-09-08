import { 
  PlanetName, 
  RashiName, 
  NakshatraInfo, 
  GanaType, 
  YoniAnimal, 
  NadiType, 
  VarnaType, 
  DignityType 
} from '../types/astrology';

export const RASHIS: {
  number: number;
  name: RashiName;
  sanskritName: string;
  hindiName: string;
  symbol: string;
  lord: PlanetName;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Chara (Movable)' | 'Sthira (Fixed)' | 'Dwisvabhava (Dual)';
  gender: 'Male' | 'Female';
  bodyPart: string;
  luckyColors: string[];
  luckyNumbers: number[];
}[] = [
  {
    number: 1,
    name: 'Aries',
    sanskritName: 'Mesha',
    hindiName: 'मेष',
    symbol: '♈',
    lord: 'Mars',
    element: 'Fire',
    quality: 'Chara (Movable)',
    gender: 'Male',
    bodyPart: 'Head, Brain',
    luckyColors: ['Red', 'Coral', 'Golden Yellow'],
    luckyNumbers: [9, 1, 3]
  },
  {
    number: 2,
    name: 'Taurus',
    sanskritName: 'Vrishabha',
    hindiName: 'वृषभ',
    symbol: '♉',
    lord: 'Venus',
    element: 'Earth',
    quality: 'Sthira (Fixed)',
    gender: 'Female',
    bodyPart: 'Face, Throat, Neck',
    luckyColors: ['White', 'Pastel Blue', 'Pink'],
    luckyNumbers: [6, 5, 8]
  },
  {
    number: 3,
    name: 'Gemini',
    sanskritName: 'Mithuna',
    hindiName: 'मिथुन',
    symbol: '♊',
    lord: 'Mercury',
    element: 'Air',
    quality: 'Dwisvabhava (Dual)',
    gender: 'Male',
    bodyPart: 'Shoulders, Arms, Lungs',
    luckyColors: ['Emerald Green', 'Light Yellow', 'Sky Blue'],
    luckyNumbers: [5, 3, 7]
  },
  {
    number: 4,
    name: 'Cancer',
    sanskritName: 'Karka',
    hindiName: 'कर्क',
    symbol: '♋',
    lord: 'Moon',
    element: 'Water',
    quality: 'Chara (Movable)',
    gender: 'Female',
    bodyPart: 'Chest, Breast, Stomach',
    luckyColors: ['Silver White', 'Cream', 'Pearl White'],
    luckyNumbers: [2, 7, 9]
  },
  {
    number: 5,
    name: 'Leo',
    sanskritName: 'Simha',
    hindiName: 'सिंह',
    symbol: '♌',
    lord: 'Sun',
    element: 'Fire',
    quality: 'Sthira (Fixed)',
    gender: 'Male',
    bodyPart: 'Heart, Upper Back, Spine',
    luckyColors: ['Royal Gold', 'Ruby Red', 'Orange'],
    luckyNumbers: [1, 5, 9]
  },
  {
    number: 6,
    name: 'Virgo',
    sanskritName: 'Kanya',
    hindiName: 'कन्या',
    symbol: '♍',
    lord: 'Mercury',
    element: 'Earth',
    quality: 'Dwisvabhava (Dual)',
    gender: 'Female',
    bodyPart: 'Abdomen, Intestines',
    luckyColors: ['Dark Green', 'Grey', 'Brown'],
    luckyNumbers: [5, 6, 2]
  },
  {
    number: 7,
    name: 'Libra',
    sanskritName: 'Tula',
    hindiName: 'तुला',
    symbol: '♎',
    lord: 'Venus',
    element: 'Air',
    quality: 'Chara (Movable)',
    gender: 'Male',
    bodyPart: 'Kidneys, Lower Back, Pelvis',
    luckyColors: ['Turquoise', 'White', 'Light Blue'],
    luckyNumbers: [6, 7, 4]
  },
  {
    number: 8,
    name: 'Scorpio',
    sanskritName: 'Vrishchika',
    hindiName: 'वृश्चिक',
    symbol: '♏',
    lord: 'Mars',
    element: 'Water',
    quality: 'Sthira (Fixed)',
    gender: 'Female',
    bodyPart: 'Genitals, Excretory organs',
    luckyColors: ['Deep Red', 'Maroon', 'Rust'],
    luckyNumbers: [9, 8, 4]
  },
  {
    number: 9,
    name: 'Sagittarius',
    sanskritName: 'Dhanu',
    hindiName: 'धनु',
    symbol: '♐',
    lord: 'Jupiter',
    element: 'Fire',
    quality: 'Dwisvabhava (Dual)',
    gender: 'Male',
    bodyPart: 'Thighs, Hips, Arterial system',
    luckyColors: ['Saffron', 'Bright Yellow', 'Golden'],
    luckyNumbers: [3, 9, 1]
  },
  {
    number: 10,
    name: 'Capricorn',
    sanskritName: 'Makara',
    hindiName: 'मकर',
    symbol: '♑',
    lord: 'Saturn',
    element: 'Earth',
    quality: 'Chara (Movable)',
    gender: 'Female',
    bodyPart: 'Knees, Bones, Joints',
    luckyColors: ['Deep Blue', 'Black', 'Charcoal'],
    luckyNumbers: [8, 4, 6]
  },
  {
    number: 11,
    name: 'Aquarius',
    sanskritName: 'Kumbha',
    hindiName: 'कुम्भ',
    symbol: '♒',
    lord: 'Saturn',
    element: 'Air',
    quality: 'Sthira (Fixed)',
    gender: 'Male',
    bodyPart: 'Shins, Calves, Ankles',
    luckyColors: ['Electric Blue', 'Violet', 'Purple'],
    luckyNumbers: [8, 7, 3]
  },
  {
    number: 12,
    name: 'Pisces',
    sanskritName: 'Meena',
    hindiName: 'मीन',
    symbol: '♓',
    lord: 'Jupiter',
    element: 'Water',
    quality: 'Dwisvabhava (Dual)',
    gender: 'Female',
    bodyPart: 'Feet, Toes, Lymphatic system',
    luckyColors: ['Sea Green', 'Pale Yellow', 'Golden Amber'],
    luckyNumbers: [3, 7, 2]
  }
];

export const NAKSHATRAS: NakshatraInfo[] = [
  { index: 1, name: 'Ashwini', sanskritName: 'अश्विनी', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse Head', gana: 'Deva', yoni: 'Horse', nadi: 'Aadi', varna: 'Vaishya', element: 'Earth' },
  { index: 2, name: 'Bharani', sanskritName: 'भरणी', lord: 'Venus', deity: 'Yama', symbol: 'Yoni / Vagina', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', varna: 'Shudra', element: 'Earth' },
  { index: 3, name: 'Krittika', sanskritName: 'कृत्तिका', lord: 'Sun', deity: 'Agni', symbol: 'Razor / Flame', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya', varna: 'Brahmin', element: 'Earth' },
  { index: 4, name: 'Rohini', sanskritName: 'रोहिणी', lord: 'Moon', deity: 'Brahma / Prajapati', symbol: 'Cart / Chariot', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya', varna: 'Shudra', element: 'Earth' },
  { index: 5, name: 'Mrigashira', sanskritName: 'मृगशिरा', lord: 'Mars', deity: 'Soma', symbol: 'Deer Head', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya', varna: 'Vaishya', element: 'Earth' },
  { index: 6, name: 'Ardra', sanskritName: 'आर्द्रा', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop / Diamond', gana: 'Manushya', yoni: 'Dog', nadi: 'Aadi', varna: 'Kshatriya', element: 'Water' },
  { index: 7, name: 'Punarvasu', sanskritName: 'पुनर्वसु', lord: 'Jupiter', deity: 'Aditi', symbol: 'Bow and Quiver', gana: 'Deva', yoni: 'Cat', nadi: 'Aadi', varna: 'Vaishya', element: 'Water' },
  { index: 8, name: 'Pushya', sanskritName: 'पुष्य', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Cow Udder / Lotus', gana: 'Deva', yoni: 'Sheep', nadi: 'Madhya', varna: 'Kshatriya', element: 'Water' },
  { index: 9, name: 'Ashlesha', sanskritName: 'आश्लेषा', lord: 'Mercury', deity: 'Nagas / Serpents', symbol: 'Coiled Serpent', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya', varna: 'Shudra', element: 'Water' },
  { index: 10, name: 'Magha', sanskritName: 'मघा', lord: 'Ketu', deity: 'Pitris (Ancestors)', symbol: 'Royal Throne', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya', varna: 'Shudra', element: 'Water' },
  { index: 11, name: 'Purva Phalguni', sanskritName: 'पूर्वाफाल्गुनी', lord: 'Venus', deity: 'Bhaga', symbol: 'Front legs of Bed', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya', varna: 'Brahmin', element: 'Water' },
  { index: 12, name: 'Uttara Phalguni', sanskritName: 'उत्तराफाल्गुनी', lord: 'Sun', deity: 'Aryaman', symbol: 'Back legs of Bed', gana: 'Manushya', yoni: 'Cow', nadi: 'Aadi', varna: 'Kshatriya', element: 'Fire' },
  { index: 13, name: 'Hasta', sanskritName: 'हस्त', lord: 'Moon', deity: 'Savitr (Sun)', symbol: 'Hand / Fist', gana: 'Deva', yoni: 'Buffalo', nadi: 'Aadi', varna: 'Vaishya', element: 'Fire' },
  { index: 14, name: 'Chitra', sanskritName: 'चित्रा', lord: 'Mars', deity: 'Tvashtar (Architect)', symbol: 'Bright Pearl / Gem', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya', varna: 'Shudra', element: 'Fire' },
  { index: 15, name: 'Swati', sanskritName: 'स्वाति', lord: 'Rahu', deity: 'Vayu (Wind)', symbol: 'Young Shoot / Coral', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya', varna: 'Kshatriya', element: 'Fire' },
  { index: 16, name: 'Vishakha', sanskritName: 'विशाखा', lord: 'Jupiter', deity: 'Indra & Agni', symbol: 'Triumphal Arch', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya', varna: 'Brahmin', element: 'Fire' },
  { index: 17, name: 'Anuradha', sanskritName: 'अनुराधा', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus flower / Staff', gana: 'Deva', yoni: 'Hare', nadi: 'Madhya', varna: 'Shudra', element: 'Fire' },
  { index: 18, name: 'Jyeshtha', sanskritName: 'ज्येष्ठा', lord: 'Mercury', deity: 'Indra', symbol: 'Circular Amulet / Umbrella', gana: 'Rakshasa', yoni: 'Hare', nadi: 'Aadi', varna: 'Vaishya', element: 'Air' },
  { index: 19, name: 'Mula', sanskritName: 'मूल', lord: 'Ketu', deity: 'Nirriti (Goddess of dissolution)', symbol: 'Tied bunch of roots', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Aadi', varna: 'Kshatriya', element: 'Air' },
  { index: 20, name: 'Purva Ashadha', sanskritName: 'पूर्वाषाढ़ा', lord: 'Venus', deity: 'Apas (Water)', symbol: 'Elephant Tusk / Fan', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya', varna: 'Brahmin', element: 'Air' },
  { index: 21, name: 'Uttara Ashadha', sanskritName: 'उत्तराषाढ़ा', lord: 'Sun', deity: 'Vishwadevas', symbol: 'Small Cot / Elephant tusk', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya', varna: 'Kshatriya', element: 'Air' },
  { index: 22, name: 'Shravana', sanskritName: 'श्रवण', lord: 'Moon', deity: 'Vishnu', symbol: 'Three footprints / Ear', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya', varna: 'Vaishya', element: 'Air' },
  { index: 23, name: 'Dhanishta', sanskritName: 'धनिष्ठा', lord: 'Mars', deity: 'Eight Vasus', symbol: 'Musical Drum (Mridangam)', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya', varna: 'Shudra', element: 'Earth' },
  { index: 24, name: 'Shatabhisha', sanskritName: 'शतभिषा', lord: 'Rahu', deity: 'Varuna (Cosmic waters)', symbol: 'Empty Circle / 100 Physicians', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Aadi', varna: 'Shudra', element: 'Earth' },
  { index: 25, name: 'Purva Bhadrapada', sanskritName: 'पूर्वभाद्रपदा', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Two front legs of a funeral cot', gana: 'Manushya', yoni: 'Lion', nadi: 'Aadi', varna: 'Brahmin', element: 'Earth' },
  { index: 26, name: 'Uttara Bhadrapada', sanskritName: 'उत्तरभाद्रपदा', lord: 'Saturn', deity: 'Ahirbudhnya (Serpent of deep)', symbol: 'Two back legs of funeral cot', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya', varna: 'Kshatriya', element: 'Earth' },
  { index: 27, name: 'Revati', sanskritName: 'रेवती', lord: 'Mercury', deity: 'Pushan (Nourisher)', symbol: 'Fish / Pair of Fish', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya', varna: 'Shudra', element: 'Water' }
];

export const PLANETS_DATA: Record<PlanetName, {
  sanskritName: string;
  hindiName: string;
  symbol: string;
  vedicSymbol: string;
  day: string;
  color: string;
  gemstone: string;
  hindiGemstone: string;
  metal: string;
  mantra: string;
  beejMantra: string;
  exaltationSign: RashiName;
  exaltationDegree: number;
  debilitationSign: RashiName;
  debilitationDegree: number;
  ownSigns: RashiName[];
  moolatrikonaSign: RashiName;
  moolatrikonaDegree: [number, number]; // [start, end]
  friends: PlanetName[];
  enemies: PlanetName[];
  neutral: PlanetName[];
  vimshottariYears: number;
  karakatwas: string[];
}> = {
  Sun: {
    sanskritName: 'Surya',
    hindiName: 'सूर्य',
    symbol: '☉',
    vedicSymbol: 'रवि',
    day: 'Sunday',
    color: '#F59E0B',
    gemstone: 'Ruby',
    hindiGemstone: 'माणिक्य',
    metal: 'Copper, Gold',
    mantra: 'Om Suryaya Namaha',
    beejMantra: 'Om Hram Hreem Hroum Sah Suryaya Namah',
    exaltationSign: 'Aries',
    exaltationDegree: 10,
    debilitationSign: 'Libra',
    debilitationDegree: 10,
    ownSigns: ['Leo'],
    moolatrikonaSign: 'Leo',
    moolatrikonaDegree: [0, 20],
    friends: ['Moon', 'Mars', 'Jupiter'],
    enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu'],
    neutral: ['Mercury'],
    vimshottariYears: 6,
    karakatwas: ['Soul', 'Father', 'Authority', 'King', 'Vitality', 'Self-esteem', 'Government']
  },
  Moon: {
    sanskritName: 'Chandra',
    hindiName: 'चन्द्र',
    symbol: '☽',
    vedicSymbol: 'सोम',
    day: 'Monday',
    color: '#E2E8F0',
    gemstone: 'Pearl',
    hindiGemstone: 'मोती',
    metal: 'Silver',
    mantra: 'Om Chandraya Namaha',
    beejMantra: 'Om Shram Shreem Shroum Sah Chandramase Namah',
    exaltationSign: 'Taurus',
    exaltationDegree: 3,
    debilitationSign: 'Scorpio',
    debilitationDegree: 3,
    ownSigns: ['Cancer'],
    moolatrikonaSign: 'Taurus',
    moolatrikonaDegree: [3, 30],
    friends: ['Sun', 'Mercury'],
    enemies: [],
    neutral: ['Mars', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'],
    vimshottariYears: 10,
    karakatwas: ['Mind', 'Mother', 'Emotions', 'Intuition', 'Peace', 'Memory', 'Fluid balance']
  },
  Mars: {
    sanskritName: 'Mangal',
    hindiName: 'मंगल',
    symbol: '♂',
    vedicSymbol: 'भौम',
    day: 'Tuesday',
    color: '#EF4444',
    gemstone: 'Red Coral',
    hindiGemstone: 'मूंगा',
    metal: 'Copper, Brass',
    mantra: 'Om Bhaumaya Namaha',
    beejMantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah',
    exaltationSign: 'Capricorn',
    exaltationDegree: 28,
    debilitationSign: 'Cancer',
    debilitationDegree: 28,
    ownSigns: ['Aries', 'Scorpio'],
    moolatrikonaSign: 'Aries',
    moolatrikonaDegree: [0, 12],
    friends: ['Sun', 'Moon', 'Jupiter'],
    enemies: ['Mercury', 'Rahu', 'Ketu'],
    neutral: ['Venus', 'Saturn'],
    vimshottariYears: 7,
    karakatwas: ['Courage', 'Siblings', 'Land/Property', 'Action', 'Ambition', 'Blood', 'Surgery']
  },
  Mercury: {
    sanskritName: 'Budha',
    hindiName: 'बुध',
    symbol: '☿',
    vedicSymbol: 'बुध',
    day: 'Wednesday',
    color: '#10B981',
    gemstone: 'Emerald',
    hindiGemstone: 'पन्ना',
    metal: 'Bronze, Brass',
    mantra: 'Om Budhaya Namaha',
    beejMantra: 'Om Bram Breem Broum Sah Budhaya Namah',
    exaltationSign: 'Virgo',
    exaltationDegree: 15,
    debilitationSign: 'Pisces',
    debilitationDegree: 15,
    ownSigns: ['Gemini', 'Virgo'],
    moolatrikonaSign: 'Virgo',
    moolatrikonaDegree: [15, 20],
    friends: ['Sun', 'Venus'],
    enemies: ['Moon'],
    neutral: ['Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'],
    vimshottariYears: 17,
    karakatwas: ['Intellect', 'Speech', 'Commerce', 'Mathematics', 'Writing', 'Logic', 'Nerves']
  },
  Jupiter: {
    sanskritName: 'Guru / Brihaspati',
    hindiName: 'बृहस्पति / गुरु',
    symbol: '♃',
    vedicSymbol: 'गुरु',
    day: 'Thursday',
    color: '#FBBF24',
    gemstone: 'Yellow Sapphire',
    hindiGemstone: 'पुखराज',
    metal: 'Gold',
    mantra: 'Om Brihaspataye Namaha',
    beejMantra: 'Om Gram Greem Groum Sah Gurave Namah',
    exaltationSign: 'Cancer',
    exaltationDegree: 5,
    debilitationSign: 'Capricorn',
    debilitationDegree: 5,
    ownSigns: ['Sagittarius', 'Pisces'],
    moolatrikonaSign: 'Sagittarius',
    moolatrikonaDegree: [0, 10],
    friends: ['Sun', 'Moon', 'Mars'],
    enemies: ['Mercury', 'Venus'],
    neutral: ['Saturn', 'Rahu', 'Ketu'],
    vimshottariYears: 16,
    karakatwas: ['Wisdom', 'Guru', 'Children', 'Wealth', 'Dharma', 'Spirituality', 'Fortune']
  },
  Venus: {
    sanskritName: 'Shukra',
    hindiName: 'शुक्र',
    symbol: '♀',
    vedicSymbol: 'शुक्र',
    day: 'Friday',
    color: '#EC4899',
    gemstone: 'Diamond / White Sapphire',
    hindiGemstone: 'हीरा / ओपल',
    metal: 'Silver, Platinum',
    mantra: 'Om Shukraya Namaha',
    beejMantra: 'Om Dram Dreem Droum Sah Shukraya Namah',
    exaltationSign: 'Pisces',
    exaltationDegree: 27,
    debilitationSign: 'Virgo',
    debilitationDegree: 27,
    ownSigns: ['Taurus', 'Libra'],
    moolatrikonaSign: 'Libra',
    moolatrikonaDegree: [0, 15],
    friends: ['Mercury', 'Saturn', 'Rahu', 'Ketu'],
    enemies: ['Sun', 'Moon'],
    neutral: ['Mars', 'Jupiter'],
    vimshottariYears: 20,
    karakatwas: ['Love', 'Spouse', 'Beauty', 'Art', 'Luxury', 'Vehicles', 'Creativity']
  },
  Saturn: {
    sanskritName: 'Shani',
    hindiName: 'शनि',
    symbol: '♄',
    vedicSymbol: 'शनि',
    day: 'Saturday',
    color: '#6366F1',
    gemstone: 'Blue Sapphire',
    hindiGemstone: 'नीलम',
    metal: 'Iron, Lead',
    mantra: 'Om Sham Shanaicharaya Namaha',
    beejMantra: 'Om Pram Preem Proum Sah Shanaishcharaya Namah',
    exaltationSign: 'Libra',
    exaltationDegree: 20,
    debilitationSign: 'Aries',
    debilitationDegree: 20,
    ownSigns: ['Capricorn', 'Aquarius'],
    moolatrikonaSign: 'Aquarius',
    moolatrikonaDegree: [0, 20],
    friends: ['Mercury', 'Venus', 'Rahu', 'Ketu'],
    enemies: ['Sun', 'Moon', 'Mars'],
    neutral: ['Jupiter'],
    vimshottariYears: 19,
    karakatwas: ['Karma', 'Discipline', 'Longevity', 'Patience', 'Hard work', 'Suffering/Growth', 'Detachment']
  },
  Rahu: {
    sanskritName: 'Rahu (North Node)',
    hindiName: 'राहु',
    symbol: '☊',
    vedicSymbol: 'राहु',
    day: 'Saturday',
    color: '#8B5CF6',
    gemstone: 'Hessonite (Gomed)',
    hindiGemstone: 'गोमेद',
    metal: 'Lead, Mixed alloys',
    mantra: 'Om Rahave Namaha',
    beejMantra: 'Om Bhram Bhreem Bhroum Sah Rahave Namah',
    exaltationSign: 'Taurus', // Taurus / Gemini depending on tradition
    exaltationDegree: 15,
    debilitationSign: 'Scorpio',
    debilitationDegree: 15,
    ownSigns: ['Aquarius'],
    moolatrikonaSign: 'Gemini',
    moolatrikonaDegree: [0, 15],
    friends: ['Mercury', 'Venus', 'Saturn'],
    enemies: ['Sun', 'Moon', 'Mars'],
    neutral: ['Jupiter'],
    vimshottariYears: 18,
    karakatwas: ['Worldly Ambition', 'Foreign Lands', 'Innovation', 'Obsession', 'Illusion (Maya)', 'Fame']
  },
  Ketu: {
    sanskritName: 'Ketu (South Node)',
    hindiName: 'केतु',
    symbol: '☋',
    vedicSymbol: 'केतु',
    day: 'Tuesday',
    color: '#64748B',
    gemstone: "Cat's Eye (Lehsuniya)",
    hindiGemstone: 'लहसुनिया',
    metal: 'Lead',
    mantra: 'Om Ketave Namaha',
    beejMantra: 'Om Shram Shreem Shroum Sah Ketave Namah',
    exaltationSign: 'Scorpio',
    exaltationDegree: 15,
    debilitationSign: 'Taurus',
    debilitationDegree: 15,
    ownSigns: ['Scorpio'],
    moolatrikonaSign: 'Sagittarius',
    moolatrikonaDegree: [0, 15],
    friends: ['Mercury', 'Venus', 'Saturn'],
    enemies: ['Sun', 'Moon', 'Mars'],
    neutral: ['Jupiter'],
    vimshottariYears: 7,
    karakatwas: ['Moksha (Liberation)', 'Spirituality', 'Intuition', 'Detachment', 'Occult', 'Past Karma']
  },
  Ascendant: {
    sanskritName: 'Lagna',
    hindiName: 'लग्न',
    symbol: 'Asc',
    vedicSymbol: 'लग्न',
    day: '',
    color: '#D4AF37',
    gemstone: '',
    hindiGemstone: '',
    metal: '',
    mantra: '',
    beejMantra: '',
    exaltationSign: 'Aries',
    exaltationDegree: 0,
    debilitationSign: 'Libra',
    debilitationDegree: 0,
    ownSigns: [],
    moolatrikonaSign: 'Aries',
    moolatrikonaDegree: [0, 0],
    friends: [],
    enemies: [],
    neutral: [],
    vimshottariYears: 0,
    karakatwas: ['Self', 'Physical Body', 'Appearance', 'Vitality', 'Overall Life Path']
  }
};

export const HOUSES_DATA: {
  number: number;
  sanskritName: string;
  hindiName: string;
  significance: string;
  karaka: PlanetName;
  bodyParts: string;
  category: 'Kendra' | 'Trikona' | 'Upachaya' | 'Dusthana' | 'Maraka';
}[] = [
  { number: 1, sanskritName: 'Tanu Bhava', hindiName: 'तनु भाव (प्रथम भाव)', significance: 'Self, Personality, Vitality, Physical Appearance, Longevity', karaka: 'Sun', bodyParts: 'Head, Brain', category: 'Kendra' },
  { number: 2, sanskritName: 'Dhana Bhava', hindiName: 'धन भाव (द्वितीय भाव)', significance: 'Wealth, Family, Speech, Food Habits, Accumulated Assets', karaka: 'Jupiter', bodyParts: 'Face, Mouth, Right Eye, Throat', category: 'Maraka' },
  { number: 3, sanskritName: 'Sahaja Bhava', hindiName: 'सहज भाव (तृतीय भाव)', significance: 'Courage, Younger Siblings, Short Travels, Communication, Writing', karaka: 'Mars', bodyParts: 'Shoulders, Arms, Hands, Respiratory', category: 'Upachaya' },
  { number: 4, sanskritName: 'Sukha Bhava', hindiName: 'सुख भाव (चतुर्थ भाव)', significance: 'Mother, Home, Conveyance (Vehicles), Property, Inner Peace', karaka: 'Moon', bodyParts: 'Chest, Heart, Lungs', category: 'Kendra' },
  { number: 5, sanskritName: 'Putra Bhava', hindiName: 'पुत्र भाव (पंचम भाव)', significance: 'Children, Intelligence, Romance, Purva Punya (Past Karma), Creativity', karaka: 'Jupiter', bodyParts: 'Stomach, Upper abdomen', category: 'Trikona' },
  { number: 6, sanskritName: 'Ari Bhava', hindiName: 'अरि भाव (षष्ठ भाव)', significance: 'Enemies, Debts, Diseases, Daily Routine, Competition, Service', karaka: 'Mars', bodyParts: 'Intestines, Navel area', category: 'Dusthana' },
  { number: 7, sanskritName: 'Kalatra Bhava', hindiName: 'कलत्र भाव (सप्तम भाव)', significance: 'Spouse, Marriage, Business Partnerships, Public Relations', karaka: 'Venus', bodyParts: 'Pelvis, Kidneys, Reproductive organs', category: 'Kendra' },
  { number: 8, sanskritName: 'Ayu Bhava', hindiName: 'आयु भाव (अष्टम भाव)', significance: 'Longevity, Sudden Events, Occult, In-laws, Inheritance, Transformation', karaka: 'Saturn', bodyParts: 'Genitals, Excretory system', category: 'Dusthana' },
  { number: 9, sanskritName: 'Dharma Bhava', hindiName: 'धर्म भाव (नवम भाव)', significance: 'Fortune (Bhagya), Father, Religion, Higher Learning, Long Journeys', karaka: 'Jupiter', bodyParts: 'Thighs, Hips', category: 'Trikona' },
  { number: 10, sanskritName: 'Karma Bhava', hindiName: 'कर्म भाव (दशम भाव)', significance: 'Career, Profession, Fame, Authority, Status in Society', karaka: 'Mercury', bodyParts: 'Knees, Joints', category: 'Kendra' },
  { number: 11, sanskritName: 'Labha Bhava', hindiName: 'लाभ भाव (एकादश भाव)', significance: 'Gains, Income, Elder Siblings, Aspirations, Social Network', karaka: 'Jupiter', bodyParts: 'Calves, Shins, Left Ear', category: 'Upachaya' },
  { number: 12, sanskritName: 'Vyaya Bhava', hindiName: 'व्यय भाव (द्वादश भाव)', significance: 'Expenses, Losses, Foreign Residence, Moksha, Sleep, Isolation', karaka: 'Saturn', bodyParts: 'Feet, Left Eye', category: 'Dusthana' }
];

export const DASHA_ORDER: PlanetName[] = [
  'Ketu', 
  'Venus', 
  'Sun', 
  'Moon', 
  'Mars', 
  'Rahu', 
  'Jupiter', 
  'Saturn', 
  'Mercury'
];
