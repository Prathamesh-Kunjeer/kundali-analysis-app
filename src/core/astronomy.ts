// ============================================================
//  ASTRONOMICAL ENGINE — Layer 1 (pure math, no astrological rules)
//  Moved to src/core/astronomy.ts
// ============================================================

import type { Planet } from './models';

export const degToRad = (deg: number): number => (deg * Math.PI) / 180.0;
export const radToDeg = (rad: number): number => (rad * 180.0) / Math.PI;

export const normalizeDegrees = (deg: number): number => {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
};

/** Julian Day Number from Gregorian date, local time and UTC offset */
export function calculateJulianDay(
  year: number, month: number, day: number,
  hour: number, minute: number, timezoneOffsetHours: number
): number {
  const utcHour = hour + minute / 60.0 - timezoneOffsetHours;
  let y = year, m = month;
  const d = day + utcHour / 24.0;
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

/** Lahiri (Chitra Paksha) Ayanamsha for a given JD */
export function calculateLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return normalizeDegrees(23.85709167 + (50.290966 / 3600.0) * 100.0 * T + 0.0003086 * T * T);
}

/** Mean Obliquity of the Ecliptic */
export function calculateObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.43929111 - (46.8150 / 3600.0) * T - (0.00059 / 3600.0) * T * T + (0.001813 / 3600.0) * T * T * T;
}

/** Greenwich Mean Sidereal Time in degrees */
export function calculateGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return normalizeDegrees(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0);
}

/** Local Sidereal Time in degrees */
export function calculateLST(jd: number, longitude: number): number {
  return normalizeDegrees(calculateGMST(jd) + longitude);
}

/** Sidereal Ascendant (Lagna) in degrees */
export function calculateAscendant(
  jd: number, latitude: number, longitude: number, ayanamsha: number
): { tropical: number; sidereal: number } {
  const lst = calculateLST(jd, longitude);
  const eps = calculateObliquity(jd);
  const lstRad = degToRad(lst), epsRad = degToRad(eps), latRad = degToRad(latitude);
  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
  const tropical = normalizeDegrees(radToDeg(Math.atan2(y, x)));
  return { tropical, sidereal: normalizeDegrees(tropical - ayanamsha) };
}

// ─── Planetary Computations ───────────────────────────────────────────────────

function computeSun(T: number): { lon: number; speed: number } {
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const MRad = degToRad(M);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(MRad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * MRad)
    + 0.000289 * Math.sin(3 * MRad);
  return { lon: normalizeDegrees(L0 + C), speed: 0.9856 + 0.033 * Math.cos(MRad) };
}

function computeMoon(T: number): { lon: number; speed: number } {
  const Lprime = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868.0;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000.0;
  const [DR, MR, MpR, FR] = [D, M, Mp, F].map(degToRad);
  const dL = 6.288774 * Math.sin(MpR)
    + 1.274027 * Math.sin(2 * DR - MpR)
    + 0.658314 * Math.sin(2 * DR)
    + 0.213618 * Math.sin(2 * MpR)
    - 0.185116 * Math.sin(MR)
    - 0.114332 * Math.sin(2 * FR)
    + 0.058793 * Math.sin(2 * DR - 2 * MpR)
    + 0.057066 * Math.sin(2 * DR - MR - MpR)
    + 0.053322 * Math.sin(2 * DR + MpR)
    + 0.046100 * Math.sin(2 * DR - MR)
    - 0.034728 * Math.sin(DR)
    - 0.030465 * Math.sin(MR + MpR)
    + 0.015327 * Math.sin(2 * DR - 2 * FR)
    - 0.012528 * Math.sin(2 * FR + MpR)
    - 0.010980 * Math.sin(2 * FR - MpR);
  return { lon: normalizeDegrees(Lprime + dL), speed: 13.176 + 1.4 * Math.cos(MpR) };
}

