// ============================================================
//  DOSHA RULES — Rule-based Dosha detection framework
//  Layer 2 (pure astrological rules, no UI)
// ============================================================

import type { DoshaRule, DoshaResult, ChartContext, Planet } from './models';

// ─── Manglik Dosha ────────────────────────────────────────────────────────────

const manglikDoshaRule: DoshaRule = {
  id: 'manglik', name: 'Manglik (Kuja) Dosha',
  evaluate(ctx): DoshaResult {
    const mars = ctx.getPlanet('Mars');
    const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];
    const isManglik = MANGLIK_HOUSES.includes(mars.house);

    const cancellations: string[] = [];

    if (isManglik) {
      // 8 Classical Cancellation Rules (Parashara & Mantreshwara)
      // 1. Mars in own sign (Aries, Scorpio)
      if (['Aries', 'Scorpio'].includes(mars.sign)) cancellations.push('Mars in own sign (Aries/Scorpio) — Dosha cancelled');
      // 2. Mars exalted (Capricorn)
      if (mars.sign === 'Capricorn') cancellations.push('Mars exalted in Capricorn — Dosha cancelled');
      // 3. Mars in Leo (strong Sun sign — fire dominance)
      if (mars.sign === 'Leo') cancellations.push('Mars in Leo (Sun\'s house, fire dominance) — Dosha cancelled');
      // 4. Mars in Aquarius
      if (mars.sign === 'Aquarius') cancellations.push('Mars in Aquarius (Saturn exaltation) — Dosha neutralized');
      // 5. Lagna is Aries or Scorpio (Mars rules Lagna)
      const lagnaSign = ctx.ascendant.sign;
      if (['Aries', 'Scorpio'].includes(lagnaSign)) cancellations.push(`Lagna is ${lagnaSign} (Mars is Lagna lord) — Dosha cancelled`);
      // 6. Jupiter aspects Mars
      const jupiter = ctx.getPlanet('Jupiter');
      if (ctx.aspects.some(a => a.fromPlanet === 'Jupiter' && a.toHouse === mars.house)) {
        cancellations.push('Jupiter aspects Mars — Dosha significantly reduced');
      }
      // 7. Mars in 2nd house only when it's Gemini or Virgo
      if (mars.house === 2 && ['Gemini', 'Virgo'].includes(mars.sign)) {
        cancellations.push('Mars in 2nd house in Gemini/Virgo — 2nd house Dosha cancelled');
      }
      // 8. Benefic planets (Jupiter/Venus) in 7th house
      const h7 = ctx.getHouse(7);
      const beneficsIn7 = h7.planets.filter(p => ['Jupiter', 'Venus'].includes(p));
      if (beneficsIn7.length > 0) cancellations.push(`Strong benefic (${beneficsIn7.join(', ')}) in 7th house — protects spouse`);
    }

    const isCancelled = cancellations.length > 0;
    const severity = !isManglik ? 'Low' : isCancelled ? 'Cancelled' : 'High';

    return {
      id: 'manglik', name: 'Manglik (Kuja) Dosha',
      isPresent: isManglik,
      severity,
      description: isManglik
        ? `Mars (Mangal) is in house ${mars.house} (${mars.sign}) — one of the classical Manglik houses (1, 2, 4, 7, 8, 12).`
        : `Mars (house ${mars.house}) is not in a Manglik house. No Manglik Dosha.`,
      planetsInvolved: ['Mars'],
      housesInvolved: [mars.house],
      cancellations,
      isCancelled,
      effects: isManglik && !isCancelled
        ? 'Potential tension in marriage, delay in matrimony, possible health issues for spouse if unchecked. Remedies strongly advised before marriage.'
        : isManglik && isCancelled
        ? 'Manglik Dosha is present but cancelled by one or more classical exceptions. Marriage is generally considered safe.'
        : 'No significant Mars-related dosha in marriage context.',
      remedies: isManglik && !isCancelled
        ? [
            'Kumbh Vivah (symbolic marriage with a peepal tree or clay pot) before actual marriage',
            'Mangal Stotra recitation daily',
            'Red coral (Moonga) worn in copper on Tuesday',
            'Chant: "Om Angarakaya Namah" 108 times on Tuesdays',
            'Donate red lentils (masoor dal), copper utensils on Tuesdays',
          ]
        : [],
    };
  }
};

