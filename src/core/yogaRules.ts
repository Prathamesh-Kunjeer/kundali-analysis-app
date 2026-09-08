// ============================================================
//  YOGA RULES — Rule-based Yoga detection framework
//  Layer 2 (pure astrological rules, no UI)
// ============================================================

import type {
  YogaRule, YogaResult, YogaCategory, YogaStrength, ChartContext,
  Planet, Sign
} from './models';
import { KENDRA, TRIKONA, DUSTHANA } from './houses';

// ─── Helper to build a YogaResult ────────────────────────────────────────────

function makeYoga(
  id: string, name: string, sanskritName: string,
  category: YogaCategory, strength: YogaStrength,
  ctx: ChartContext,
  planetsInvolved: Planet[], housesInvolved: number[],
  description: string, positiveEffects: string, cautionaryEffects: string,
  ruleReference: string
): YogaResult {
  const signsInvolved: Sign[] = housesInvolved.map(h => ctx.getHouse(h).sign);
  return {
    id, name, sanskritName, category, strength,
    description, planetsInvolved, housesInvolved, signsInvolved,
    positiveEffects, cautionaryEffects, ruleReference,
  };
}

// ─── Individual Yoga Rules ────────────────────────────────────────────────────

const ruchakayoga: YogaRule = {
  id: 'ruchaka', name: 'Ruchaka Yoga', category: 'Mahapurusha',
  ruleReference: 'Brihat Parashara Hora Shastra, Ch. 75',
  evaluate(ctx) {
    const mars = ctx.getPlanet('Mars');
    if (!KENDRA.has(mars.house)) return null;
    if (!['Exalted', 'Moolatrikona', 'OwnSign'].includes(mars.dignity)) return null;
    return makeYoga('ruchaka', 'Ruchaka Yoga', 'रुचक योग', 'Mahapurusha', 'Exceptional', ctx,
      ['Mars'], [mars.house],
      `Mars is in Kendra (house ${mars.house}) in ${mars.dignity} dignity (${mars.sign}).`,
      'Exceptional physical stamina, courage, victory over enemies, leadership ability, military or executive rank, land and property gains.',
      'Possible aggression or impatience; temper management needed. Full results when unafflicted by malefics.',
      'BPHS Ch. 75'
    );
  }
};

const bhadrayoga: YogaRule = {
  id: 'bhadra', name: 'Bhadra Yoga', category: 'Mahapurusha',
  ruleReference: 'Brihat Parashara Hora Shastra, Ch. 75',
  evaluate(ctx) {
    const mercury = ctx.getPlanet('Mercury');
    if (!KENDRA.has(mercury.house)) return null;
    if (!['Exalted', 'Moolatrikona', 'OwnSign'].includes(mercury.dignity)) return null;
    return makeYoga('bhadra', 'Bhadra Yoga', 'भद्र योग', 'Mahapurusha', 'Exceptional', ctx,
      ['Mercury'], [mercury.house],
      `Mercury is in Kendra (house ${mercury.house}) in ${mercury.dignity} dignity (${mercury.sign}).`,
      'Sharp intellect, eloquence, mastery of commerce and arts, diplomatic acumen, scholarly recognition.',
      'May indicate over-analytical thinking. Combustion of Mercury weakens results significantly.',
      'BPHS Ch. 75'
    );
  }
};

const hamsayoga: YogaRule = {
  id: 'hamsa', name: 'Hamsa Yoga', category: 'Mahapurusha',
  ruleReference: 'Brihat Parashara Hora Shastra, Ch. 75',
  evaluate(ctx) {
    const jupiter = ctx.getPlanet('Jupiter');
    if (!KENDRA.has(jupiter.house)) return null;
    if (!['Exalted', 'Moolatrikona', 'OwnSign'].includes(jupiter.dignity)) return null;
    return makeYoga('hamsa', 'Hamsa Yoga', 'हंस योग', 'Mahapurusha', 'Exceptional', ctx,
      ['Jupiter'], [jupiter.house],
      `Jupiter is in Kendra (house ${jupiter.house}) in ${jupiter.dignity} dignity (${jupiter.sign}).`,
      'Spiritual wisdom, universal respect, moral authority, academic excellence, divine protection and fortune.',
      'Jupiter retrograde may delay results. Guru Chandal (Rahu conjunction) curtails spiritual effects.',
      'BPHS Ch. 75'
    );
  }
};

