// ============================================================
//  VIMSHOTTARI DASHA ENGINE — Extensible Dasha system
//  Layer 2 (pure astrological rules, no UI)
// ============================================================

import { DASHA_ORDER, VIMSHOTTARI_YEARS, PLANET_LABELS } from './constants';
import { getNakshatraFractionElapsed } from './nakshatras';
import type { DashaChart, DashaBalance, DashaPeriod, Planet, BodyPlanet } from './models';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function addYearsMs(date: Date, years: number): Date {
  return new Date(date.getTime() + years * 365.25 * 24 * 60 * 60 * 1000);
}

function buildAntardasha(
  mahaLord: Planet,
  mahaLordIndex: number,
  mahaDuration: number,
  mahaStart: Date,
  now: Date,
  isFirstMaha: boolean,
  balanceFraction: number
): DashaPeriod[] {
  const antardashas: DashaPeriod[] = [];
  let antarStart = new Date(mahaStart.getTime());

  for (let a = 0; a < 9; a++) {
    const antarLordIndex = (mahaLordIndex + a) % 9;
    const antarLord = DASHA_ORDER[antarLordIndex];
    const fullAntarYears = (VIMSHOTTARI_YEARS[mahaLord as BodyPlanet] * VIMSHOTTARI_YEARS[antarLord as BodyPlanet]) / 120.0;
    // First mahadasha's antardashas are proportional to the remaining balance
    const antarDuration = isFirstMaha ? fullAntarYears * balanceFraction : fullAntarYears;
    const antarEnd = addYearsMs(antarStart, antarDuration);
    const isCurrent = now >= antarStart && now < antarEnd;

    // Build Pratyantardasha only for the current antardasha
    const pratyantardashas: DashaPeriod[] = [];
    if (isCurrent) {
      let pratStart = new Date(antarStart.getTime());
      for (let p = 0; p < 9; p++) {
        const pratLordIndex = (antarLordIndex + p) % 9;
        const pratLord = DASHA_ORDER[pratLordIndex];
        const pratYears = (fullAntarYears * VIMSHOTTARI_YEARS[pratLord]) / 120.0;
        const pratEnd = addYearsMs(pratStart, pratYears);
        pratyantardashas.push({
          planet: pratLord,
          planetLabel: `${PLANET_LABELS[pratLord].english} (${PLANET_LABELS[pratLord].sanskrit})`,
          startDate: new Date(pratStart.getTime()),
          endDate: pratEnd,
          durationYears: pratYears,
          isCurrent: now >= pratStart && now < pratEnd,
          antardasha: [],
        });
        pratStart = pratEnd;
      }
    }

    antardashas.push({
      planet: antarLord,
      planetLabel: `${PLANET_LABELS[antarLord].english} (${PLANET_LABELS[antarLord].sanskrit})`,
      startDate: new Date(antarStart.getTime()),
      endDate: antarEnd,
      durationYears: antarDuration,
      isCurrent,
      antardasha: pratyantardashas,
    });
    antarStart = antarEnd;
  }
  return antardashas;
}

// ─── Main Vimshottari Dasha Calculator ───────────────────────────────────────

/**
 * Calculates the full Vimshottari Dasha chart.
 * Design is extensible: this function can be wrapped in a DashaSystem interface
 * to allow Yogini, Kalachakra or other systems to be plugged in with same interface.
 */
export function calculateVimshottariDasha(
  moonLongitude: number,
  birthDate: Date
): DashaChart {
  const { nakshatra, fractionElapsed, fractionRemaining } = getNakshatraFractionElapsed(moonLongitude);

  const startLord = nakshatra.lord;
  const startLordIndex = DASHA_ORDER.indexOf(startLord);
  const totalLordYears = VIMSHOTTARI_YEARS[startLord];

  const balanceYearsFloat = fractionRemaining * totalLordYears;
  const balanceYears = Math.floor(balanceYearsFloat);
  const balanceMonthsF = (balanceYearsFloat - balanceYears) * 12;
  const balanceMonths = Math.floor(balanceMonthsF);
  const balanceDays = Math.round((balanceMonthsF - balanceMonths) * 30.4375);

  const balance: DashaBalance = {
    nakshatraLord: startLord,
    balanceYears,
    balanceMonths,
    balanceDays,
    totalBalanceDays: Math.round(balanceYearsFloat * 365.25),
  };

  const now = new Date();
  const mahadashas: DashaPeriod[] = [];
  let currentMahadasha: DashaPeriod | null = null;
  let currentAntardasha: DashaPeriod | null = null;
  let currentPratyantardasha: DashaPeriod | null = null;

  let mahaStart = new Date(birthDate.getTime());
  const balanceFraction = fractionRemaining; // for proportional antardashas in first Maha

  for (let i = 0; i < 9; i++) {
    const lordIndex = (startLordIndex + i) % 9;
    const lord = DASHA_ORDER[lordIndex];
    const duration = i === 0 ? balanceYearsFloat : VIMSHOTTARI_YEARS[lord];
    const mahaEnd = addYearsMs(mahaStart, duration);
    const isCurrent = now >= mahaStart && now < mahaEnd;

    const antardashas = buildAntardasha(
      lord, lordIndex, duration, mahaStart, now,
      i === 0, i === 0 ? balanceFraction : 1.0
    );

    const mahaPeriod: DashaPeriod = {
      planet: lord,
      planetLabel: `${PLANET_LABELS[lord].english} (${PLANET_LABELS[lord].sanskrit})`,
      startDate: new Date(mahaStart.getTime()),
      endDate: mahaEnd,
      durationYears: duration,
      isCurrent,
      antardasha: antardashas,
    };

    mahadashas.push(mahaPeriod);

    if (isCurrent) {
      currentMahadasha = mahaPeriod;
      const curAntar = antardashas.find(a => a.isCurrent) || null;
      currentAntardasha = curAntar;
      if (curAntar) {
        currentPratyantardasha = curAntar.antardasha.find(p => p.isCurrent) || null;
      }
    }
    mahaStart = mahaEnd;
  }

  return {
    system: 'Vimshottari',
    birthBalance: balance,
    mahadashas,
    currentMahadasha,
    currentAntardasha,
    currentPratyantardasha,
  };
}