// ─── Kaal Sarp Dosha ─────────────────────────────────────────────────────────

const KAAL_SARP_TYPES = [
  'Anant', 'Kulik', 'Vasuki', 'Shankhpal', 'Padma',
  'Mahapadma', 'Takshak', 'Karkotak', 'Shankhachur',
  'Ghatak', 'Vishadhar', 'Sheshnag'
];

const kaalSarpDoshaRule: DoshaRule = {
  id: 'kaal_sarp', name: 'Kaal Sarp Dosha',
  evaluate(ctx): DoshaResult {
    const rahu = ctx.getPlanet('Rahu');
    const ketu = ctx.getPlanet('Ketu');
    const rahuHouse = rahu.house;
    const ketuHouse = ketu.house; // always rahu.house + 6

    const BODY_PLANETS: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    // All 7 planets must be between Rahu and Ketu (hemmed within the arc)
    function isBetweenRahuKetu(planetHouse: number): boolean {
      // Going from Rahu clockwise to Ketu
      const houses: number[] = [];
      let h = rahuHouse;
      while (h !== ketuHouse) {
        h = (h % 12) + 1;
        if (h !== ketuHouse) houses.push(h);
      }
      return houses.includes(planetHouse);
    }

    const allBetween = BODY_PLANETS.every(p => {
      const ph = ctx.getPlanet(p).house;
      return ph !== rahuHouse && ph !== ketuHouse && isBetweenRahuKetu(ph);
    });

    const cancellations: string[] = [];
    let hasKaalSarp = false;
    let direction: 'Ascending (Savya)' | 'Descending (Apasavya)' | null = null;

    if (allBetween) {
      hasKaalSarp = true;
      // Savya = planets between Rahu→Ketu clockwise (ascending), Apasavya = reverse
      direction = 'Ascending (Savya)';

      // Cancellations
      // 1. Any planet conjunct Rahu or Ketu (breaks the serpent)
      const conjunctNode = BODY_PLANETS.filter(p => {
        const ph = ctx.getPlanet(p).house;
        return ph === rahuHouse || ph === ketuHouse;
      });
      if (conjunctNode.length > 0) cancellations.push(`${conjunctNode.join(', ')} conjunct Rahu/Ketu — Kaal Sarp broken`);
      // 2. Lagna lord in Kendra or Trikona
      const lagnaLord = ctx.houseLord(1);
      const lagnaLordPos = ctx.getPlanet(lagnaLord);
      if ([1,4,5,7,9,10].includes(lagnaLordPos.house)) cancellations.push(`Lagna lord (${lagnaLord}) in strong house — mitigating factor`);
      // 3. Jupiter in Kendra
      if ([1,4,7,10].includes(ctx.getPlanet('Jupiter').house)) cancellations.push('Jupiter in Kendra — Dosha partially mitigated');
    }

    const typeIndex = (rahuHouse - 1) % 12; // 0-based
    const serpentType = KAAL_SARP_TYPES[typeIndex];

    return {
      id: 'kaal_sarp', name: 'Kaal Sarp Dosha',
      isPresent: hasKaalSarp,
      severity: !hasKaalSarp ? 'Low' : cancellations.length > 0 ? 'Medium' : 'High',
      description: hasKaalSarp
        ? `All 7 planets are hemmed between Rahu (house ${rahuHouse}) and Ketu (house ${ketuHouse}). Type: ${serpentType} Kaal Sarp (${direction}).`
        : `Planets are not all hemmed between Rahu and Ketu. No Kaal Sarp Dosha.`,
      planetsInvolved: ['Rahu', 'Ketu'],
      housesInvolved: hasKaalSarp ? [rahuHouse, ketuHouse] : [],
      cancellations,
      isCancelled: cancellations.some(c => c.includes('broken')),
      effects: hasKaalSarp
        ? `${serpentType} Kaal Sarp: recurring obstacles in life areas of Rahu-Ketu axis (houses ${rahuHouse} and ${ketuHouse}). Struggles followed by sudden rises. Strong spiritual inclination.`
        : 'No Kaal Sarp Dosha.',
      remedies: hasKaalSarp ? [
        'Perform Kaal Sarp Shanti puja at Tryambakeshwar, Nasik or Ujjain',
        'Offer silver snake pair at Shiva temple on Nag Panchami',
        'Recite Maha Mrityunjaya Mantra 108 times daily',
        'Fast on Nag Panchami',
        'Donate black sesame seeds on Saturdays',
      ] : [],
    };
  }
};

