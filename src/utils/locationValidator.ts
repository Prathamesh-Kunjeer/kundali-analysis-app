// ============================================================
//  LOCATION & DATA VALIDATOR UTILITY
//  Provides lightweight data integrity checks, detects
//  coordinate/city mismatches, and remediates stale profiles.
// ============================================================

import { CITIES, type CityData } from '../data/cities';
import type { BirthData, KundaliChart } from '../core/models';
import type { Profile } from './profiles';

/**
 * Calculates Great-Circle distance between two coordinates in kilometers using Haversine formula.
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Normalizes city string for fuzzy comparison.
 * e.g. "Bengaluru (Bangalore)" -> "bengaluru"
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Matches a user-entered city against our verified CITIES database.
 */
export function findMatchingReferenceCity(cityName: string, country?: string): CityData | null {
  if (!cityName || cityName.trim().length === 0) return null;
  const normTarget = normalizeName(cityName);
  if (!normTarget) return null;

  // 1. Exact or primary token match
  for (const c of CITIES) {
    const normCity = normalizeName(c.name);
    if (normCity === normTarget) {
      if (!country || !c.country || c.country.toLowerCase() === country.toLowerCase()) {
        return c;
      }
    }
  }

  // 2. Contains match (e.g. "New Delhi" matches "Delhi", or "Bangalore" matches "Bengaluru (Bangalore)")
  for (const c of CITIES) {
    const normCity = normalizeName(c.name);
    const rawLower = c.name.toLowerCase();
    const targetLower = cityName.toLowerCase();
    if (
      normCity.includes(normTarget) ||
      normTarget.includes(normCity) ||
      rawLower.includes(targetLower) ||
      targetLower.includes(rawLower)
    ) {
      if (!country || !c.country || c.country.toLowerCase() === country.toLowerCase()) {
        return c;
      }
    }
  }

  return null;
}

/**
 * Finds the closest city in CITIES to the given coordinates.
 */
export function findNearestReferenceCity(lat: number, lon: number): { city: CityData; distanceKm: number } | null {
  let closest: CityData | null = null;
  let minDistance = Infinity;

  for (const c of CITIES) {
    const dist = getDistanceKm(lat, lon, c.latitude, c.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }

  return closest ? { city: closest, distanceKm: minDistance } : null;
}

export interface LocationValidationResult {
  isValid: boolean;
  isMismatch: boolean;
  distanceKm?: number;
  reason?: string;
  expectedCity?: CityData;
  detectedCityFromCoords?: CityData;
  canAutoRemediate: boolean;
  remediatedBirth?: BirthData;
}

/**
 * Validates whether a profile's city, state, coordinates, and timezone are mutually consistent.
 * Detects stale coordinate retention (e.g. New Delhi with Pune coordinates).
 */
export function validateProfileLocation(birth: BirthData): LocationValidationResult {
  const { latitude: lat, longitude: lon, timezone: tz, cityName, country } = birth;

  // Basic numeric range checks
  if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180 || isNaN(tz) || tz < -12 || tz > 14) {
    return {
      isValid: false,
      isMismatch: true,
      reason: 'Latitude, longitude, or timezone values are outside valid numerical boundaries.',
      canAutoRemediate: false,
    };
  }

  const matchedRef = findMatchingReferenceCity(cityName, country);

  if (matchedRef) {
    const dist = getDistanceKm(lat, lon, matchedRef.latitude, matchedRef.longitude);

    // If coordinates are within 80km of the matched reference city, it's considered valid
    if (dist <= 80) {
      return {
        isValid: true,
        isMismatch: false,
        distanceKm: dist,
        expectedCity: matchedRef,
        canAutoRemediate: false,
      };
    }

    // Distance exceeds threshold: This is a confirmed mismatch!
    const nearest = findNearestReferenceCity(lat, lon);
    const detectedFromCoords = nearest && nearest.distanceKm <= 50 ? nearest.city : undefined;

    const detectedInfo = detectedFromCoords
      ? ` (Coordinates actually point to ${detectedFromCoords.name}, ${detectedFromCoords.state || detectedFromCoords.country})`
      : '';

    const reason = `Stored coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°) are ${dist} km away from ${matchedRef.name}, ${matchedRef.country}.${detectedInfo}`;

    const remediatedBirth: BirthData = {
      ...birth,
      cityName: matchedRef.name,
      state: matchedRef.state || birth.state,
      country: matchedRef.country,
      latitude: matchedRef.latitude,
      longitude: matchedRef.longitude,
      timezone: matchedRef.timezone,
      tzName: matchedRef.timezone === 5.5 && matchedRef.country === 'India' ? 'Asia/Kolkata' : birth.tzName,
    };

    return {
      isValid: false,
      isMismatch: true,
      distanceKm: dist,
      reason,
      expectedCity: matchedRef,
      detectedCityFromCoords: detectedFromCoords,
      canAutoRemediate: true,
      remediatedBirth,
    };
  }

  // City not in reference list: check regional boundary sanity
  if (country && country.toLowerCase() === 'india') {
    // India bounding box roughly: Lat 6° to 37.5°, Lon 68° to 97.5°
    if (lat < 6 || lat > 37.5 || lon < 68 || lon > 97.5 || tz !== 5.5) {
      return {
        isValid: false,
        isMismatch: true,
        reason: 'Coordinates or timezone do not fall within India geographical boundaries (UTC+5:30).',
        canAutoRemediate: false,
      };
    }
  }

  return {
    isValid: true,
    isMismatch: false,
    canAutoRemediate: false,
  };
}