const malavyayoga: YogaRule = {
  id: 'malavya', name: 'Malavya Yoga', category: 'Mahapurusha',
  ruleReference: 'Brihat Parashara Hora Shastra, Ch. 75',
  evaluate(ctx) {
    const venus = ctx.getPlanet('Venus');
    if (!KENDRA.has(venus.house)) return null;
    if (!['Exalted', 'Moolatrikona', 'OwnSign'].includes(venus.dignity)) return null;
    return makeYoga('malavya', 'Malavya Yoga', 'मालव्य योग', 'Mahapurusha', 'Exceptional', ctx,
      ['Venus'], [venus.house],
      `Venus is in Kendra (house ${venus.house}) in ${venus.dignity} dignity (${venus.sign}).`,
      'Immense charm, artistic talent, luxurious lifestyle, joyful married life, prosperity and magnetic charisma.',
      'May create attachment to material pleasures. Saturn affliction can delay comforts.',
      'BPHS Ch. 75'
    );
  }
};

const sasayoga: YogaRule = {
  id: 'sasa', name: 'Sasa Yoga', category: 'Mahapurusha',
  ruleReference: 'Brihat Parashara Hora Shastra, Ch. 75',
  evaluate(ctx) {
    const saturn = ctx.getPlanet('Saturn');
    if (!KENDRA.has(saturn.house)) return null;
    if (!['Exalted', 'Moolatrikona', 'OwnSign'].includes(saturn.dignity)) return null;
    return makeYoga('sasa', 'Sasa Yoga', 'शश योग', 'Mahapurusha', 'Exceptional', ctx,
      ['Saturn'], [saturn.house],
      `Saturn is in Kendra (house ${saturn.house}) in ${saturn.dignity} dignity (${saturn.sign}).`,
      'Authority over masses, judicial power, lasting legacy through disciplined effort, organized wealth accumulation.',
      'Saturn Dasha needed to fully activate. Placement in 7th or 10th stronger than 1st/4th.',
      'BPHS Ch. 75'
    );
  }
};

const gajakesariYoga: YogaRule = {
  id: 'gajakesari', name: 'Gajakesari Yoga', category: 'RajaYoga',
  ruleReference: 'Phala Deepika, Ch. 6',
  evaluate(ctx) {
    const moon = ctx.getPlanet('Moon');
    const jupiter = ctx.getPlanet('Jupiter');
    const dist = ((jupiter.house - moon.house + 12) % 12) + 1;
    if (![1, 4, 7, 10].includes(dist)) return null;
    return makeYoga('gajakesari', 'Gajakesari Yoga', 'गजकेसरी योग', 'RajaYoga', 'Strong', ctx,
      ['Jupiter', 'Moon'], [jupiter.house, moon.house],
      `Jupiter (house ${jupiter.house}) is in Kendra from Moon (house ${moon.house}), ${dist}th position.`,
      'Fame, intellectual superiority, royal patronage, unyielding courage, protection from life calamities.',
      'Weakened if Moon or Jupiter is debilitated, combust, or heavily afflicted by malefics.',
      'Phala Deepika Ch. 6'
    );
  }
};

