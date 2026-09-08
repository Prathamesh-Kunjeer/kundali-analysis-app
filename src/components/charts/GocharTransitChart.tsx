import React from 'react';
import { PlanetaryPosition, PlanetName } from '../../types/astrology';
import { calculateAllPlanets } from '../../engine/astronomy';
import { getRashiFromDegree, formatDegreeInSign } from '../../utils/formatting';
import { PLANETS_DATA, RASHIS } from '../../data/constants';

interface GocharTransitChartProps {
  natalPlanets: PlanetaryPosition[];
  natalAscendant: PlanetaryPosition;
}

export const GocharTransitChart: React.FC<GocharTransitChartProps> = ({
  natalPlanets,
  natalAscendant
}) => {
  // Calculate today's live planetary transit
  const now = new Date();
  const rawTransit = calculateAllPlanets(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    natalAscendant.longitude, // or standard coordinates
    77.2090, // default center
    5.5
  );

  const transitPlanets: { name: PlanetName; rashiNumber: number; rashiName: string; degree: string; houseFromLagna: number }[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'
  ].map(pName => {
    const raw = rawTransit.planets[pName as PlanetName];
    const rashi = getRashiFromDegree(raw.siderealLon);
    const houseFromLagna = ((rashi.number - natalAscendant.rashiNumber + 12) % 12) + 1;
    return {
      name: pName as PlanetName,
      rashiNumber: rashi.number,
      rashiName: rashi.name,
      degree: formatDegreeInSign(raw.siderealLon),
      houseFromLagna
    };
  });

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 className="text-gold-gradient" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
            Live Planetary Transit (Gochar) Overlay
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Current planetary transits active over your natal Lagna ({natalAscendant.rashi})
          </p>
        </div>
        <span className="badge-gold">Live {now.toLocaleDateString()}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {transitPlanets.map((tp) => {
          const natalP = natalPlanets.find(p => p.name === tp.name);
          const pData = PLANETS_DATA[tp.name];
          const isBeneficTransit = [1, 3, 6, 9, 10, 11].includes(tp.houseFromLagna);

          return (
            <div
              key={tp.name}
              style={{
                background: 'rgba(9, 14, 33, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `${pData.color}22`,
                    border: `1px solid ${pData.color}66`,
                    color: pData.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                >
                  {pData.symbol}
                </span>
                <div>
                  <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.92rem' }}>
                    {pData.sanskritName} ({tp.name})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    In {tp.rashiName} ({tp.degree})
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: isBeneficTransit ? '#10b981' : '#f59e0b'
                  }}
                >
                  House {tp.houseFromLagna}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Natal: H{natalP?.house || 1}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
