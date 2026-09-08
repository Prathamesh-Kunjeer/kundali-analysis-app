import { PlanetName } from '../types/astrology';

// Standard conversion helpers
export const degToRad = (deg: number): number => (deg * Math.PI) / 180.0;
export const radToDeg = (rad: number): number => (rad * 180.0) / Math.PI;

export const normalizeDegrees = (deg: number): number => {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
};

/**
 * Calculates Julian Day Number from Gregorian Date, Time and UTC offset
 */
export function calculateJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezoneOffsetHours: number
): number {
  // Convert local time to UTC decimal hours
  const localDecimalHour = hour + minute / 60.0;
  const utcDecimalHour = localDecimalHour - timezoneOffsetHours;

  let y = year;
  let m = month;
  let d = day + utcDecimalHour / 24.0;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd = Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d + b - 1524.5;

  return jd;
}

/**
 * Calculates Lahiri (Chitra Paksha) Ayanamsha for a given Julian Day
 */
export function calculateLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Standard Lahiri Ayanamsha: 23° 51' 25.53" at J2000.0 (23.85709167°)
  const ayanamsha = 23.85709167 + (50.290966 / 3600.0) * 100.0 * T + 0.0003086 * T * T;
  return normalizeDegrees(ayanamsha);
}

/**
 * Calculates Obliquity of the Ecliptic (True/Mean Obliquity)
 */
export function calculateObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // IAU formula
  const eps0 = 23.43929111 - (46.8150 / 3600.0) * T - (0.00059 / 3600.0) * T * T + (0.001813 / 3600.0) * T * T * T;
  return eps0;
}

/**
 * Calculates Greenwich Mean Sidereal Time (GMST) in degrees
 */
export function calculateGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  return normalizeDegrees(gmst);
}

/**
 * Calculates Local Sidereal Time (LST) in degrees
 */
export function calculateLST(jd: number, longitude: number): number {
  const gmst = calculateGMST(jd);
  return normalizeDegrees(gmst + longitude);
}

/**
 * Calculates Sidereal Ascendant (Lagna) in degrees
 */
export function calculateAscendant(
  jd: number,
  latitude: number,
  longitude: number,
  ayanamsha: number
): { tropical: number; sidereal: number } {
  const lst = calculateLST(jd, longitude);
  const eps = calculateObliquity(jd);

  const lstRad = degToRad(lst);
  const epsRad = degToRad(eps);
  const latRad = degToRad(latitude);

  const sinLST = Math.sin(lstRad);
  const cosLST = Math.cos(lstRad);
  const sinEps = Math.sin(epsRad);
  const cosEps = Math.cos(epsRad);
  const tanLat = Math.tan(latRad);

  // Tan(Asc) = -cos(RAMC) / (sin(RAMC)*cos(eps) + tan(lat)*sin(eps))
  const y = cosLST;
  const x = -(sinLST * cosEps + tanLat * sinEps);

  let ascTropical = radToDeg(Math.atan2(y, x));
  ascTropical = normalizeDegrees(ascTropical);

  const ascSidereal = normalizeDegrees(ascTropical - ayanamsha);

  return {
    tropical: ascTropical,
    sidereal: ascSidereal
  };
}

/**
 * Computes Geocentric Tropical Longitude and Speed for Sun
 */
function computeSun(T: number): { lon: number; speed: number } {
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  const MRad = degToRad(M);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(MRad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * MRad) +
    0.000289 * Math.sin(3 * MRad);

  const sunTrueLon = normalizeDegrees(L0 + C);
  const speed = 0.9856 + 0.033 * Math.cos(MRad); // approx deg/day

  return { lon: sunTrueLon, speed };
}

/**
 * Computes Geocentric Tropical Longitude and Speed for Moon
 */