const kendraTrikonaRajaYoga: YogaRule = {
  id: 'kendra_trikona_raja', name: 'Kendra-Trikona Raja Yoga', category: 'RajaYoga',
  ruleReference: 'BPHS Ch. 41 — Rajayoga Adhyaya',
  evaluate(ctx) {
    // Lords of a Kendra and a Trikona conjoin or mutually aspect each other
    const kendraHouses = [1, 4, 7, 10];
    const trikonaHouses = [1, 5, 9];
    const yogas: string[] = [];
    const planets: Planet[] = [];
    const houses: number[] = [];

    for (const kh of kendraHouses) {
      for (const th of trikonaHouses) {
        if (kh === th) continue; // 1st house is both — skip duplication
        const kLord = ctx.houseLord(kh);
        const tLord = ctx.houseLord(th);
        if (kLord === tLord) continue; // same planet lords both — still valid but skip duplicate detection
        const kPos = ctx.getPlanet(kLord);
        const tPos = ctx.getPlanet(tLord);
        // Check conjunction or mutual 7th aspect
        const conjoined = kPos.house === tPos.house;
        const mutual7th = Math.abs(kPos.house - tPos.house) === 6;
        if (conjoined || mutual7th) {
          yogas.push(`Lord of ${kh} (${kLord}) + Lord of ${th} (${tLord})`);
          if (!planets.includes(kLord)) planets.push(kLord);
          if (!planets.includes(tLord)) planets.push(tLord);
          if (!houses.includes(kPos.house)) houses.push(kPos.house);
          if (!houses.includes(tPos.house)) houses.push(tPos.house);
        }
      }
    }

    if (yogas.length === 0) return null;
    return makeYoga('kendra_trikona_raja', 'Kendra-Trikona Raja Yoga', 'केंद्र-त्रिकोण राजयोग',
      'RajaYoga', 'Strong', ctx, planets, houses,
      yogas.join('; ') + ' — lords of Kendra and Trikona are in relationship.',
      'Rise to authority, executive power, prosperity, recognition from state and society. Effects felt during relevant Dashas.',
      'Both lords must be well-placed and unafflicted for full results. Debilitation or combustion reduces power.',
      'BPHS Ch. 41'
    );
  }
};

const dharmakarmadhipatiYoga: YogaRule = {
  id: 'dharmakarma', name: 'Dharma-Karmadhipati Yoga', category: 'RajaYoga',
  ruleReference: 'BPHS Ch. 41 — considered the highest Raja Yoga',
  evaluate(ctx) {
    const lord9 = ctx.houseLord(9);
    const lord10 = ctx.houseLord(10);
    if (lord9 === lord10) return null; // same planet, very powerful but single indicator
    const pos9 = ctx.getPlanet(lord9);
    const pos10 = ctx.getPlanet(lord10);
    const conjoined = pos9.house === pos10.house;
    const mutual7th = Math.abs(pos9.house - pos10.house) === 6;
    if (!conjoined && !mutual7th) return null;
    return makeYoga('dharmakarma', 'Dharma-Karmadhipati Yoga', 'धर्म-कर्माधिपति योग',
      'RajaYoga', 'Exceptional', ctx, [lord9, lord10], [pos9.house, pos10.house],
      `9th lord (${lord9}, house ${pos9.house}) and 10th lord (${lord10}, house ${pos10.house}) are ${conjoined ? 'conjunct' : 'in mutual 7th aspect'}.`,
      'Considered the highest Raja Yoga — brings fame, power, government favor, peak career success and spiritual merit simultaneously.',
      'Requires both lords free from debilitation and affliction for full expression. Works best in 9th/10th lord Dashas.',
      'BPHS Ch. 41'
    );
  }
};

const lakshmiYoga: YogaRule = {
  id: 'lakshmi', name: 'Lakshmi Yoga', category: 'DhanaYoga',
  ruleReference: 'Phala Deepika Ch. 6, BPHS Ch. 41',
  evaluate(ctx) {
    const lord9 = ctx.houseLord(9);
    const pos = ctx.getPlanet(lord9);
    // 9th lord must be in own sign or exaltation in a Kendra or Trikona
    if (!['Exalted', 'OwnSign', 'Moolatrikona'].includes(pos.dignity)) return null;
    if (!KENDRA.has(pos.house) && !TRIKONA.has(pos.house)) return null;
    // Venus must also be strong (own sign, exalted, or in Kendra/Trikona)
    const venus = ctx.getPlanet('Venus');
    const venusStrong = ['Exalted', 'OwnSign', 'Moolatrikona'].includes(venus.dignity)
      || KENDRA.has(venus.house) || TRIKONA.has(venus.house);
    if (!venusStrong) return null;
    return makeYoga('lakshmi', 'Lakshmi Yoga', 'लक्ष्मी योग', 'DhanaYoga', 'Exceptional', ctx,
      [lord9, 'Venus'], [pos.house, venus.house],
      `9th lord (${lord9}) in ${pos.dignity} in house ${pos.house}, with Venus also well-placed (house ${venus.house}, ${venus.dignity}).`,
      'Great fortune, material prosperity, fame, virtuous character, devoted spouse, divine grace of Goddess Lakshmi.',
      'All wealth yogas give full results only during their active Dasha periods. Requires chart-level strength.',
      'Phala Deepika Ch. 6'
    );
  }
};