function computeRahuKetu(T: number): { rahuLon: number; ketuLon: number; speed: number } {
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000.0;
  const rahuLon = normalizeDegrees(omega);
  return { rahuLon, ketuLon: normalizeDegrees(rahuLon + 180.0), speed: -0.05295 };
}

interface OrbitalElements {
  a0: number; aDot: number; e0: number; eDot: number;
  i0: number; iDot: number; l0: number; lDot: number;
  w0: number; wDot: number; node0: number; nodeDot: number;
}

const PLANET_ELEMENTS: Record<string, OrbitalElements> = {
  Mercury: { a0:0.38709927, aDot:0.00000037, e0:0.20563593, eDot:0.00001906, i0:7.00497902, iDot:-0.00594749, l0:252.25032350, lDot:149472.67411175, w0:77.45779628, wDot:0.16047689, node0:48.33076593, nodeDot:-0.12534081 },
  Venus:   { a0:0.72333566, aDot:0.00000390, e0:0.00677672, eDot:-0.00004107,i0:3.39467605, iDot:-0.00078890, l0:181.97909950, lDot:58517.81538729, w0:131.60246718,wDot:0.00268329, node0:76.67984255, nodeDot:-0.27769418 },
  Mars:    { a0:1.52371034, aDot:0.00001847, e0:0.09339410, eDot:0.00007882, i0:1.84969142, iDot:-0.00813131, l0:-4.55343205, lDot:19140.30268499, w0:-23.94362959,wDot:0.44441088, node0:49.55953891, nodeDot:-0.29257343 },
  Jupiter: { a0:5.20288700, aDot:-0.00011607,e0:0.04838624, eDot:-0.00013253,i0:1.30439695, iDot:-0.00155701, l0:34.39644051, lDot:3034.74612775,  w0:14.72847983, wDot:0.21252668, node0:100.47390909,nodeDot:0.20469106  },
  Saturn:  { a0:9.53667594, aDot:-0.00125060,e0:0.05386179, eDot:-0.00050991,i0:2.48599187, iDot:0.00193609,  l0:49.95424423, lDot:1222.49362201, w0:92.59887831, wDot:-0.41897216,node0:113.66242448,nodeDot:-0.28867794 },
};