function computeMoon(T: number): { lon: number; speed: number } {
  // Mean orbital elements
  const Lprime = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + (T * T * T) / 538841.0;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868.0; // Elongation
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T; // Sun's anomaly
  const Mprime = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699.0; // Moon's anomaly
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000.0; // Arg of latitude

  const DRad = degToRad(D);
  const MRad = degToRad(M);
  const MpRad = degToRad(Mprime);
  const FRad = degToRad(F);

  // Main lunar periodic perturbations
  let deltaL = 6.288774 * Math.sin(MpRad)
    + 1.274027 * Math.sin(2 * DRad - MpRad) // Evection
    + 0.658314 * Math.sin(2 * DRad) // Variation
    + 0.213618 * Math.sin(2 * MpRad)
    - 0.185116 * Math.sin(MRad) // Annual equation
    - 0.114332 * Math.sin(2 * FRad)
    + 0.058793 * Math.sin(2 * DRad - 2 * MpRad)
    + 0.057066 * Math.sin(2 * DRad - MRad - MpRad)
    + 0.053322 * Math.sin(2 * DRad + MpRad)
    + 0.046100 * Math.sin(2 * DRad - MRad)
    - 0.034728 * Math.sin(DRad)
    - 0.030465 * Math.sin(MRad + MpRad)
    + 0.015327 * Math.sin(2 * DRad - 2 * FRad)
    - 0.012528 * Math.sin(2 * FRad + MpRad)
    - 0.010980 * Math.sin(2 * FRad - MpRad);

  const moonLon = normalizeDegrees(Lprime + deltaL);
  const speed = 13.176 + 1.4 * Math.cos(MpRad); // deg/day approx

  return { lon: moonLon, speed };
}

/**
 * Computes Geocentric Tropical Longitude and Speed for Rahu (Mean Lunar Node) & Ketu
 */
function computeRahuKetu(T: number): { rahuLon: number; ketuLon: number; speed: number } {
  // Mean longitude of ascending node
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0;
  const rahuLon = normalizeDegrees(omega);
  const ketuLon = normalizeDegrees(rahuLon + 180.0);
  const speed = -0.05295; // Mean motion is retrograde ~3.18 arcmin/day

  return { rahuLon, ketuLon, speed };
}

// Keplerian orbital elements for planets
interface OrbitalElements {
  a0: number; aDot: number;
  e0: number; eDot: number;
  i0: number; iDot: number;
  l0: number; lDot: number;
  w0: number; wDot: number;
  node0: number; nodeDot: number;
}

const PLANET_ELEMENTS: Record<string, OrbitalElements> = {
  Mercury: {
    a0: 0.38709927, aDot: 0.00000037,
    e0: 0.20563593, eDot: 0.00001906,
    i0: 7.00497902, iDot: -0.00594749,
    l0: 252.25032350, lDot: 149472.67411175,
    w0: 77.45779628, wDot: 0.16047689,
    node0: 48.33076593, nodeDot: -0.12534081
  },
  Venus: {
    a0: 0.72333566, aDot: 0.00000390,
    e0: 0.00677672, eDot: -0.00004107,
    i0: 3.39467605, iDot: -0.00078890,
    l0: 181.97909950, lDot: 58517.81538729,
    w0: 131.60246718, wDot: 0.00268329,
    node0: 76.67984255, nodeDot: -0.27769418
  },
  Mars: {
    a0: 1.52371034, aDot: 0.00001847,
    e0: 0.09339410, eDot: 0.00007882,
    i0: 1.84969142, iDot: -0.00813131,
    l0: -4.55343205, lDot: 19140.30268499,
    w0: -23.94362959, wDot: 0.44441088,
    node0: 49.55953891, nodeDot: -0.29257343
  },
  Jupiter: {
    a0: 5.20288700, aDot: -0.00011607,
    e0: 0.04838624, eDot: -0.00013253,
    i0: 1.30439695, iDot: -0.00155701,
    l0: 34.39644051, lDot: 3034.74612775,
    w0: 14.72847983, wDot: 0.21252668,
    node0: 100.47390909, nodeDot: 0.20469106
  },
  Saturn: {
    a0: 9.53667594, aDot: -0.00125060,
    e0: 0.05386179, eDot: -0.00050991,
    i0: 2.48599187, iDot: 0.00193609,
    l0: 49.95424423, lDot: 1222.49362201,
    w0: 92.59887831, wDot: -0.41897216,
    node0: 113.66242448, nodeDot: -0.28867794
  }
};

