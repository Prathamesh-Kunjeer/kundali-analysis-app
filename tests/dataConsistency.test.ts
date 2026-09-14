// ============================================================
//  AUTOMATED DATA CONSISTENCY & RE-MEDIATION TEST SUITE
// ============================================================

import {
  validateProfileLocation,
  auditAndRemediateProfile,
  validateBirthData,
  validateDisplayedChartData,
} from '../src/utils/locationValidator';
import { getTranslation } from '../src/translations';
import { calculateKundali } from '../src/core/calculator';
import type { BirthData } from '../src/core/models';
import type { Profile } from '../src/utils/profiles';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

console.log('=== RUNNING DATA INTEGRITY & CONSISTENCY AUDIT ===\n');

// ─── 1. Test Location Validation for Major Cities ────────────────────────────
console.log('1. Testing Location Consistency for Major Cities...');

const testCities: { name: string; lat: number; lon: number; tz: number }[] = [
  { name: 'Pune', lat: 18.5204, lon: 73.8567, tz: 5.5 },
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { name: 'Bengaluru (Bangalore)', lat: 12.9716, lon: 77.5946, tz: 5.5 },
];

for (const c of testCities) {
  const birth: BirthData = {
    name: 'Test Person',
    gender: 'male',
    dob: '1995-05-20',
    tob: '14:30',
    cityName: c.name,
    country: 'India',
    latitude: c.lat,
    longitude: c.lon,
    timezone: c.tz,
  };
  const res = validateProfileLocation(birth);
  assert(res.isValid, `Expected ${c.name} to be valid location`);
  assert(!res.isMismatch, `Expected ${c.name} to NOT be flagged as mismatch`);
  console.log(`  ✓ ${c.name} validated correctly (coords: ${c.lat}, ${c.lon})`);
}

// ─── 2. Test Mismatch Detection & Remediation (The UI Bug) ───────────────────
console.log('\n2. Testing Real-World Bug Mismatch (New Delhi with Pune coordinates)...');

const mismatchedBirth: BirthData = {
  name: 'Mismatched Profile',
  gender: 'male',
  dob: '1990-01-01',
  tob: '10:00',
  cityName: 'New Delhi',
  country: 'India',
  latitude: 18.56,  // Pune latitude!
  longitude: 73.81, // Pune longitude!
  timezone: 5.5,
};

const mismatchRes = validateProfileLocation(mismatchedBirth);
assert(mismatchRes.isMismatch, 'Expected mismatch to be detected for New Delhi with Pune coords');
assert(mismatchRes.canAutoRemediate, 'Expected auto-remediation to be available for New Delhi');
assert(mismatchRes.expectedCity?.name === 'New Delhi', 'Expected city to match New Delhi');
assert(mismatchRes.detectedCityFromCoords?.name === 'Pune', 'Expected detected coordinates to point to Pune');
console.log(`  ✓ Correctly detected mismatch! ${mismatchRes.reason}`);

// Test Profile Remediation
const staleProfile: Profile = {
  id: 'stale-1',
  name: 'Rahul Delhi',
  birth: mismatchedBirth,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const remediation = auditAndRemediateProfile(staleProfile);
assert(remediation.wasRemediated, 'Expected stale profile to be remediated');
assert(remediation.profile.birth.latitude === 28.6139, 'Remediated latitude should be 28.6139');
assert(remediation.profile.birth.longitude === 77.2090, 'Remediated longitude should be 77.2090');
assert(remediation.profile.birth.state === 'Delhi', 'Remediated state should be Delhi');
console.log(`  ✓ Successfully auto-repaired profile to New Delhi coords (28.6139°N, 77.2090°E)!`);

// ─── 3. Test Translation Keys and 3-Tier Fallback ────────────────────────────
console.log('\n3. Testing Translation Keys & Fallback Guarantee...');

// Verify previously leaking keys are fully defined
const enMind = getTranslation('en', 'common.mindComfort');
const mrMind = getTranslation('mr', 'common.mindComfort');
assert(enMind === 'Mind, emotions & inner peace', `Unexpected enMind: ${enMind}`);
assert(mrMind === 'मन, भावना व आंतरिक शांती', `Unexpected mrMind: ${mrMind}`);
console.log(`  ✓ common.mindComfort: "${enMind}" (en) | "${mrMind}" (mr)`);

const enSoul = getTranslation('en', 'common.vitalitySoul');
const mrSoul = getTranslation('mr', 'common.vitalitySoul');
assert(enSoul === 'Vitality, soul & self-expression', `Unexpected enSoul: ${enSoul}`);
assert(mrSoul === 'आत्मविश्वास, प्राणशक्ती व आत्मिक तेज', `Unexpected mrSoul: ${mrSoul}`);
console.log(`  ✓ common.vitalitySoul: "${enSoul}" (en) | "${mrSoul}" (mr)`);

// Verify fallback behavior for missing keys (never return raw dot key)
const missingKeyFallback = getTranslation('en', 'common.untranslatedSpecialFeature');
assert(
  missingKeyFallback === 'Untranslated Special Feature',
  `Expected humanized title fallback, got: ${missingKeyFallback}`
);
assert(!missingKeyFallback.includes('common.'), 'Fallback must never contain common.');
console.log(`  ✓ Missing key safely humanized: "common.untranslatedSpecialFeature" -> "${missingKeyFallback}"`);

// ─── 4. Test Kundali Calculation Data Mapping & Single Source of Truth ───────
console.log('\n4. Testing Kundali Calculation Data Mapping...');

const chart = calculateKundali(remediation.profile.birth);
const chartVal = validateDisplayedChartData(chart);
assert(chartVal.isValid, `Chart validation failed: ${chartVal.discrepancies.join(', ')}`);

assert(chart.lagnaSign === chart.ascendant.sign, 'Lagna must match Ascendant sign');
assert(chart.moonSign === chart.planets.Moon.sign, 'Moon sign must match Moon position');
assert(chart.sunSign === chart.planets.Sun.sign, 'Sun sign must match Sun position');
assert(chart.janmaNakshatra.name === chart.planets.Moon.nakshatra.name, 'Nakshatra must match Moon Nakshatra');
assert(chart.janmaNakshatraPada === chart.planets.Moon.nakshatraPosition.pada, 'Pada must match Moon Pada');
assert(chart.birthData.cityName === 'New Delhi', 'Authoritative chart birthData cityName must be New Delhi');
assert(chart.birthData.latitude === 28.6139, 'Authoritative chart latitude must be 28.6139');
assert(chart.birthData.longitude === 77.2090, 'Authoritative chart longitude must be 77.2090');
console.log(`  ✓ Calculated chart verified: Lagna=${chart.lagnaSign}, Moon=${chart.moonSign}, Sun=${chart.sunSign}, Nakshatra=${chart.janmaNakshatra.name} Pada ${chart.janmaNakshatraPada}`);

// ─── 5. Test Date & Time Consistency ─────────────────────────────────────────
console.log('\n5. Testing Date & Time Consistency...');

const birthDateFields = validateBirthData({
  name: 'Test',
  dob: '1998-07-15',
  tob: '09:45',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
});
assert(birthDateFields.isValid, 'Birth data fields should be valid');
assert(chart.birthData.dob === '1990-01-01', 'DOB string should not mutate');
assert(chart.birthData.tob === '10:00', 'TOB string should not mutate');
console.log(`  ✓ Birth date and time preserved with zero timezone shift.`);

console.log('\n🎉 ALL DATA CONSISTENCY & REMEDIATION TESTS PASSED!');
