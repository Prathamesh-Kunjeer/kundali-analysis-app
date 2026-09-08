// ============================================================
//  VARGA ENGINE — D1 through D12 Divisional Charts
//  Layer 2: Pure astrological calculation, NO UI imports.
//
//  Convention: Parashari Varga system (Brihat Parashara Hora Shastra - BPHS).
//  Each rule: given the planet's natal sidereal longitude,
//  return the 0-based sign index (0=Aries … 11=Pisces)
//  for that divisional chart.
//
//  References:
//    - Brihat Parashara Hora Shastra (BPHS), Ch. 6 "Vargas"
//    - Sanjay Rath's "Crux of Vedic Astrology"
//    - Ernst Wilhelm's "Core Yogas & Varga Tables"
// ============================================================

import { RASHIS, HOUSE_METADATA } from './constants';
import { computeDignity } from './dignities';
import type { KundaliChart, Planet, BodyPlanet, Sign, PlanetPosition, House, Dignity } from './models';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize any longitude to [0, 360) */
export function norm(lon: number): number {
  return ((lon % 360) + 360) % 360;
}

/** 0-based sign index from absolute sidereal longitude */
export function signIdx(lon: number): number {
  return Math.floor(norm(lon) / 30);
}

/** Degrees within sign (0–<30) — uses tiny epsilon guard for boundary */
export function degInSign(lon: number): number {
  const d = norm(lon) % 30;
  return d >= 30 ? 0 : d;
}

/** Map 0-based sign index to Sign name */
export function signName(idx: number): Sign {
  return RASHIS[((idx % 12) + 12) % 12].name;
}

/**
 * Degree within the divisional sign (0–30°).
 * Scales the planet's progress within its 30°/N part to a full 30° divisional sign.
 */
export function degInVargaSign(lon: number, division: VargaDivision): number {
  if (division === 1) return degInSign(lon);
  const deg = degInSign(lon);
  const partSize = 30 / division;
  const part = Math.min(Math.floor(deg / partSize), division - 1);
  const rem = deg - part * partSize;
  const vargaDeg = rem * division;
  return Math.min(Math.max(vargaDeg, 0), 29.9999);
}

/** Format degree as DMS string e.g. "14°23'" */
export function formatVargaDegree(deg: number): string {
  const degD = Math.floor(deg);
  const degM = Math.floor((deg - degD) * 60);
  return `${degD}°${String(degM).padStart(2, '0')}'`;
}

// ─── Individual Varga Rules (D1 – D12) ────────────────────────────────────────

/**
 * D1 — Rashi (Natal Chart)
 * Foundation chart. Identical to natal sign.
 */
export function d1SignIdx(lon: number): number {
  return signIdx(lon);
}

/**
 * D2 — Hora (BPHS convention)
 * Each sign split into two 15° halves.
 * Odd signs (Aries, Gemini, Leo...): 1st half → Leo (4), 2nd half → Cancer (3)
 * Even signs (Taurus, Cancer, Virgo...): 1st half → Cancer (3), 2nd half → Leo (4)
 */
export function d2SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const isOdd = rIdx % 2 === 0; // 0=Aries (odd zodiac sign #1)
  const firstHalf = deg < 15;
  if (isOdd) {
    return firstHalf ? 4 : 3; // Leo : Cancer
  } else {
    return firstHalf ? 3 : 4; // Cancer : Leo
  }
}

/**
 * D3 — Drekkana (Parashari / BPHS)
 * Each sign split into three 10° parts (trinal drekkanas).
 * 1st part (0–10°): own sign
 * 2nd part (10–20°): 5th sign from it (same element)
 * 3rd part (20–30°): 9th sign from it (same element)
 */
export function d3SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / 10), 2);
  const offsets = [0, 4, 8];
  return (rIdx + offsets[part]) % 12;
}

/**
 * D4 — Chaturthamsha (BPHS)
 * Each sign split into four 7°30' parts.
 * Movable / Cardinal signs (Ar, Ca, Li, Cp): count from own sign
 * Fixed signs (Ta, Le, Sc, Aq): count from 4th sign
 * Dual / Mutable signs (Ge, Vi, Sg, Pi): count from 7th sign
 */