// ─── Shani Sade Sati ─────────────────────────────────────────────────────────

const sadeSatiRule: DoshaRule = {
  id: 'sade_sati', name: 'Shani Sade Sati / Dhaiya',
  evaluate(ctx): DoshaResult {
    const moon = ctx.getPlanet('Moon');
    const saturn = ctx.getPlanet('Saturn');
    const moonHouse = moon.house;
    const saturnHouse = saturn.house;

    // Sade Sati: Saturn in 12th, 1st, or 2nd from Moon's natal sign
    const distFromMoon = ((saturnHouse - moonHouse + 12) % 12) + 1;
    const isSadeSati = [12, 1, 2].includes(distFromMoon);
    const isDhaiya = [4, 8].includes(distFromMoon); // Kantaka / Ashtama Shani

    let phase = 'None';
    if (isSadeSati) {
      if (distFromMoon === 12) phase = 'Rising (1st Phase)';
      else if (distFromMoon === 1) phase = 'Peak (2nd Phase)';
      else if (distFromMoon === 2) phase = 'Setting (3rd Phase)';
    } else if (isDhaiya) {
      phase = distFromMoon === 4 ? 'Kantaka Dhaiya (4th from Moon)' : 'Ashtama Dhaiya (8th from Moon)';
    }

    const isActive = isSadeSati || isDhaiya;
    const cancellations: string[] = [];
    if (isActive && saturn.dignity === 'Exalted') cancellations.push('Saturn exalted — effects significantly reduced');
    if (isActive && saturn.dignity === 'OwnSign') cancellations.push('Saturn in own sign — effects reduced');
    if (isActive && ctx.aspects.some(a => a.fromPlanet === 'Jupiter' && a.toHouse === saturnHouse)) {
      cancellations.push('Jupiter aspects Saturn — malefic effects mitigated');
    }

    return {
      id: 'sade_sati', name: 'Shani Sade Sati / Dhaiya',
      isPresent: isActive,
      severity: !isActive ? 'Low' : isSadeSati ? 'High' : 'Medium',
      description: isActive
        ? `Saturn (house ${saturnHouse}, ${saturn.sign}) is ${distFromMoon}th from Moon's natal sign (house ${moonHouse}, ${moon.sign}). ${phase} active.`
        : `Saturn (house ${saturnHouse}) is not in 12th, 1st, or 2nd from Moon (house ${moonHouse}). No Sade Sati or Dhaiya.`,
      planetsInvolved: ['Saturn', 'Moon'],
      housesInvolved: isActive ? [saturnHouse, moonHouse] : [],
      cancellations,
      isCancelled: false, // Sade Sati is never fully cancelled, only mitigated
      effects: isActive
        ? `${phase}: ${isSadeSati ? 'Sade Sati brings testing of patience, health challenges for native and mother, career obstacles, and forced transformation over ~7.5 years.' : 'Dhaiya brings a ~2.5 year period of pressure in the house axis involved.'}`
        : 'No current Saturn transit affliction on Moon.',
      remedies: isActive ? [
        'Shani Mantra: "Om Praam Preem Praum Sah Shanaischaraya Namah" — 108 times on Saturdays',
        'Light sesame oil lamp in Shani temple on Saturdays',
        'Donate black sesame, mustard oil, and blue cloth on Saturdays',
        'Visit Shani Shingnapur or Tirunallar Sanisvara temple',
        'Read Shani Stotra / Hanuman Chalisa daily',
        'Feed crows black sesame and mustard oil',
      ] : [],
    };
  }
};

// ─── Dosha Rule Registry ─────────────────────────────────────────────────────

export const DOSHA_RULES: DoshaRule[] = [
  manglikDoshaRule,
  kaalSarpDoshaRule,
  sadeSatiRule,
];

/** Evaluate all dosha rules against a chart context */
export function detectAllDoshas(ctx: ChartContext): DoshaResult[] {
  const results: DoshaResult[] = [];
  for (const rule of DOSHA_RULES) {
    try {
      results.push(rule.evaluate(ctx));
    } catch {
      // Skip rule on error
    }
  }
  return results;
}