function solveKepler(M_deg: number, e: number): number {
  const M_rad = degToRad(M_deg);
  let E = M_rad;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

function heliocentricCoords(name: string, T: number): { x: number; y: number; z: number } {
  const el = PLANET_ELEMENTS[name];
  const a = el.a0 + el.aDot * T, e = el.e0 + el.eDot * T;
  const i = degToRad(el.i0 + el.iDot * T);
  const L = normalizeDegrees(el.l0 + el.lDot * T);
  const w = normalizeDegrees(el.w0 + el.wDot * T);
  const node = degToRad(el.node0 + el.nodeDot * T);
  const E = solveKepler(normalizeDegrees(L - w), e);
  const xP = a * (Math.cos(E) - e), yP = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const omega = degToRad(w - (el.node0 + el.nodeDot * T));
  return {
    x: (Math.cos(omega) * Math.cos(node) - Math.sin(omega) * Math.sin(node) * Math.cos(i)) * xP
      + (-Math.sin(omega) * Math.cos(node) - Math.cos(omega) * Math.sin(node) * Math.cos(i)) * yP,
    y: (Math.cos(omega) * Math.sin(node) + Math.sin(omega) * Math.cos(node) * Math.cos(i)) * xP
      + (-Math.sin(omega) * Math.sin(node) + Math.cos(omega) * Math.cos(node) * Math.cos(i)) * yP,
    z: (Math.sin(omega) * Math.sin(i)) * xP + (Math.cos(omega) * Math.sin(i)) * yP,
  };
}

function earthHeliocentricCoords(T: number): { x: number; y: number; z: number } {
  const a = 1.00000261 + 0.00000562 * T, e = 0.01671123 - 0.00004392 * T;
  const L = normalizeDegrees(100.46457166 + 35999.37244981 * T);
  const w = normalizeDegrees(102.93768193 + 0.32327364 * T);
  const E = solveKepler(normalizeDegrees(L - w), e);
  const xP = a * (Math.cos(E) - e), yP = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const wR = degToRad(w);
  return { x: Math.cos(wR) * xP - Math.sin(wR) * yP, y: Math.sin(wR) * xP + Math.cos(wR) * yP, z: 0 };
}

function computeMajorPlanet(name: string, T: number, jd: number): { lon: number; speed: number } {
  const p = heliocentricCoords(name, T);
  const e = earthHeliocentricCoords(T);
  const gx = p.x - e.x, gy = p.y - e.y;
  const lon = normalizeDegrees(radToDeg(Math.atan2(gy, gx)));
  const dt = 0.01;
  const T2 = (jd + dt - 2451545.0) / 36525.0;
  const p2 = heliocentricCoords(name, T2);
  const e2 = earthHeliocentricCoords(T2);
  let dLon = normalizeDegrees(radToDeg(Math.atan2(p2.y - e2.y, p2.x - e2.x))) - lon;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  return { lon, speed: dLon / dt };
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export interface RawPlanetaryData {
  jd: number;
  ayanamsha: number;
  positions: Record<Planet, { tropicalLon: number; siderealLon: number; speed: number; isRetrograde: boolean }>;
}

export function computeRawPositions(
  year: number, month: number, day: number,
  hour: number, minute: number,
  latitude: number, longitude: number, timezone: number
): RawPlanetaryData {
  const jd = calculateJulianDay(year, month, day, hour, minute, timezone);
  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsha = calculateLahiriAyanamsha(jd);
  const toSid = (trop: number) => normalizeDegrees(trop - ayanamsha);

  const asc = calculateAscendant(jd, latitude, longitude, ayanamsha);
  const sun = computeSun(T);
  const moon = computeMoon(T);
  const rk = computeRahuKetu(T);
  const mercury = computeMajorPlanet('Mercury', T, jd);
  const venus   = computeMajorPlanet('Venus',   T, jd);
  const mars    = computeMajorPlanet('Mars',    T, jd);
  const jupiter = computeMajorPlanet('Jupiter', T, jd);
  const saturn  = computeMajorPlanet('Saturn',  T, jd);

  const positions: Record<Planet, { tropicalLon: number; siderealLon: number; speed: number; isRetrograde: boolean }> = {
    Ascendant: { tropicalLon: asc.tropical, siderealLon: asc.sidereal, speed: 360, isRetrograde: false },
    Sun:       { tropicalLon: sun.lon,      siderealLon: toSid(sun.lon),      speed: sun.speed,     isRetrograde: false },
    Moon:      { tropicalLon: moon.lon,     siderealLon: toSid(moon.lon),     speed: moon.speed,    isRetrograde: false },
    Mars:      { tropicalLon: mars.lon,     siderealLon: toSid(mars.lon),     speed: mars.speed,    isRetrograde: mars.speed < 0 },
    Mercury:   { tropicalLon: mercury.lon,  siderealLon: toSid(mercury.lon),  speed: mercury.speed, isRetrograde: mercury.speed < 0 },
    Jupiter:   { tropicalLon: jupiter.lon,  siderealLon: toSid(jupiter.lon),  speed: jupiter.speed, isRetrograde: jupiter.speed < 0 },
    Venus:     { tropicalLon: venus.lon,    siderealLon: toSid(venus.lon),    speed: venus.speed,   isRetrograde: venus.speed < 0 },
    Saturn:    { tropicalLon: saturn.lon,   siderealLon: toSid(saturn.lon),   speed: saturn.speed,  isRetrograde: saturn.speed < 0 },
    Rahu:      { tropicalLon: rk.rahuLon,   siderealLon: toSid(rk.rahuLon),  speed: rk.speed,      isRetrograde: true },
    Ketu:      { tropicalLon: rk.ketuLon,   siderealLon: toSid(rk.ketuLon),  speed: rk.speed,      isRetrograde: true },
  };

  return { jd, ayanamsha, positions };
}