export function d4SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / 7.5), 3);
  const mod = rIdx % 3; // 0=Cardinal, 1=Fixed, 2=Mutable
  const startSign = (rIdx + mod * 3) % 12;
  return (startSign + part) % 12;
}

/**
 * D5 — Panchamsha (BPHS Ch. 6)
 * Each sign split into five 6° parts.
 * Odd signs: Aries (0), Aquarius (10), Sagittarius (8), Gemini (2), Libra (6)
 * Even signs: Taurus (1), Virgo (5), Pisces (11), Capricorn (9), Scorpio (7)
 */
export function d5SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / 6), 4);
  const oddSeq = [0, 10, 8, 2, 6]; // Aries, Aquarius, Sagittarius, Gemini, Libra
  const evenSeq = [1, 5, 11, 9, 7]; // Taurus, Virgo, Pisces, Capricorn, Scorpio
  const isOdd = rIdx % 2 === 0;
  return isOdd ? oddSeq[part] : evenSeq[part];
}

/**
 * D6 — Shashthamsha (BPHS)
 * Each sign split into six 5° parts.
 * Odd signs: count from Aries (0)
 * Even signs: count from Libra (6)
 */
export function d6SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / 5), 5);
  const start = rIdx % 2 === 0 ? 0 : 6;
  return (start + part) % 12;
}

/**
 * D7 — Saptamsha (BPHS)
 * Each sign split into seven ~4°17' parts.
 * Odd signs: count from own sign
 * Even signs: count from 7th sign (rIdx + 6)
 */
export function d7SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / (30 / 7)), 6);
  const start = rIdx % 2 === 0 ? rIdx : (rIdx + 6) % 12;
  return (start + part) % 12;
}

/**
 * D8 — Ashtamsha (BPHS Ch. 6, v. 17-18)
 * Each sign split into eight 3°45' parts.
 * Movable signs: count from Aries (0)
 * Fixed signs: count from Sagittarius (8) [9th sign]
 * Dual signs: count from Leo (4) [5th sign]
 */
export function d8SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / 3.75), 7);
  const mod = rIdx % 3; // 0=Movable, 1=Fixed, 2=Dual
  const starts = [0, 8, 4];
  return (starts[mod] + part) % 12;
}

/**
 * D9 — Navamsha (BPHS)
 * The paramount divisional chart. Each sign split into nine 3°20' parts.
 * Fire signs (Aries, Leo, Sag): count from Aries (0)
 * Earth signs (Taurus, Virgo, Cap): count from Capricorn (9)
 * Air signs (Gemini, Libra, Aquarius): count from Libra (6)
 * Water signs (Cancer, Scorpio, Pisces): count from Cancer (3)
 */
export function d9SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / (30 / 9)), 8);
  const elementStarts = [0, 9, 6, 3]; // Fire→Ar, Earth→Cap, Air→Li, Water→Can
  const element = rIdx % 4;
  return (elementStarts[element] + part) % 12;
}

/**
 * D10 — Dashamsha (BPHS)
 * Each sign split into ten 3° parts.
 * Odd signs: count from own sign
 * Even signs: count from 9th sign (rIdx + 8)
 */
export function d10SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / 3), 9);
  const start = rIdx % 2 === 0 ? rIdx : (rIdx + 8) % 12;
  return (start + part) % 12;
}

/**
 * D11 — Rudramsha / Ekadashamsha (BPHS)
 * Each sign split into eleven ~2°43.6' parts.
 * Odd signs: count from own sign
 * Even signs: count from 3rd sign (rIdx + 2)
 */
export function d11SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / (30 / 11)), 10);
  const start = rIdx % 2 === 0 ? rIdx : (rIdx + 2) % 12;
  return (start + part) % 12;
}

/**
 * D12 — Dwadashamsha (BPHS)
 * Each sign split into twelve 2°30' parts.
 * Count from own sign: (rIdx + part) % 12
 */