/**
 * Solves Kepler's Equation M = E - e*sin(E) using Newton-Raphson iteration
 */
function solveKepler(M_deg: number, e: number): number {
  const M_rad = degToRad(M_deg);
  let E = M_rad;
  for (let iter = 0; iter < 20; iter++) {
    const deltaE = (E - e * Math.sin(E) - M_rad) / (1 - e * Math.cos(E));
    E -= deltaE;
    if (Math.abs(deltaE) < 1e-9) break;
  }
  return E;
}

/**
 * Computes Heliocentric coordinates for a planet at epoch T
 */
function getHeliocentricCoords(name: string, T: number): { x: number; y: number; z: number } {
  const el = PLANET_ELEMENTS[name];
  const a = el.a0 + el.aDot * T;
  const e = el.e0 + el.eDot * T;
  const i = degToRad(el.i0 + el.iDot * T);
  const L = normalizeDegrees(el.l0 + el.lDot * T);
  const w = normalizeDegrees(el.w0 + el.wDot * T);
  const node = degToRad(el.node0 + el.nodeDot * T);

  const M = normalizeDegrees(L - w);
  const E = solveKepler(M, e);

  // Position in orbital plane
  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const omega = degToRad(w - (el.node0 + el.nodeDot * T));

  // 3D Heliocentric ecliptic coordinates
  const x = (Math.cos(omega) * Math.cos(node) - Math.sin(omega) * Math.sin(node) * Math.cos(i)) * xPrime +
    (-Math.sin(omega) * Math.cos(node) - Math.cos(omega) * Math.sin(node) * Math.cos(i)) * yPrime;
  const y = (Math.cos(omega) * Math.sin(node) + Math.sin(omega) * Math.cos(node) * Math.cos(i)) * xPrime +
    (-Math.sin(omega) * Math.sin(node) + Math.cos(omega) * Math.cos(node) * Math.cos(i)) * yPrime;
  const z = (Math.sin(omega) * Math.sin(i)) * xPrime + (Math.cos(omega) * Math.sin(i)) * yPrime;

  return { x, y, z };
}

/**
 * Computes Earth's Heliocentric coordinates at epoch T
 */
function getEarthHeliocentricCoords(T: number): { x: number; y: number; z: number } {
  const a = 1.00000261 + 0.00000562 * T;
  const e = 0.01671123 - 0.00004392 * T;
  const L = normalizeDegrees(100.46457166 + 35999.37244981 * T);
  const w = normalizeDegrees(102.93768193 + 0.32327364 * T);

  const M = normalizeDegrees(L - w);
  const E = solveKepler(M, e);

  const xPrime = a * (Math.cos(E) - e);
  const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const wRad = degToRad(w);

  const x = Math.cos(wRad) * xPrime - Math.sin(wRad) * yPrime;
  const y = Math.sin(wRad) * xPrime + Math.cos(wRad) * yPrime;
  const z = 0;

  return { x, y, z };
}

/**
 * Computes Geocentric Tropical Longitude and Daily Speed for Mars, Mercury, Jupiter, Venus, Saturn
 */