const dhanaYoga2_11: YogaRule = {
  id: 'dhana_2_11', name: 'Dhana Yoga (2nd-11th)', category: 'DhanaYoga',
  ruleReference: 'Sarvartha Chintamani — Dhana Yogas',
  evaluate(ctx) {
    const lord2 = ctx.houseLord(2);
    const lord11 = ctx.houseLord(11);
    if (lord2 === lord11) return null;
    const pos2 = ctx.getPlanet(lord2);
    const pos11 = ctx.getPlanet(lord11);
    const conjoined = pos2.house === pos11.house;
    const lord2in11 = pos2.house === 11;
    const lord11in2 = pos11.house === 2;
    if (!conjoined && !lord2in11 && !lord11in2) return null;
    return makeYoga('dhana_2_11', 'Dhana Yoga', 'धन योग', 'DhanaYoga', 'Strong', ctx,
      [lord2, lord11], [pos2.house, pos11.house],
      `2nd lord (${lord2}) and 11th lord (${lord11}) ${conjoined ? 'are conjunct in house ' + pos2.house : 'exchange/aspect each other'}.`,
      'Extraordinary wealth accumulation, multiple income sources, financial independence, and prosperous family lineage.',
      'Dusthana placement of these lords reduces effect. Needs good supporting Dasha to fully manifest.',
      'Sarvartha Chintamani'
    );
  }
};

const budhadityaYoga: YogaRule = {
  id: 'budhaditya', name: 'Budhaditya Yoga', category: 'AuspiciousYoga',
  ruleReference: 'Phala Deepika Ch. 6 — Budha + Surya sambandha',
  evaluate(ctx) {
    const sun = ctx.getPlanet('Sun');
    const mercury = ctx.getPlanet('Mercury');
    if (sun.house !== mercury.house) return null;
    if (mercury.isCombust) return null; // Combust Mercury weakens the yoga
    return makeYoga('budhaditya', 'Budhaditya Yoga', 'बुधादित्य योग', 'AuspiciousYoga', 'Strong', ctx,
      ['Sun', 'Mercury'], [sun.house],
      `Sun and Mercury are conjunct in house ${sun.house} (${sun.sign}), Mercury not combust.`,
      'Administrative brilliance, analytical mind, eloquent communication, commercial success, executive prestige.',
      'Mercury combust reduces results significantly. Placement in Dusthana diminishes its career and wealth aspects.',
      'Phala Deepika Ch. 6'
    );
  }
};

const chandramangalYoga: YogaRule = {
  id: 'chandra_mangal', name: 'Chandra-Mangal Yoga', category: 'DhanaYoga',
  ruleReference: 'BPHS — Chandra-Mangala Sambandha',
  evaluate(ctx) {
    const moon = ctx.getPlanet('Moon');
    const mars = ctx.getPlanet('Mars');
    const conjoined = moon.house === mars.house;
    const mutual7 = Math.abs(moon.house - mars.house) === 6;
    if (!conjoined && !mutual7) return null;
    return makeYoga('chandra_mangal', 'Chandra-Mangal Yoga', 'चन्द्र-मंगल योग', 'DhanaYoga', 'Strong', ctx,
      ['Moon', 'Mars'], [moon.house, mars.house],
      `Moon (house ${moon.house}) and Mars (house ${mars.house}) ${conjoined ? 'are conjunct' : 'mutually aspect each other (7th)'}.`,
      'Wealth generation through enterprise, real estate gains, bold financial decisions, resilience in business.',
      'Moon afflicted (Kemadruma context) weakens results. Can indicate conflict with mother if in 4th house.',
      'BPHS'
    );
  }
};