/**
 * Audits a single saved profile and safely remediates obvious location mismatches.
 */
export function auditAndRemediateProfile(profile: Profile): {
  profile: Profile;
  wasRemediated: boolean;
  reason?: string;
} {
  const val = validateProfileLocation(profile.birth);

  if (val.isMismatch) {
    if (val.canAutoRemediate && val.remediatedBirth) {
      return {
        profile: {
          ...profile,
          birth: val.remediatedBirth,
          updatedAt: new Date().toISOString(),
          locationNeedsVerification: false,
        },
        wasRemediated: true,
        reason: val.reason,
      };
    }

    // Mark as needing verification if unsafe to auto-correct
    return {
      profile: {
        ...profile,
        locationNeedsVerification: true,
      },
      wasRemediated: false,
      reason: val.reason,
    };
  }

  if (profile.locationNeedsVerification) {
    return {
      profile: {
        ...profile,
        locationNeedsVerification: false,
      },
      wasRemediated: true,
    };
  }

  return {
    profile,
    wasRemediated: false,
  };
}

/**
 * Validates birth data fields for required formatting and values.
 */
export function validateBirthData(birth: Partial<BirthData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!birth.name || birth.name.trim().length === 0) errors.push('Name is required');
  if (!birth.dob || !/^\d{4}-\d{2}-\d{2}$/.test(birth.dob)) errors.push('Date of birth must be YYYY-MM-DD');
  if (!birth.tob || !/^\d{2}:\d{2}$/.test(birth.tob)) errors.push('Time of birth must be HH:MM');
  if (birth.latitude === undefined || isNaN(birth.latitude) || birth.latitude < -90 || birth.latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }
  if (birth.longitude === undefined || isNaN(birth.longitude) || birth.longitude < -180 || birth.longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }
  if (birth.timezone === undefined || isNaN(birth.timezone) || birth.timezone < -12 || birth.timezone > 14) {
    errors.push('Timezone must be between -12 and +14');
  }
  return { isValid: errors.length === 0, errors };
}

/**
 * Validates that displayed Kundali chart values map accurately to the underlying calculation engine.
 */
export function validateDisplayedChartData(chart: KundaliChart): { isValid: boolean; discrepancies: string[] } {
  const discrepancies: string[] = [];

  if (chart.lagnaSign !== chart.ascendant.sign) {
    discrepancies.push(`Lagna sign mismatch: chart.lagnaSign (${chart.lagnaSign}) !== chart.ascendant.sign (${chart.ascendant.sign})`);
  }
  if (chart.moonSign !== chart.planets.Moon.sign) {
    discrepancies.push(`Moon sign mismatch: chart.moonSign (${chart.moonSign}) !== chart.planets.Moon.sign (${chart.planets.Moon.sign})`);
  }
  if (chart.sunSign !== chart.planets.Sun.sign) {
    discrepancies.push(`Sun sign mismatch: chart.sunSign (${chart.sunSign}) !== chart.planets.Sun.sign (${chart.planets.Sun.sign})`);
  }
  if (chart.janmaNakshatra.name !== chart.planets.Moon.nakshatra.name) {
    discrepancies.push(`Janma Nakshatra mismatch: ${chart.janmaNakshatra.name} !== ${chart.planets.Moon.nakshatra.name}`);
  }
  if (chart.janmaNakshatraPada !== chart.planets.Moon.nakshatraPosition.pada) {
    discrepancies.push(`Janma Nakshatra Pada mismatch: ${chart.janmaNakshatraPada} !== ${chart.planets.Moon.nakshatraPosition.pada}`);
  }

  return {
    isValid: discrepancies.length === 0,
    discrepancies,
  };
}