function computeMajorPlanet(name: string, T: number, jd: number): { lon: number; speed: number } {
  const pCoords = getHeliocentricCoords(name, T);
  const eCoords = getEarthHeliocentricCoords(T);

  // Geocentric coordinates: Planet - Earth
  const geoX = pCoords.x - eCoords.x;
  const geoY = pCoords.y - eCoords.y;

  let tropicalLon = radToDeg(Math.atan2(geoY, geoX));
  tropicalLon = normalizeDegrees(tropicalLon);

  // Approximate speed by small delta T (0.01 days)
  const dtDays = 0.01;
  const T_next = (jd + dtDays - 2451545.0) / 36525.0;
  const pCoordsNext = getHeliocentricCoords(name, T_next);
  const eCoordsNext = getEarthHeliocentricCoords(T_next);
  const geoXNext = pCoordsNext.x - eCoordsNext.x;
  const geoYNext = pCoordsNext.y - eCoordsNext.y;
  let tropicalLonNext = radToDeg(Math.atan2(geoYNext, geoXNext));
  tropicalLonNext = normalizeDegrees(tropicalLonNext);

  let dLon = tropicalLonNext - tropicalLon;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  const speed = dLon / dtDays;

  return { lon: tropicalLon, speed };
}

export interface RawPlanetaryPositions {
  jd: number;
  ayanamsha: number;
  planets: Record<PlanetName, {
    tropicalLon: number;
    siderealLon: number;
    speed: number;
    isRetrograde: boolean;
  }>;
}

/**
 * Main calculation entrypoint for all 9 Grahas + Ascendant
 */
export function calculateAllPlanets(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number,
  timezone: number
): RawPlanetaryPositions {
  const jd = calculateJulianDay(year, month, day, hour, minute, timezone);
  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsha = calculateLahiriAyanamsha(jd);

  const asc = calculateAscendant(jd, latitude, longitude, ayanamsha);
  const sun = computeSun(T);
  const moon = computeMoon(T);
  const rahuKetu = computeRahuKetu(T);

  const mercury = computeMajorPlanet('Mercury', T, jd);
  const venus = computeMajorPlanet('Venus', T, jd);
  const mars = computeMajorPlanet('Mars', T, jd);
  const jupiter = computeMajorPlanet('Jupiter', T, jd);
  const saturn = computeMajorPlanet('Saturn', T, jd);

  const toSidereal = (trop: number) => normalizeDegrees(trop - ayanamsha);

  const planetsRecord: Record<PlanetName, {
    tropicalLon: number;
    siderealLon: number;
    speed: number;
    isRetrograde: boolean;
  }> = {
    Ascendant: {
      tropicalLon: asc.tropical,
      siderealLon: asc.sidereal,
      speed: 360.0, // Earth rotation
      isRetrograde: false
    },
    Sun: {
      tropicalLon: sun.lon,
      siderealLon: toSidereal(sun.lon),
      speed: sun.speed,
      isRetrograde: false
    },
    Moon: {
      tropicalLon: moon.lon,
      siderealLon: toSidereal(moon.lon),
      speed: moon.speed,
      isRetrograde: false
    },
    Mars: {
      tropicalLon: mars.lon,
      siderealLon: toSidereal(mars.lon),
      speed: mars.speed,
      isRetrograde: mars.speed < 0
    },
    Mercury: {
      tropicalLon: mercury.lon,
      siderealLon: toSidereal(mercury.lon),
      speed: mercury.speed,
      isRetrograde: mercury.speed < 0
    },
    Jupiter: {
      tropicalLon: jupiter.lon,
      siderealLon: toSidereal(jupiter.lon),
      speed: jupiter.speed,
      isRetrograde: jupiter.speed < 0
    },
    Venus: {
      tropicalLon: venus.lon,
      siderealLon: toSidereal(venus.lon),
      speed: venus.speed,
      isRetrograde: venus.speed < 0
    },
    Saturn: {
      tropicalLon: saturn.lon,
      siderealLon: toSidereal(saturn.lon),
      speed: saturn.speed,
      isRetrograde: saturn.speed < 0
    },
    Rahu: {
      tropicalLon: rahuKetu.rahuLon,
      siderealLon: toSidereal(rahuKetu.rahuLon),
      speed: rahuKetu.speed,
      isRetrograde: true
    },
    Ketu: {
      tropicalLon: rahuKetu.ketuLon,
      siderealLon: toSidereal(rahuKetu.ketuLon),
      speed: rahuKetu.speed,
      isRetrograde: true
    }
  };

  return {
    jd,
    ayanamsha,
    planets: planetsRecord
  };
}