const amalaYoga: YogaRule = {
  id: 'amala', name: 'Amala Yoga', category: 'AuspiciousYoga',
  ruleReference: 'Phala Deepika Ch. 6',
  evaluate(ctx) {
    const benefics: Planet[] = ['Jupiter', 'Venus', 'Mercury'];
    const inTenth = benefics.filter(p => ctx.getPlanet(p).house === 10 && !ctx.getPlanet(p).isCombust);
    if (inTenth.length === 0) return null;
    return makeYoga('amala', 'Amala Yoga', 'अमला योग', 'AuspiciousYoga', 'Strong', ctx,
      inTenth, [10],
      `Natural benefic(s) ${inTenth.join(', ')} occupy the 10th house of career.`,
      'Unblemished reputation, noble profession, benevolent authority, enduring fame in public life.',
      'Malefic aspect on 10th house can create obstacles; results strongest when benefic is also dignified.',
      'Phala Deepika Ch. 6'
    );
  }
};

// ─── Vipareeta Raja Yogas ────────────────────────────────────────────────────

const harshaYoga: YogaRule = {
  id: 'harsha', name: 'Harsha Yoga', category: 'VipareetsRajaYoga',
  ruleReference: 'BPHS — Vipareeta Raja Yoga (6th lord in Dusthana)',
  evaluate(ctx) {
    const lord6 = ctx.houseLord(6);
    const pos = ctx.getPlanet(lord6);
    if (!DUSTHANA.has(pos.house)) return null;
    return makeYoga('harsha', 'Harsha Yoga', 'हर्ष योग', 'VipareetsRajaYoga', 'Moderate', ctx,
      [lord6], [pos.house],
      `6th lord (${lord6}) is placed in Dusthana house ${pos.house}.`,
      'Victory over enemies, physical resilience, unexpected fortune through adversity, immunity from chronic disease.',
      'Does not guarantee health or longevity on its own. Best results during the lord\'s Dasha.',
      'BPHS'
    );
  }
};

const saralaYoga: YogaRule = {
  id: 'sarala', name: 'Sarala Yoga', category: 'VipareetsRajaYoga',
  ruleReference: 'BPHS — Vipareeta Raja Yoga (8th lord in Dusthana)',
  evaluate(ctx) {
    const lord8 = ctx.houseLord(8);
    const pos = ctx.getPlanet(lord8);
    if (!DUSTHANA.has(pos.house)) return null;
    return makeYoga('sarala', 'Sarala Yoga', 'सरल योग', 'VipareetsRajaYoga', 'Moderate', ctx,
      [lord8], [pos.house],
      `8th lord (${lord8}) is placed in Dusthana house ${pos.house}.`,
      'Fearlessness, longevity, scholarly depth, victory in litigation, prosperity after sudden transformation.',
      'Does not protect from all 8th house difficulties. Active during lord\'s Dasha.',
      'BPHS'
    );
  }
};

const vimalaYoga: YogaRule = {
  id: 'vimala', name: 'Vimala Yoga', category: 'VipareetsRajaYoga',
  ruleReference: 'BPHS — Vipareeta Raja Yoga (12th lord in Dusthana)',
  evaluate(ctx) {
    const lord12 = ctx.houseLord(12);
    const pos = ctx.getPlanet(lord12);
    if (!DUSTHANA.has(pos.house)) return null;
    return makeYoga('vimala', 'Vimala Yoga', 'विमल योग', 'VipareetsRajaYoga', 'Moderate', ctx,
      [lord12], [pos.house],
      `12th lord (${lord12}) is placed in Dusthana house ${pos.house}.`,
      'Independence, frugal management, noble conduct, success in overseas endeavors, spiritual liberation.',
      'Does not eliminate 12th house losses entirely. Primarily reduces negative expenditure effects.',
      'BPHS'
    );
  }
};

