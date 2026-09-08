// ============================================================
//  ASPECTS ENGINE — Vedic Drishti (Aspect) Rules
//  Layer 2 (configurable data-driven rules, no UI)
// ============================================================

import type {
  Planet, AspectRelation, AspectConfig, PlanetAspectConfig, AspectStrength
} from './models';

// ─── Default Parashari Aspect Configuration ──────────────────────────────────

/**
 * DEFAULT_ASPECT_CONFIG implements standard Parashari Graha Drishti.
 * All planets cast a full 7th aspect.
 * Mars:    additional Full 4th and 8th aspects.
 * Jupiter: additional Full 5th and 9th aspects.
 * Saturn:  additional Full 3rd and 10th aspects.
 * Rahu:    5th and 9th (FifthNinth treatment).
 * Ketu:    same as Rahu when FifthNinth is selected.
 *
 * Change `rahuKetuTreatment` to 'Conjunction' if you prefer no Rahu/Ketu drishti.
 */
export const DEFAULT_ASPECT_CONFIG: AspectConfig = {
  rahuKetuTreatment: 'FifthNinth',
  rules: [
    // All planets: 7th aspect (full)
    { planet: 'ALL', aspects: [{ houseOffset: 7, strength: 'Full' }] },
    // Mars special: 4th and 8th
    { planet: 'Mars',    aspects: [{ houseOffset: 4, strength: 'Full' }, { houseOffset: 8, strength: 'Full' }] },
    // Jupiter special: 5th and 9th
    { planet: 'Jupiter', aspects: [{ houseOffset: 5, strength: 'Full' }, { houseOffset: 9, strength: 'Full' }] },
    // Saturn special: 3rd and 10th
    { planet: 'Saturn',  aspects: [{ houseOffset: 3, strength: 'Full' }, { houseOffset: 10, strength: 'Full' }] },
  ],
};

// ─── Aspect Evaluator ─────────────────────────────────────────────────────────

/**
 * Compute all AspectRelations for all planets given their house positions.
 * Returns the full list of aspects cast (fromPlanet → toHouse → optionally toPlanet).
 */
export function computeAspects(
  planetHouses: Record<Planet, number>,   // planet → house (1–12)
  config: AspectConfig = DEFAULT_ASPECT_CONFIG
): AspectRelation[] {
  const relations: AspectRelation[] = [];

  const planetsToAspect: Array<Exclude<Planet, 'Ascendant'>> = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ];

  // Build an index from house → planet for quick reverse lookup
  const houseToPlanet: Partial<Record<number, Planet>> = {};
  for (const [p, h] of Object.entries(planetHouses) as [Planet, number][]) {
    if (p !== 'Ascendant') houseToPlanet[h] = p;
  }

  for (const planet of planetsToAspect) {
    const fromHouse = planetHouses[planet];
    if (!fromHouse) continue;

    // Collect aspect definitions for this planet
    const aspectDefs: { houseOffset: number; strength: AspectStrength; rule: string }[] = [];

    // 1. ALL planets' 7th aspect
    const allRule = config.rules.find(r => r.planet === 'ALL');
    if (allRule) {
      for (const a of allRule.aspects) {
        aspectDefs.push({ ...a, rule: `Standard 7th aspect (Parashari)` });
      }
    }

    // 2. Planet-specific rules
    const planetRule = config.rules.find(r => r.planet === planet);
    if (planetRule) {
      for (const a of planetRule.aspects) {
        aspectDefs.push({
          ...a,
          rule: `${planet} special ${ordinal(a.houseOffset)} aspect (Parashari)`,
        });
      }
    }

    // 3. Rahu/Ketu treatment
    if ((planet === 'Rahu' || planet === 'Ketu') && config.rahuKetuTreatment === 'FifthNinth') {
      aspectDefs.push(
        { houseOffset: 5, strength: 'Full', rule: `${planet} 5th aspect (FifthNinth rule)` },
        { houseOffset: 9, strength: 'Full', rule: `${planet} 9th aspect (FifthNinth rule)` }
      );
    }

    // Emit one AspectRelation per (planet, offset) pair
    for (const def of aspectDefs) {
      const toHouse = ((fromHouse - 1 + def.houseOffset - 1) % 12) + 1;
      // Skip self-aspect (houseOffset=1 would be own house, not used but guard anyway)
      if (toHouse === fromHouse && def.houseOffset !== 1) continue;
      // Don't emit if toHouse === fromHouse for the 7th aspect (unless offset IS 7)
      const toPlanet = houseToPlanet[toHouse];

      relations.push({
        fromPlanet: planet,
        fromHouse,
        toHouse,
        toPlanet,
        houseOffset: def.houseOffset,
        strength: def.strength,
        rule: def.rule,
      });
    }
  }

  return relations;
}

/** Get all aspects landing on a specific planet */
export function aspectsReceivedBy(planet: Planet, aspects: AspectRelation[]): AspectRelation[] {
  return aspects.filter(a => a.toPlanet === planet);
}

/** Get all aspects cast by a specific planet */
export function aspectsGivenBy(planet: Planet, aspects: AspectRelation[]): AspectRelation[] {
  return aspects.filter(a => a.fromPlanet === planet);
}

/** Get all planets aspecting a given house */
export function planetsAspectingHouse(house: number, aspects: AspectRelation[]): Planet[] {
  return aspects.filter(a => a.toHouse === house).map(a => a.fromPlanet);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Human-readable strength label */
export const STRENGTH_LABELS: Record<AspectStrength, string> = {
  Full:         'Full (100%)',
  ThreeQuarter: '3/4 (75%)',
  Half:         '1/2 (50%)',
  Quarter:      '1/4 (25%)',
};