export function d12SignIdx(lon: number): number {
  const rIdx = signIdx(lon);
  const deg = degInSign(lon);
  const part = Math.min(Math.floor(deg / 2.5), 11);
  return (rIdx + part) % 12;
}

// ─── Unified Varga Calculator ──────────────────────────────────────────────────

export type VargaDivision = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Centralized rule dispatcher */
export function calcVargaSignIdx(lon: number, division: VargaDivision): number {
  switch (division) {
    case 1:  return d1SignIdx(lon);
    case 2:  return d2SignIdx(lon);
    case 3:  return d3SignIdx(lon);
    case 4:  return d4SignIdx(lon);
    case 5:  return d5SignIdx(lon);
    case 6:  return d6SignIdx(lon);
    case 7:  return d7SignIdx(lon);
    case 8:  return d8SignIdx(lon);
    case 9:  return d9SignIdx(lon);
    case 10: return d10SignIdx(lon);
    case 11: return d11SignIdx(lon);
    case 12: return d12SignIdx(lon);
  }
}

// ─── Varga Metadata ───────────────────────────────────────────────────────────

export interface VargaInfo {
  division: VargaDivision;
  code: string;           // "D9"
  name: string;           // "Navamsha"
  sanskritName: string;
  area: string;           // plain-English primary area
  description: string;    // one-sentence plain English
  rule: string;           // technical calculation convention details
}

export const VARGA_INFO: Record<VargaDivision, VargaInfo> = {
  1:  {
    division: 1,
    code: 'D1',
    name: 'Rashi',
    sanskritName: 'Rashi',
    area: 'Overall personality & life path',
    description: 'The primary birth chart — the foundational mirror of all areas of life.',
    rule: 'Direct natal sidereal zodiac position. No subdivision.',
  },
  2:  {
    division: 2,
    code: 'D2',
    name: 'Hora',
    sanskritName: 'Hora',
    area: 'Wealth, finance & assets',
    description: 'Used traditionally to assess accumulated wealth, resources and earning capacity.',
    rule: '15° halves. Odd signs: 1st half → Leo (Sun), 2nd half → Cancer (Moon). Even signs: reversed.',
  },
  3:  {
    division: 3,
    code: 'D3',
    name: 'Drekkana',
    sanskritName: 'Drekkana',
    area: 'Siblings, courage & energy',
    description: 'Reveals relationships with brothers and sisters, personal bravery, vitality and initiative.',
    rule: '10° thirds. 1st third: own sign. 2nd: 5th sign (trinal). 3rd: 9th sign (trinal).',
  },
  4:  {
    division: 4,
    code: 'D4',
    name: 'Chaturthamsha',
    sanskritName: 'Chaturthamsha',
    area: 'Home, real estate & luck',
    description: 'Indicates fixed assets, real estate, land, vehicles and domestic happiness.',
    rule: '7°30\' quarters. Movable signs count from own; Fixed from 4th sign; Dual from 7th sign.',
  },
  5:  {
    division: 5,
    code: 'D5',
    name: 'Panchamsha',
    sanskritName: 'Panchamsha',
    area: 'Spiritual merit, wisdom & creativity',
    description: 'Shows past-life spiritual credit (Purva Punya), intelligence, fame and deep talents.',
    rule: '6° fifths. Odd signs map to Ar/Aq/Sg/Ge/Li; Even signs to Ta/Vi/Pi/Cp/Sc (BPHS Ch. 6).',
  },
  6:  {
    division: 6,
    code: 'D6',
    name: 'Shashthamsha',
    sanskritName: 'Shashthamsha',
    area: 'Health, obstacles & debts',
    description: 'Assesses physical vulnerabilities, chronic illnesses, debts, litigation and opponents.',
    rule: '5° sixths. Odd signs count sequentially from Aries; Even signs from Libra.',
  },
  7:  {
    division: 7,
    code: 'D7',
    name: 'Saptamsha',
    sanskritName: 'Saptamsha',
    area: 'Children, progeny & creative legacy',
    description: 'Traditionally studied for children, grandchildren, progeny happiness and creative fruitfulness.',
    rule: '~4°17\' sevenths. Odd signs count from own sign; Even signs count from 7th sign.',
  },
  8:  {
    division: 8,
    code: 'D8',
    name: 'Ashtamsha',
    sanskritName: 'Ashtamsha',
    area: 'Longevity, occult & sudden events',
    description: 'Indicates longevity, sudden transformations, hidden challenges and occult interests.',
    rule: '3°45\' eighths. Movable signs from Aries; Fixed signs from Sagittarius; Dual signs from Leo (BPHS).',
  },
  9:  {
    division: 9,
    code: 'D9',
    name: 'Navamsha',
    sanskritName: 'Navamsha',
    area: 'Marriage, relationships & planet strength',
    description: 'Used traditionally to study marriage, relationships and the deeper strength of planets.',
    rule: '3°20\' ninths. Fire signs start from Aries; Earth from Capricorn; Air from Libra; Water from Cancer.',
  },
  10: {
    division: 10,
    code: 'D10',
    name: 'Dashamsha',
    sanskritName: 'Dashamsha',
    area: 'Career, profession & public standing',
    description: 'Traditionally used for career, profession, reputation and public responsibilities.',
    rule: '3° tenths. Odd signs count from own sign; Even signs count from 9th sign.',
  },
  11: {
    division: 11,
    code: 'D11',
    name: 'Rudramsha',
    sanskritName: 'Ekadashamsha',
    area: 'Gains, fulfillment & income sources',
    description: 'Indicates high profits, financial windfalls, special accomplishments and fulfillment of desires.',
    rule: '~2°44\' elevenths. Odd signs count from own sign; Even signs count from 3rd sign.',
  },
  12: {
    division: 12,
    code: 'D12',
    name: 'Dwadashamsha',
    sanskritName: 'Dwadashamsha',
    area: 'Parents, heritage & ancestral karma',
    description: 'Shows parental influences, paternal/maternal karma, family lineage and inherited gifts.',
    rule: '2°30\' twelfths. All signs count sequentially starting from the natal sign itself.',
  },
};

