// ============================================================
//  MASTER CALCULATOR — Orchestrates all engines → KundaliChart
//  Layer 2 (pure astrological rules, no UI)
// ============================================================

import { computeRawPositions } from './astronomy';
import { resolveNakshatra, resolveNavamshaSign } from './nakshatras';
import {
  signFromLongitude, signIndexFromLongitude, degreeInSign,
  formatDMS, computeDignity, computeRahuKetuDignity, computeAvastha, checkCombust
} from './dignities';
import { buildHouses, planetHouseFromLagna } from './houses';
import { computeAspects, DEFAULT_ASPECT_CONFIG } from './aspects';
import { detectAllYogas } from './yogaRules';
import { detectAllDoshas } from './doshaRules';
import { calculateVimshottariDasha } from './dasha';
import { buildPlanetAnalysis } from './planetAnalysis';
import { RASHIS, PLANET_LABELS, NAKSHATRAS, TITHI_NAMES, YOGA_NAMES, KARANA_NAMES, VAAR_LORDS } from './constants';
import { normalizeDegrees } from './astronomy';

import type {
  KundaliChart, BirthData, PlanetPosition, Planet, BodyPlanet,
  ChartContext, House, Sign, AspectRelation, PlanetAnalysis
} from './models';

// ─── Panchang ─────────────────────────────────────────────────────────────────