// ─── Challenging Yogas ────────────────────────────────────────────────────────

const kemadruma: YogaRule = {
  id: 'kemadruma', name: 'Kemadruma Yoga', category: 'InauspiciousYoga',
  ruleReference: 'Brihat Jataka Ch. 17',
  evaluate(ctx) {
    const moon = ctx.getPlanet('Moon');
    const h2FromMoon = ((moon.house) % 12) + 1;
    const h12FromMoon = ((moon.house - 2 + 12) % 12) + 1;
    const EXCLUDED: Planet[] = ['Sun', 'Moon', 'Rahu', 'Ketu', 'Ascendant'];
    const allPlanets: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const hasAdjacent = allPlanets.some(p =>
      !EXCLUDED.includes(p) &&
      (ctx.getPlanet(p).house === h2FromMoon || ctx.getPlanet(p).house === h12FromMoon)
    );
    if (hasAdjacent) return null;
    // Cancellation: Jupiter in Kendra from Moon
    const jupiter = ctx.getPlanet('Jupiter');
    const jupDistFromMoon = ((jupiter.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(jupDistFromMoon)) return null; // cancelled
    return makeYoga('kemadruma', 'Kemadruma Yoga', 'केमद्रुम योग', 'InauspiciousYoga', 'Mild', ctx,
      ['Moon'], [moon.house],
      `No planet (except Sun/Rahu/Ketu) in 2nd (house ${h2FromMoon}) or 12th (house ${h12FromMoon}) from Moon (house ${moon.house}). Jupiter not in Kendra from Moon.`,
      'Self-reliance developed through adversity; potential for spiritual introspection.',
      'May indicate periods of psychological isolation, struggle without support. Devotion to Goddess Lakshmi recommended.',
      'Brihat Jataka Ch. 17'
    );
  }
};

const guruChandal: YogaRule = {
  id: 'guru_chandal', name: 'Guru Chandal Yoga', category: 'InauspiciousYoga',
  ruleReference: 'Classical reference — Rahu-Jupiter conjunction effects',
  evaluate(ctx) {
    const jupiter = ctx.getPlanet('Jupiter');
    const rahu = ctx.getPlanet('Rahu');
    if (jupiter.house !== rahu.house) return null;
    return makeYoga('guru_chandal', 'Guru Chandal Yoga', 'गुरु चांडाल योग', 'InauspiciousYoga', 'Moderate', ctx,
      ['Jupiter', 'Rahu'], [jupiter.house],
      `Jupiter and Rahu are conjunct in house ${jupiter.house} (${jupiter.sign}).`,
      'Unconventional wisdom, questioning of orthodoxy, possibly heterodox spiritual path, interest in astrology/occult.',
      'Ethical conflicts with mentors or gurus, possible deceit in teachings received. Benefic planets aspecting Jupiter can mitigate.',
      'Classical Vedic texts'
    );
  }
};

const grahanYogaSun: YogaRule = {
  id: 'surya_grahan', name: 'Surya Grahan Yoga', category: 'InauspiciousYoga',
  ruleReference: 'Classical — Sun eclipse by node conjunction',
  evaluate(ctx) {
    const sun = ctx.getPlanet('Sun');
    const rahu = ctx.getPlanet('Rahu');
    const ketu = ctx.getPlanet('Ketu');
    if (sun.house !== rahu.house && sun.house !== ketu.house) return null;
    const node = sun.house === rahu.house ? 'Rahu' : 'Ketu';
    return makeYoga('surya_grahan', 'Surya Grahan Yoga', 'सूर्य ग्रहण योग', 'InauspiciousYoga', 'Moderate', ctx,
      ['Sun', node], [sun.house],
      `Sun is conjunct ${node} in house ${sun.house} (${sun.sign}).`,
      'Strong interest in spirituality, astrology, and the occult. Heightened perception.',
      'Fluctuating confidence, complex relationship with father or authority figures. Aditya Hridaya Stotra advised.',
      'Classical Vedic texts'
    );
  }
};

const grahanYogaMoon: YogaRule = {
  id: 'chandra_grahan', name: 'Chandra Grahan Yoga', category: 'InauspiciousYoga',
  ruleReference: 'Classical — Moon eclipse by node conjunction',
  evaluate(ctx) {
    const moon = ctx.getPlanet('Moon');
    const rahu = ctx.getPlanet('Rahu');
    const ketu = ctx.getPlanet('Ketu');
    if (moon.house !== rahu.house && moon.house !== ketu.house) return null;
    const node = moon.house === rahu.house ? 'Rahu' : 'Ketu';
    return makeYoga('chandra_grahan', 'Chandra Grahan Yoga', 'चन्द्र ग्रहण योग', 'InauspiciousYoga', 'Moderate', ctx,
      ['Moon', node], [moon.house],
      `Moon is conjunct ${node} in house ${moon.house} (${moon.sign}).`,
      'Heightened intuition, psychic sensitivity, mediumistic abilities, deep emotional intelligence.',
      'Mood volatility, overactive imagination, psychological sensitivity. Shiva and Shakti worship recommended.',
      'Classical Vedic texts'
    );
  }
};

const papakartariYoga: YogaRule = {
  id: 'papakartari', name: 'Papakartari Yoga', category: 'InauspiciousYoga',
  ruleReference: 'Classical — Malefic scissors formation',
  evaluate(ctx) {
    const MALEFICS: Planet[] = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
    // Check if any house is hemmed between malefics on both sides
    const affectedHouses: number[] = [];
    for (let h = 1; h <= 12; h++) {
      const prevH = ((h - 2 + 12) % 12) + 1;
      const nextH = (h % 12) + 1;
      const prevMalefic = MALEFICS.some(p => ctx.getPlanet(p).house === prevH);
      const nextMalefic = MALEFICS.some(p => ctx.getPlanet(p).house === nextH);
      if (prevMalefic && nextMalefic && ctx.getHouse(h).planets.length > 0) {
        affectedHouses.push(h);
      }
    }
    if (affectedHouses.length === 0) return null;
    const affectedPlanets = affectedHouses.flatMap(h => ctx.getHouse(h).planets);
    return makeYoga('papakartari', 'Papakartari Yoga', 'पापकर्तरी योग', 'InauspiciousYoga', 'Moderate', ctx,
      affectedPlanets as Planet[], affectedHouses,
      `Planets in houses ${affectedHouses.join(', ')} are hemmed between malefics on both sides.`,
      'Intensified struggle in life areas denoted by the hemmed house. Character steel forged through adversity.',
      'Planets in Papakartari are weakened and may not fully deliver their promises. Benefic aspects reduce impact.',
      'Classical Vedic texts'
    );
  }
};

// ─── Yoga Rule Registry ───────────────────────────────────────────────────────

export const YOGA_RULES: YogaRule[] = [
  // Mahapurusha
  ruchakayoga, bhadrayoga, hamsayoga, malavyayoga, sasayoga,
  // Raja Yogas
  gajakesariYoga, kendraTrikonaRajaYoga, dharmakarmadhipatiYoga,
  // Wealth
  lakshmiYoga, dhanaYoga2_11, chandramangalYoga,
  // Auspicious
  budhadityaYoga, amalaYoga,
  // Vipareeta Raja
  harshaYoga, saralaYoga, vimalaYoga,
  // Challenging
  kemadruma, guruChandal, grahanYogaSun, grahanYogaMoon, papakartariYoga,
];

/** Evaluate all yoga rules against a chart context */
export function detectAllYogas(ctx: ChartContext): YogaResult[] {
  const results: YogaResult[] = [];
  for (const rule of YOGA_RULES) {
    try {
      const result = rule.evaluate(ctx);
      if (result) results.push(result);
    } catch {
      // Skip rule on error — don't crash the engine
    }
  }
  return results;
}