export const VARGA_ORDER: VargaDivision[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ─── Data Models ──────────────────────────────────────────────────────────────

export interface DivisionalPlanet {
  planet: Planet;
  natalSign: Sign;
  natalSignIndex: number;
  natalLongitude: number;
  natalDegreeInSign: number;
  natalHouse: number;
  vargaSign: Sign;
  vargaSignIndex: number;
  vargaHouse: number;
  vargaDegreeInSign: number;
  vargaDegreeFormatted: string;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: Dignity;
  nakshatraName?: string;
  nakshatraPada?: number;
  strengthLevel?: string;
}

export interface DivisionalHouse {
  number: number;
  sign: Sign;
  signIndex: number;
  lord: Planet;
  planets: Planet[];
}

export interface DivisionalChart {
  division: VargaDivision;
  code: string;
  name: string;
  sanskritName: string;
  area: string;
  description: string;
  rule: string;
  lagnaSign: Sign;
  lagnaSignIndex: number;
  lagnaDegreeFormatted: string;
  planets: Record<string, DivisionalPlanet>;
  houses: DivisionalHouse[];
  syntheticChart: KundaliChart;
}

// ─── Divisional Chart Builder ─────────────────────────────────────────────────

/**
 * Builds a complete DivisionalChart object from existing natal KundaliChart data.
 * Pure, deterministic, and reuses the natal planetary calculations.
 */
export function buildDivisionalChart(
  chart: KundaliChart,
  division: VargaDivision
): DivisionalChart {
  const meta = VARGA_INFO[division];

  // 1. Calculate Divisional Lagna / Ascendant
  const lagnaNatalLon = chart.ascendant.longitude;
  const lagnaVargaSignIdx = calcVargaSignIdx(lagnaNatalLon, division);
  const lagnaSign = signName(lagnaVargaSignIdx);
  const lagnaVargaDeg = degInVargaSign(lagnaNatalLon, division);
  const lagnaDegreeFormatted = formatVargaDegree(lagnaVargaDeg);

  // 2. Calculate each planet's divisional sign & house
  const planetsMap: Record<string, DivisionalPlanet> = {};
  const syntheticPlanets: Record<Planet, PlanetPosition> = { ...chart.planets };

  const planetKeys = Object.keys(chart.planets) as Planet[];

  for (const p of planetKeys) {
    const natalPos = chart.planets[p];
    if (!natalPos) continue;

    const isAsc = p === 'Ascendant';
    const vargaSignIdx = isAsc ? lagnaVargaSignIdx : calcVargaSignIdx(natalPos.longitude, division);
    const vSign = signName(vargaSignIdx);
    const vHouse = isAsc ? 1 : ((vargaSignIdx - lagnaVargaSignIdx + 12) % 12) + 1;
    const vDeg = isAsc ? lagnaVargaDeg : degInVargaSign(natalPos.longitude, division);
    const vDegStr = formatVargaDegree(vDeg);

    let vDignity: Dignity = natalPos.dignity;
    if (!isAsc && p !== 'Rahu' && p !== 'Ketu') {
      vDignity = computeDignity(p as BodyPlanet, vSign, vDeg);
    }

    const analysis = chart.planetAnalysis?.[p];

    const divPlanet: DivisionalPlanet = {
      planet: p,
      natalSign: natalPos.sign,
      natalSignIndex: natalPos.signIndex,
      natalLongitude: natalPos.longitude,
      natalDegreeInSign: natalPos.degreeInSign,
      natalHouse: natalPos.house,
      vargaSign: vSign,
      vargaSignIndex: vargaSignIdx,
      vargaHouse: vHouse,
      vargaDegreeInSign: vDeg,
      vargaDegreeFormatted: vDegStr,
      isRetrograde: natalPos.isRetrograde,
      isCombust: natalPos.isCombust,
      dignity: vDignity,
      nakshatraName: natalPos.nakshatra?.name,
      nakshatraPada: natalPos.nakshatraPosition?.pada,
      strengthLevel: analysis?.strengthLevel,
    };

    planetsMap[p] = divPlanet;

    // Create synthetic PlanetPosition for chart renderer
    syntheticPlanets[p] = {
      ...natalPos,
      sign: vSign,
      signIndex: vargaSignIdx,
      house: vHouse,
      degreeInSign: vDeg,
      dmsString: vDegStr,
      dignity: vDignity,
    };
  }

  // 3. Build synthetic Houses array for chart renderer
  const divisionalHouses: DivisionalHouse[] = [];
  const syntheticHouses: House[] = [];

  for (let i = 0; i < 12; i++) {
    const houseNum = i + 1;
    const hSignIdx = (lagnaVargaSignIdx + i) % 12;
    const hRashi = RASHIS[hSignIdx];
    const hMeta = HOUSE_METADATA[i] ?? { sanskritName: '', significance: '' };

    const planetsInHouse = (Object.keys(planetsMap) as Planet[])
      .filter(p => p !== 'Ascendant' && planetsMap[p].vargaHouse === houseNum);

    divisionalHouses.push({
      number: houseNum,
      sign: hRashi.name,
      signIndex: hSignIdx,
      lord: hRashi.lord,
      planets: planetsInHouse,
    });

    syntheticHouses.push({
      number: houseNum,
      sign: hRashi.name,
      signIndex: hSignIdx,
      lord: hRashi.lord,
      cuspLongitude: hSignIdx * 30,
      planets: planetsInHouse,
      sanskritName: hMeta.sanskritName,
      significance: hMeta.significance,
      isKendra: [1, 4, 7, 10].includes(houseNum),
      isTrikona: [1, 5, 9].includes(houseNum),
      isDusthana: [6, 8, 12].includes(houseNum),
      isUpachaya: [3, 6, 10, 11].includes(houseNum),
    });
  }

  // 4. Create synthetic KundaliChart
  const syntheticChart: KundaliChart = {
    ...chart,
    ascendant: syntheticPlanets['Ascendant'] ?? {
      ...chart.ascendant,
      sign: lagnaSign,
      signIndex: lagnaVargaSignIdx,
      house: 1,
      degreeInSign: lagnaVargaDeg,
      dmsString: lagnaDegreeFormatted,
    },
    planets: syntheticPlanets,
    houses: syntheticHouses,
  };

  return {
    division,
    code: meta.code,
    name: meta.name,
    sanskritName: meta.sanskritName,
    area: meta.area,
    description: meta.description,
    rule: meta.rule,
    lagnaSign,
    lagnaSignIndex: lagnaVargaSignIdx,
    lagnaDegreeFormatted,
    planets: planetsMap,
    houses: divisionalHouses,
    syntheticChart,
  };
}

// ─── Deterministic Self-Tests ─────────────────────────────────────────────────

export interface VargaTest {
  label: string;
  lon: number;
  division: VargaDivision;
  expectedSignIdx: number; // 0-based
}

/** Known test vectors for verification */
export const VARGA_TESTS: VargaTest[] = [
  // D1: 15° Aries (lon=15) → Aries (0)
  { label: 'D1 Aries 15°', lon: 15, division: 1, expectedSignIdx: 0 },
  // D1: boundary — 30° exactly → Taurus (1)
  { label: 'D1 Taurus boundary 30°', lon: 30, division: 1, expectedSignIdx: 1 },
  // D1: 0° → Aries (0)
  { label: 'D1 Aries 0°', lon: 0, division: 1, expectedSignIdx: 0 },
  // D1: 359.999° → Pisces (11)
  { label: 'D1 Pisces end', lon: 359.999, division: 1, expectedSignIdx: 11 },

  // D9: Aries 3°20' boundary
  // 3°19' → Aries part 0 → Aries (0)
  { label: 'D9 Aries 3°19\'', lon: 3.316, division: 9, expectedSignIdx: 0 },
  // 3°21' → Aries part 1 → Taurus (1)
  { label: 'D9 Aries 3°21\'', lon: 3.35, division: 9, expectedSignIdx: 1 },
  // Taurus 0° → Earth sign → Capricorn (9)
  { label: 'D9 Taurus 0°', lon: 30, division: 9, expectedSignIdx: 9 },
  // Cancer 0° (Water) → Cancer (3)
  { label: 'D9 Cancer 0°', lon: 90, division: 9, expectedSignIdx: 3 },
  // Libra 0° (Air) → Libra (6)
  { label: 'D9 Libra 0°', lon: 180, division: 9, expectedSignIdx: 6 },

  // D3: Aries 0° → Aries (0)
  { label: 'D3 Aries 0°', lon: 0, division: 3, expectedSignIdx: 0 },
  // Aries 10° → Leo (4)
  { label: 'D3 Aries 10°', lon: 10, division: 3, expectedSignIdx: 4 },
  // Aries 20° → Sagittarius (8)
  { label: 'D3 Aries 20°', lon: 20, division: 3, expectedSignIdx: 8 },

  // D8: Movable (Aries) from Aries (0)
  { label: 'D8 Aries 0°', lon: 0, division: 8, expectedSignIdx: 0 },
  // Fixed (Taurus) from Sagittarius (8)
  { label: 'D8 Taurus 0°', lon: 30, division: 8, expectedSignIdx: 8 },
  // Dual (Gemini) from Leo (4)
  { label: 'D8 Gemini 0°', lon: 60, division: 8, expectedSignIdx: 4 },

  // D12: Aries 0° → Aries (0)
  { label: 'D12 Aries 0°', lon: 0, division: 12, expectedSignIdx: 0 },
  // Aries 2°30' → Taurus (1)
  { label: 'D12 Aries 2°30\'', lon: 2.5, division: 12, expectedSignIdx: 1 },
  // Taurus 0° → Taurus (1)
  { label: 'D12 Taurus 0°', lon: 30, division: 12, expectedSignIdx: 1 },
];

/** Run tests and return failures (empty array = all pass) */
export function runVargaTests(): { test: VargaTest; got: number }[] {
  return VARGA_TESTS
    .map(t => ({ test: t, got: calcVargaSignIdx(t.lon, t.division) }))
    .filter(r => r.got !== r.test.expectedSignIdx);
}