function computePanchang(jd: number, moonLon: number, sunLon: number, ayanamsha: number, timezone: number) {
  // Tithi: each tithi = 12° of Moon-Sun separation
  const moonSunDiff = normalizeDegrees(moonLon - sunLon);
  const tithiNumber = Math.floor(moonSunDiff / 12) + 1; // 1-30
  const paksha: 'Shukla' | 'Krishna' = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const tithiIndex = ((tithiNumber - 1) % 15); // 0-14
  const tithiName = tithiNumber === 15 ? 'Purnima' : tithiNumber === 30 ? 'Amavasya' : TITHI_NAMES[tithiIndex];

  // Nakshatra of Moon
  const moonNakshatraPos = resolveNakshatra(moonLon);

  // Yoga: each yoga = 13°20' of Sun+Moon longitude sum
  const yogaLon = normalizeDegrees(sunLon + moonLon);
  const yogaNumber = Math.floor(yogaLon / (360 / 27)) + 1; // 1-27
  const yogaName = YOGA_NAMES[yogaNumber - 1];
  const AUSPICIOUS_YOGAS = new Set([2, 3, 4, 5, 9, 11, 12, 16, 21, 22, 23, 24, 25, 26]);

  // Karana: half-tithi
  const karanaNumber = Math.floor((moonSunDiff / 6) % 60) + 1;
  const karanaIndex = (karanaNumber - 1) % 11;
  const karanaName = KARANA_NAMES[karanaIndex];

  // Vaar: day of week from JD
  const dayOfWeek = Math.floor(jd + 1.5) % 7; // 0=Sunday
  const VAAR_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const vaarLord = VAAR_LORDS[dayOfWeek];

  // Rahu Kaal (simplified — 1.5h window varies by day)
  const RAHU_KAAL_START = [7.5, 12, 7.5, 12, 10.5, 10.5, 9]; // hours from sunrise (approx 6am)
  const rahuStart = 6 + RAHU_KAAL_START[dayOfWeek];
  const rahuEnd = rahuStart + 1.5;
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0') + ':' + String(Math.floor((n % 1) * 60)).padStart(2, '0');
  const rahuKaal = `${pad(rahuStart)} – ${pad(rahuEnd)}`;

  // Abhijit Muhurat: ~24 minutes around solar noon
  const abhijitMuhurat = '11:36 – 12:24 (approx)';

  return {
    tithi: { name: tithiName, paksha, number: tithiNumber },
    nakshatra: moonNakshatraPos,
    yoga: { name: yogaName, number: yogaNumber, isAuspicious: AUSPICIOUS_YOGAS.has(yogaNumber) },
    karana: { name: karanaName, number: karanaNumber },
    vaar: { name: VAAR_NAMES[dayOfWeek], lord: vaarLord },
    ayanamsha: ayanamsha,
    rahuKaal,
    abhijitMuhurat,
  };
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export function calculateKundali(birth: BirthData): KundaliChart {
  // Parse birth date/time
  const [bYear, bMonth, bDay] = birth.dob.split('-').map(Number);
  const [bHour, bMin] = birth.tob.split(':').map(Number);

  // Layer 1: Raw astronomical positions
  const raw = computeRawPositions(
    bYear, bMonth, bDay, bHour, bMin,
    birth.latitude, birth.longitude, birth.timezone
  );

  const { jd, ayanamsha } = raw;

  // Sun longitude (sidereal) for combustion checks
  const sunSidLon = raw.positions.Sun.siderealLon;

  // ─── Resolve all PlanetPositions ────────────────────────────────────────────

  const allPlanets: Planet[] = [
    'Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  // First pass: compute house from lagna for each planet
  const lagnaLon = raw.positions.Ascendant.siderealLon;
  const lagnaSignIdx = signIndexFromLongitude(lagnaLon);

  const planetHouseMap: Record<Planet, number> = {} as Record<Planet, number>;
  for (const p of allPlanets) {
    const lon = raw.positions[p].siderealLon;
    planetHouseMap[p] = p === 'Ascendant' ? 1 : planetHouseFromLagna(lagnaLon, lon);
  }

  // Second pass: build full PlanetPosition objects
  const positions: Record<Planet, PlanetPosition> = {} as Record<Planet, PlanetPosition>;

  for (const p of allPlanets) {
    const raw_p = raw.positions[p];
    const lon = raw_p.siderealLon;
    const sigIdx = signIndexFromLongitude(lon);
    const sign = RASHIS[sigIdx].name;
    const degInSgn = degreeInSign(lon);
    const nakPos = resolveNakshatra(lon);
    const isRetro = raw_p.isRetrograde;

    // Combustion check (not for Sun, Ascendant, Rahu, Ketu)
    const isCombust = (p !== 'Ascendant' && p !== 'Sun' && p !== 'Rahu' && p !== 'Ketu')
      ? checkCombust(p as BodyPlanet, lon, sunSidLon, isRetro)
      : false;

    // Dignity
    let dignity = computeDignity(p as BodyPlanet, sign as Sign, degInSgn);
    if (p === 'Rahu' || p === 'Ketu') {
      dignity = computeRahuKetuDignity(p as 'Rahu' | 'Ketu', sign as Sign);
    }
    if (p === 'Ascendant') dignity = 'Neutral' as any;

    // Avastha
    const avastha = computeAvastha(degInSgn, isRetro);

    positions[p] = {
      planet: p,
      longitude: lon,
      degreeInSign: degInSgn,
      sign: sign as Sign,
      signIndex: sigIdx,
      house: planetHouseMap[p],
      nakshatra: nakPos.nakshatra,
      nakshatraPosition: nakPos,
      speed: raw_p.speed,
      isRetrograde: isRetro,
      isCombust,
      dignity,
      avastha,
      dmsString: formatDMS(degInSgn),
    };
  }

  // ─── Build 12 Houses ─────────────────────────────────────────────────────────

  const houses = buildHouses(lagnaLon, planetHouseMap);

  // ─── Compute Aspects ─────────────────────────────────────────────────────────

  const aspects = computeAspects(planetHouseMap, DEFAULT_ASPECT_CONFIG);

  // ─── Build ChartContext for rule evaluators ───────────────────────────────────

  const ctx: ChartContext = {
    birthData: birth,
    ayanamsha,
    ascendant: positions.Ascendant,
    planets: positions,
    houses,
    aspects,
    getPlanet: (p) => positions[p],
    getHouse: (n) => houses[n - 1],
    houseLord: (n) => houses[n - 1].lord,
    planetHouse: (p) => positions[p].house,
    isKendra: (h) => [1, 4, 7, 10].includes(h),
    isTrikona: (h) => [1, 5, 9].includes(h),
    isDusthana: (h) => [6, 8, 12].includes(h),
  };

  // ─── Yoga & Dosha Detection ───────────────────────────────────────────────────

  const yogas = detectAllYogas(ctx);
  const doshas = detectAllDoshas(ctx);

  // ─── Dasha Calculation ────────────────────────────────────────────────────────

  const birthDate = new Date(Date.UTC(bYear, bMonth - 1, bDay, bHour, bMin));
  const dasha = calculateVimshottariDasha(positions.Moon.longitude, birthDate);

  // ─── Planet Analysis ──────────────────────────────────────────────────────────

  // Compute D9 (Navamsha) sign indices for Vargottama check
  const d9SignIndices: Partial<Record<Planet, number>> = {};
  for (const p of allPlanets) {
    d9SignIndices[p] = resolveNavamshaSign(raw.positions[p].siderealLon);
  }

  const planetAnalysis: Record<Planet, PlanetAnalysis> = {} as Record<Planet, PlanetAnalysis>;
  for (const p of allPlanets) {
    const analysis = buildPlanetAnalysis(p, positions[p], ctx, lagnaSignIdx, RASHIS[lagnaSignIdx].name);
    // Vargottama check
    analysis.isVargottama = d9SignIndices[p] === positions[p].signIndex;
    planetAnalysis[p] = analysis;
  }

  // ─── Panchang ─────────────────────────────────────────────────────────────────

  const panchang = computePanchang(jd, positions.Moon.longitude, positions.Sun.longitude, ayanamsha, birth.timezone);

  // ─── Convenience Fields ───────────────────────────────────────────────────────

  const lagnaSign = positions.Ascendant.sign;
  const lagnaLord = RASHIS[lagnaSignIdx].lord;
  const moonSign = positions.Moon.sign;
  const sunSign = positions.Sun.sign;
  const janmaNakshatra = positions.Moon.nakshatra;
  const janmaNakshatraPada = positions.Moon.nakshatraPosition.pada;

  return {
    birthData: birth,
    calculatedAt: new Date(),
    ayanamsha,
    ascendant: positions.Ascendant,
    planets: positions,
    houses,
    aspects,
    planetAnalysis,
    yogas,
    doshas,
    dasha,
    panchang,
    lagnaSign,
    lagnaLord,
    moonSign,
    sunSign,
    janmaNakshatra,
    janmaNakshatraPada,
  };
}

// ─── Current Sky (Live Transit Positions) ─────────────────────────────────────

export interface TransitPosition {
  planet: Planet;
  longitude: number;
  degreeInSign: number;
  sign: Sign;
  house?: number; // relative to birth chart lagna (optional)
  nakshatra: import('./models').Nakshatra;
  nakshatraPosition: import('./models').NakshatraPosition;
  speed: number;
  isRetrograde: boolean;
  dmsString: string;
  dignity: import('./models').Dignity;
}

/**
 * Calculates current positions of all 9 planets using right now as the time.
 * Optional birthChart: if provided, house is computed relative to birth lagna.
 */
export function calculateCurrentSky(
  lat = 28.6139, lon = 77.2090, tz = 5.5,
  birthChart?: KundaliChart
): { positions: Record<string, TransitPosition>; calculatedAt: Date; ayanamsha: number } {
  const now = new Date();
  const raw = computeRawPositions(
    now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(),
    lat, lon, tz
  );

  const { ayanamsha } = raw;
  const sunSidLon = raw.positions.Sun.siderealLon;
  const lagnaLon = birthChart ? birthChart.ascendant.longitude : raw.positions.Ascendant.siderealLon;

  const BODY_PLANETS: Planet[] = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  const out: Record<string, TransitPosition> = {};

  for (const p of BODY_PLANETS) {
    const rp = raw.positions[p];
    const sidLon = rp.siderealLon;
    const sigIdx = signIndexFromLongitude(sidLon);
    const sign = RASHIS[sigIdx].name;
    const degInSgn = degreeInSign(sidLon);
    const nakPos = resolveNakshatra(sidLon);
    const isRetro = rp.isRetrograde;
    const isCombust = (p !== 'Sun' && p !== 'Rahu' && p !== 'Ketu')
      ? checkCombust(p as BodyPlanet, sidLon, sunSidLon, isRetro)
      : false;
    let dignity = computeDignity(p as BodyPlanet, sign as Sign, degInSgn);
    if (p === 'Rahu' || p === 'Ketu') dignity = computeRahuKetuDignity(p as 'Rahu' | 'Ketu', sign as Sign);

    out[p] = {
      planet: p,
      longitude: sidLon,
      degreeInSign: degInSgn,
      sign: sign as Sign,
      house: birthChart ? planetHouseFromLagna(lagnaLon, sidLon) : undefined,
      nakshatra: nakPos.nakshatra,
      nakshatraPosition: nakPos,
      speed: rp.speed,
      isRetrograde: isRetro,
      dmsString: formatDMS(degInSgn),
      dignity,
    };
  }

  return { positions: out, calculatedAt: now, ayanamsha };
}

