import { YogaInfo, PlanetaryPosition, HouseInfo, PlanetName } from '../types/astrology';

/**
 * Detects classical Vedic Astrological Yogas from planetary and house placements
 */
export function detectYogas(
  planets: PlanetaryPosition[],
  houses: HouseInfo[]
): YogaInfo[] {
  const yogas: YogaInfo[] = [];

  const getPlanet = (name: PlanetName) => planets.find(p => p.name === name);
  const getHouse = (num: number) => houses.find(h => h.houseNumber === num);

  const sun = getPlanet('Sun');
  const moon = getPlanet('Moon');
  const mars = getPlanet('Mars');
  const mercury = getPlanet('Mercury');
  const jupiter = getPlanet('Jupiter');
  const venus = getPlanet('Venus');
  const saturn = getPlanet('Saturn');
  const rahu = getPlanet('Rahu');
  const ketu = getPlanet('Ketu');
  const asc = getPlanet('Ascendant');

  const kendras = [1, 4, 7, 10];
  const trikonas = [1, 5, 9];
  const dusthanas = [6, 8, 12];

  // Helper to check if planet is in Kendra from Lagna
  const inKendra = (p?: PlanetaryPosition) => p && kendras.includes(p.house);

  // 1. Pancha Mahapurusha Yogas
  // Ruchaka Yoga (Mars)
  if (mars && inKendra(mars) && ['Own Sign', 'Exalted', 'Moolatrikona'].includes(mars.dignity)) {
    yogas.push({
      id: 'ruchaka',
      name: 'Ruchaka Yoga',
      sanskritName: 'रुचक योग',
      category: 'Mahapurusha Yoga',
      planetsInvolved: ['Mars'],
      housesInvolved: [mars.house],
      description: 'Mars is placed in a Kendra house (1, 4, 7, 10) in its own sign (Aries/Scorpio) or exaltation sign (Capricorn).',
      effects: 'Bestows great physical stamina, courage, leadership, victory over rivals, land acquisition, high military or executive rank.',
      strength: 'Exceptional',
      isAuspicious: true
    });
  }

  // Bhadra Yoga (Mercury)
  if (mercury && inKendra(mercury) && ['Own Sign', 'Exalted', 'Moolatrikona'].includes(mercury.dignity)) {
    yogas.push({
      id: 'bhadra',
      name: 'Bhadra Yoga',
      sanskritName: 'भद्र योग',
      category: 'Mahapurusha Yoga',
      planetsInvolved: ['Mercury'],
      housesInvolved: [mercury.house],
      description: 'Mercury is placed in a Kendra house in Gemini or Virgo.',
      effects: 'Endows sharp intellect, eloquent communication, commercial acumen, diplomatic skills, and mastery of arts and sciences.',
      strength: 'Exceptional',
      isAuspicious: true
    });
  }

  // Hamsa Yoga (Jupiter)
  if (jupiter && inKendra(jupiter) && ['Own Sign', 'Exalted', 'Moolatrikona'].includes(jupiter.dignity)) {
    yogas.push({
      id: 'hamsa',
      name: 'Hamsa Yoga',
      sanskritName: 'हंस योग',
      category: 'Mahapurusha Yoga',
      planetsInvolved: ['Jupiter'],
      housesInvolved: [jupiter.house],
      description: 'Jupiter is placed in a Kendra house in Sagittarius, Pisces, or Cancer.',
      effects: 'Blessed with spiritual wisdom, righteous character, universal respect, academic authority, and divine fortune.',
      strength: 'Exceptional',
      isAuspicious: true
    });
  }

  // Malavya Yoga (Venus)
  if (venus && inKendra(venus) && ['Own Sign', 'Exalted', 'Moolatrikona'].includes(venus.dignity)) {
    yogas.push({
      id: 'malavya',
      name: 'Malavya Yoga',
      sanskritName: 'मालव्य योग',
      category: 'Mahapurusha Yoga',
      planetsInvolved: ['Venus'],
      housesInvolved: [venus.house],
      description: 'Venus is placed in a Kendra house in Taurus, Libra, or Pisces.',
      effects: 'Grants immense charm, artistic talents, luxurious conveyances, joyful married life, prosperity, and magnetic charisma.',
      strength: 'Exceptional',
      isAuspicious: true
    });
  }

  // Sasa Yoga (Saturn)
  if (saturn && inKendra(saturn) && ['Own Sign', 'Exalted', 'Moolatrikona'].includes(saturn.dignity)) {
    yogas.push({
      id: 'sasa',
      name: 'Sasa Yoga',
      sanskritName: 'शश योग',
      category: 'Mahapurusha Yoga',
      planetsInvolved: ['Saturn'],
      housesInvolved: [saturn.house],
      description: 'Saturn is placed in a Kendra house in Capricorn, Aquarius, or Libra.',
      effects: 'Command over masses, enduring authority, judicial discernment, disciplined wealth, and lasting legacy through diligence.',
      strength: 'Exceptional',
      isAuspicious: true
    });
  }

  // 2. Gajakesari Yoga (Jupiter in Kendra from Moon)
  if (jupiter && moon) {
    const distFromMoon = ((jupiter.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(distFromMoon)) {
      yogas.push({
        id: 'gajakesari',
        name: 'Gajakesari Yoga',
        sanskritName: 'गजकेसरी योग',
        category: 'Raja Yoga',
        planetsInvolved: ['Jupiter', 'Moon'],
        housesInvolved: [jupiter.house, moon.house],
        description: 'Jupiter is in a Kendra (1st, 4th, 7th, or 10th) from the Moon.',
        effects: 'Brings immense fame, unyielding courage, intellectual superiority, royal favor, and protection from life calamities.',
        strength: 'Strong',
        isAuspicious: true
      });
    }
  }

  // 3. Budhaditya Yoga (Sun + Mercury conjunction)
  if (sun && mercury && sun.house === mercury.house && !mercury.isCombust) {
    yogas.push({
      id: 'budhaditya',
      name: 'Budhaditya Yoga',
      sanskritName: 'बुधादित्य योग',
      category: 'Auspicious Yoga',
      planetsInvolved: ['Sun', 'Mercury'],
      housesInvolved: [sun.house],
      description: 'Sun and Mercury are conjunct in the same house without combust affliction.',
      effects: 'Gives high administrative skills, sharp analytical mind, executive prestige, scholarly recognition, and commercial flair.',
      strength: 'Strong',
      isAuspicious: true
    });
  }

  // 4. Chandra-Mangal Yoga (Moon + Mars conjunction or mutual aspect)
  if (moon && mars) {
    const isConjunct = moon.house === mars.house;
    const isAspecting = Math.abs(moon.house - mars.house) === 6;
    if (isConjunct || isAspecting) {
      yogas.push({
        id: 'chandra_mangal',
        name: 'Chandra-Mangal (Mahalaxmi) Yoga',
        sanskritName: 'चन्द्र-मंगल योग',
        category: 'Dhana Yoga',
        planetsInvolved: ['Moon', 'Mars'],
        housesInvolved: [moon.house, mars.house],
        description: 'Moon and Mars form conjunction or direct mutual aspect.',
        effects: 'Great wealth generation capacity, entrepreneurial zeal, real estate gains, financial resilience, and bold business tactics.',
        strength: 'Strong',
        isAuspicious: true
      });
    }
  }

  // 5. Amala Yoga (Benefics in 10th from Lagna or Moon)
  const tenthFromLagna = 10;
  const beneficsInTenth = [jupiter, venus, mercury].filter(p => p && p.house === tenthFromLagna);
  if (beneficsInTenth.length > 0) {
    yogas.push({
      id: 'amala',
      name: 'Amala Yoga',
      sanskritName: 'अमला योग',
      category: 'Auspicious Yoga',
      planetsInvolved: beneficsInTenth.map(p => p!.name),
      housesInvolved: [10],
      description: 'Natural benefic planet (Jupiter, Venus, or Mercury) occupies the 10th house of career.',
      effects: 'Unblemished reputation, benevolent governance, moral authority, enduring fame, and success in noble professions.',
      strength: 'Strong',
      isAuspicious: true
    });
  }

  // 6. Dhana Yoga (Lord of 2nd/11th/5th/9th associations)
  const h2 = getHouse(2);
  const h11 = getHouse(11);
  const h9 = getHouse(9);
  if (h2 && h11) {
    const lord2 = getPlanet(h2.rashiLord);
    const lord11 = getPlanet(h11.rashiLord);
    if (lord2 && lord11 && (lord2.house === lord11.house || lord2.house === 11 || lord11.house === 2)) {
      yogas.push({
        id: 'dhana_2_11',
        name: 'Maha Dhana Yoga',
        sanskritName: 'महाधन योग',
        category: 'Dhana Yoga',
        planetsInvolved: [h2.rashiLord, h11.rashiLord],
        housesInvolved: [2, 11],
        description: 'Lord of the 2nd house of wealth combines or mutually aspects the Lord of the 11th house of gains.',
        effects: 'Extraordinary capacity for accumulating assets, multiple income streams, financial freedom, and abundant fortunes.',
        strength: 'Exceptional',
        isAuspicious: true
      });
    }
  }

  // 7. Vipareeta Raja Yogas
  // Harsha Yoga (6th lord in 6, 8, or 12)
  const h6 = getHouse(6);
  if (h6) {
    const lord6 = getPlanet(h6.rashiLord);
    if (lord6 && dusthanas.includes(lord6.house)) {
      yogas.push({
        id: 'harsha',
        name: 'Harsha Yoga (Vipareeta Raja Yoga)',
        sanskritName: 'हर्ष योग (विपरीत राजयोग)',
        category: 'Raja Yoga',
        planetsInvolved: [h6.rashiLord],
        housesInvolved: [lord6.house],
        description: '6th lord is placed in a Dusthana (6th, 8th, or 12th house).',
        effects: 'Triumph over enemies, physical immunity from severe diseases, sudden turns of fortune, and unexpected windfalls during crises.',
        strength: 'Moderate',
        isAuspicious: true
      });
    }
  }

  // Sarala Yoga (8th lord in 6, 8, or 12)
  const h8 = getHouse(8);
  if (h8) {
    const lord8 = getPlanet(h8.rashiLord);
    if (lord8 && dusthanas.includes(lord8.house)) {
      yogas.push({
        id: 'sarala',
        name: 'Sarala Yoga (Vipareeta Raja Yoga)',
        sanskritName: 'सरल योग (विपरीत राजयोग)',
        category: 'Raja Yoga',
        planetsInvolved: [h8.rashiLord],
        housesInvolved: [lord8.house],
        description: '8th lord is placed in a Dusthana house.',
        effects: 'Fearlessness, victory in litigation, scholarly depth, longevity, and rise to prosperity after sudden transformations.',
        strength: 'Moderate',
        isAuspicious: true
      });
    }
  }

  // Vimala Yoga (12th lord in 6, 8, or 12)
  const h12 = getHouse(12);
  if (h12) {
    const lord12 = getPlanet(h12.rashiLord);
    if (lord12 && dusthanas.includes(lord12.house)) {
      yogas.push({
        id: 'vimala',
        name: 'Vimala Yoga (Vipareeta Raja Yoga)',
        sanskritName: 'विमल योग (विपरीत राजयोग)',
        category: 'Raja Yoga',
        planetsInvolved: [h12.rashiLord],
        housesInvolved: [lord12.house],
        description: '12th lord is placed in a Dusthana house.',
        effects: 'Independence, frugal management of expenses, noble conduct, and flourishing in overseas endeavors.',
        strength: 'Moderate',
        isAuspicious: true
      });
    }
  }

  // 8. Guru Chandal Yoga (Jupiter conjunct Rahu/Ketu)
  if (jupiter && rahu && jupiter.house === rahu.house) {
    yogas.push({
      id: 'guru_chandal',
      name: 'Guru Chandal Yoga',
      sanskritName: 'गुरु चांडाल योग',
      category: 'Inauspicious Yoga',
      planetsInvolved: ['Jupiter', 'Rahu'],
      housesInvolved: [jupiter.house],
      description: 'Jupiter is conjunct Rahu in the same house.',
      effects: 'Unconventional belief systems, questioning orthodoxy, potential conflict with mentors, and need for ethical vigilance.',
      strength: 'Moderate',
      isAuspicious: false
    });
  }

  // 9. Grahan Yoga (Sun or Moon with Rahu or Ketu)
  if ((sun && rahu && sun.house === rahu.house) || (sun && ketu && sun.house === ketu.house)) {
    yogas.push({
      id: 'surya_grahan',
      name: 'Surya Grahan Yoga',
      sanskritName: 'सूर्य ग्रहण योग',
      category: 'Inauspicious Yoga',
      planetsInvolved: ['Sun', 'Rahu'],
      housesInvolved: [sun.house],
      description: 'Sun is eclipsed by conjunction with Rahu or Ketu.',
      effects: 'Fluctuations in confidence, complex relations with father or superiors; remedies like Aditya Hridaya Stotra advised.',
      strength: 'Moderate',
      isAuspicious: false
    });
  }

  if ((moon && rahu && moon.house === rahu.house) || (moon && ketu && moon.house === ketu.house)) {
    yogas.push({
      id: 'chandra_grahan',
      name: 'Chandra Grahan Yoga',
      sanskritName: 'चन्द्र ग्रहण योग',
      category: 'Inauspicious Yoga',
      planetsInvolved: ['Moon', 'Rahu'],
      housesInvolved: [moon.house],
      description: 'Moon is conjunct Rahu or Ketu.',
      effects: 'Overactive imagination, heightened psychic intuition, mood sensitivity; meditation and Shiva worship recommended.',
      strength: 'Moderate',
      isAuspicious: false
    });
  }

  // 10. Kemadruma Yoga (No planet in 2nd and 12th from Moon, excluding Sun/Rahu/Ketu)
  if (moon) {
    const h2FromMoon = ((moon.house) % 12) + 1;
    const h12FromMoon = ((moon.house - 2 + 12) % 12) + 1;
    const planetsInAdjacent = planets.filter(p => 
      !['Sun', 'Moon', 'Rahu', 'Ketu', 'Ascendant'].includes(p.name) &&
      (p.house === h2FromMoon || p.house === h12FromMoon)
    );

    if (planetsInAdjacent.length === 0) {
      // Check cancellation: Jupiter in Kendra from Lagna/Moon cancels Kemadruma
      const jupDist = jupiter ? ((jupiter.house - moon.house + 12) % 12) + 1 : 0;
      const isCancelled = [1, 4, 7, 10].includes(jupDist);

      if (!isCancelled) {
        yogas.push({
          id: 'kemadruma',
          name: 'Kemadruma Yoga',
          sanskritName: 'केमद्रुम योग',
          category: 'Inauspicious Yoga',
          planetsInvolved: ['Moon'],
          housesInvolved: [moon.house],
          description: 'No planet resides in the 2nd or 12th house from the Moon.',
          effects: 'Periods of psychological solitude, self-reliance required in life struggles; mitigated through devotion to Goddess Lakshmi.',
          strength: 'Mild',
          isAuspicious: false
        });
      }
    }
  }

  return yogas;
}
