import { DashaPeriod, PlanetName, VimshottariDashaResult } from '../types/astrology';
import { DASHA_ORDER, PLANETS_DATA } from '../data/constants';
import { getNakshatraFromDegree } from '../utils/formatting';

// Helper to add years and days to a Date object
function addTime(date: Date, years: number): Date {
  const ms = date.getTime() + years * 365.25 * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculates full 120-year Vimshottari Dasha, Antardasha, and Pratyantardasha
 */
export function calculateVimshottariDasha(
  moonLongitude: number,
  birthDateString: string, // YYYY-MM-DD
  birthTimeString: string // HH:MM
): VimshottariDashaResult {
  const nakshatra = getNakshatraFromDegree(moonLongitude);
  const nakshatraSpan = 360.0 / 27.0; // 13.33333333°
  const posInNakshatra = ((moonLongitude % 360) + 360) % 360 - (nakshatra.number - 1) * nakshatraSpan;

  const fractionElapsed = posInNakshatra / nakshatraSpan;
  const fractionRemaining = 1.0 - fractionElapsed;

  const startLord = nakshatra.lord;
  const startLordIndex = DASHA_ORDER.indexOf(startLord);
  const totalLordYears = PLANETS_DATA[startLord].vimshottariYears;

  const balanceYearsFloat = fractionRemaining * totalLordYears;
  const balanceYears = Math.floor(balanceYearsFloat);
  const balanceMonthsFloat = (balanceYearsFloat - balanceYears) * 12;
  const balanceMonths = Math.floor(balanceMonthsFloat);
  const balanceDays = Math.round((balanceMonthsFloat - balanceMonths) * 30.4375);

  const [bYear, bMonth, bDay] = birthDateString.split('-').map(Number);
  const [bHour, bMin] = birthTimeString.split(':').map(Number);
  const birthDateTime = new Date(Date.UTC(bYear, bMonth - 1, bDay, bHour || 12, bMin || 0));

  const now = new Date();
  const mahadashas: DashaPeriod[] = [];

  let currentStartDate = new Date(birthDateTime.getTime());
  let currentMahadasha: DashaPeriod | null = null;
  let currentAntardasha: DashaPeriod | null = null;
  let currentPratyantardasha: DashaPeriod | null = null;

  for (let i = 0; i < 9; i++) {
    const lordIndex = (startLordIndex + i) % 9;
    const planet = DASHA_ORDER[lordIndex];
    const fullYears = PLANETS_DATA[planet].vimshottariYears;
    const duration = i === 0 ? balanceYearsFloat : fullYears;

    const endDate = addTime(currentStartDate, duration);
    const isCurrentMaha = now >= currentStartDate && now < endDate;

    // Calculate 9 Antardashas for this Mahadasha
    const antardashas: DashaPeriod[] = [];
    let antarStartDate = new Date(currentStartDate.getTime());

    for (let a = 0; a < 9; a++) {
      const antarLordIndex = (lordIndex + a) % 9;
      const antarPlanet = DASHA_ORDER[antarLordIndex];
      const antarYears = (fullYears * PLANETS_DATA[antarPlanet].vimshottariYears) / 120.0;

      // Adjust first mahadasha proportional antardashas if starting mid-cycle
      const actualAntarDuration = i === 0 ? (antarYears * balanceYearsFloat) / fullYears : antarYears;
      const antarEndDate = addTime(antarStartDate, actualAntarDuration);
      const isCurrentAntar = now >= antarStartDate && now < antarEndDate;

      // Calculate Pratyantardashas for current or detailed antardasha
      const pratyantardashas: DashaPeriod[] = [];
      let pratStartDate = new Date(antarStartDate.getTime());

      for (let p = 0; p < 9; p++) {
        const pratLordIndex = (antarLordIndex + p) % 9;
        const pratPlanet = DASHA_ORDER[pratLordIndex];
        const pratYears = (antarYears * PLANETS_DATA[pratPlanet].vimshottariYears) / 120.0;
        const pratEndDate = addTime(pratStartDate, pratYears);
        const isCurrentPrat = now >= pratStartDate && now < pratEndDate;

        const pratPeriod: DashaPeriod = {
          planet: pratPlanet,
          sanskritName: PLANETS_DATA[pratPlanet].sanskritName,
          startDate: formatDate(pratStartDate),
          endDate: formatDate(pratEndDate),
          durationYears: pratYears,
          isCurrent: isCurrentPrat
        };

        pratyantardashas.push(pratPeriod);
        if (isCurrentPrat && isCurrentAntar && isCurrentMaha) {
          currentPratyantardasha = pratPeriod;
        }

        pratStartDate = pratEndDate;
      }

      const antarPeriod: DashaPeriod = {
        planet: antarPlanet,
        sanskritName: PLANETS_DATA[antarPlanet].sanskritName,
        startDate: formatDate(antarStartDate),
        endDate: formatDate(antarEndDate),
        durationYears: actualAntarDuration,
        isCurrent: isCurrentAntar,
        subSubPeriods: pratyantardashas
      };

      antardashas.push(antarPeriod);
      if (isCurrentAntar && isCurrentMaha) {
        currentAntardasha = antarPeriod;
      }

      antarStartDate = antarEndDate;
    }

    const mahaPeriod: DashaPeriod = {
      planet,
      sanskritName: PLANETS_DATA[planet].sanskritName,
      startDate: formatDate(currentStartDate),
      endDate: formatDate(endDate),
      durationYears: duration,
      isCurrent: isCurrentMaha,
      subPeriods: antardashas
    };

    mahadashas.push(mahaPeriod);
    if (isCurrentMaha) {
      currentMahadasha = mahaPeriod;
    }

    currentStartDate = endDate;
  }

  return {
    birthBalance: {
      nakshatraLord: startLord,
      balanceYears,
      balanceMonths,
      balanceDays
    },
    mahadashas,
    currentMahadasha,
    currentAntardasha,
    currentPratyantardasha
  };
}
