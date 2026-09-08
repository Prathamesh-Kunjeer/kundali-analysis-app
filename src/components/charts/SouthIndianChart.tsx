import React from 'react';
import { DivisionalChart, PlanetName } from '../../types/astrology';
import { PLANETS_DATA, RASHIS } from '../../data/constants';

interface SouthIndianChartProps {
  chart: DivisionalChart;
  onHouseClick?: (houseNum: number) => void;
}

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({
  chart,
  onHouseClick
}) => {
  // Fixed South Indian sign coordinates on 4x4 grid
  // (col: 0..3, row: 0..3)
  const signGridPositions: Record<number, { col: number; row: number }> = {
    12: { col: 0, row: 0 }, // Pisces (Meena)
    1:  { col: 1, row: 0 }, // Aries (Mesha)
    2:  { col: 2, row: 0 }, // Taurus (Vrishabha)
    3:  { col: 3, row: 0 }, // Gemini (Mithuna)
    4:  { col: 3, row: 1 }, // Cancer (Karka)
    5:  { col: 3, row: 2 }, // Leo (Simha)
    6:  { col: 3, row: 3 }, // Virgo (Kanya)
    7:  { col: 2, row: 3 }, // Libra (Tula)
    8:  { col: 1, row: 3 }, // Scorpio (Vrishchika)
    9:  { col: 0, row: 3 }, // Sagittarius (Dhanu)
    10: { col: 0, row: 2 }, // Capricorn (Makara)
    11: { col: 0, row: 1 }  // Aquarius (Kumbha)
  };

  const getPlanetShort = (name: PlanetName): string => {
    const map: Record<string, string> = {
      Sun: 'Su (सू)', Moon: 'Mo (चं)', Mars: 'Ma (मं)', Mercury: 'Me (बु)',
      Jupiter: 'Ju (गु)', Venus: 'Ve (शु)', Saturn: 'Sa (श)', Rahu: 'Ra (रा)',
      Ketu: 'Ke (के)', Ascendant: 'ASC'
    };
    return map[name] || name;
  };

  const boxSize = 100;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      <svg
        viewBox="0 0 400 400"
        className="chart-svg"
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #090e21 0%, #060814 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(212, 175, 55, 0.1)',
          border: '2px solid rgba(212, 175, 55, 0.4)'
        }}
      >
        {/* Outer Square & 4x4 Grid */}
        <rect x="0" y="0" width="400" height="400" fill="none" stroke="#d4af37" strokeWidth="2" />

        {/* Horizontal grid lines */}
        <line x1="0" y1="100" x2="400" y2="100" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.75" />
        <line x1="0" y1="300" x2="400" y2="300" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.75" />
        <line x1="0" y1="200" x2="100" y2="200" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.75" />
        <line x1="300" y1="200" x2="400" y2="200" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.75" />

        {/* Vertical grid lines */}
        <line x1="100" y1="0" x2="100" y2="400" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.75" />
        <line x1="300" y1="0" x2="300" y2="400" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.75" />
        <line x1="200" y1="0" x2="200" y2="100" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.75" />
        <line x1="200" y1="300" x2="200" y2="400" stroke="#d4af37" strokeWidth="1.2" strokeOpacity="0.75" />

        {/* Center 2x2 Box Content */}
        <rect x="100" y="100" width="200" height="200" fill="rgba(212, 175, 55, 0.05)" />
        <text x="200" y="185" textAnchor="middle" fill="#d4af37" fontSize="13" fontWeight="700" fontFamily="Cinzel, serif">
          {chart.sanskritTitle}
        </text>
        <text x="200" y="205" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Plus Jakarta Sans, sans-serif">
          South Indian Grid System
        </text>
        <text x="200" y="225" textAnchor="middle" fill="#f5e7a9" fontSize="10" fontWeight="600">
          Lagna: {RASHIS[chart.ascendantRashiNumber - 1]?.sanskritName} ({chart.ascendantRashiNumber})
        </text>

        {/* 12 Signs (Rashi boxes) */}
        {Object.entries(signGridPositions).map(([rNumStr, pos]) => {
          const rNum = Number(rNumStr);
          const x = pos.col * boxSize;
          const y = pos.row * boxSize;
          const rashi = RASHIS[rNum - 1];

          // Find house in chart matching this rashi
          const house = chart.houses.find(h => h.rashiNumber === rNum);
          const isAscendantSign = chart.ascendantRashiNumber === rNum;

          return (
            <g
              key={rNum}
              onClick={() => house && onHouseClick && onHouseClick(house.houseNumber)}
              style={{ cursor: 'pointer' }}
            >
              {/* Highlight background if Ascendant */}
              {isAscendantSign && (
                <>
                  <rect x={x} y={y} width={boxSize} height={boxSize} fill="rgba(212, 175, 55, 0.15)" />
                  {/* Classical South Indian diagonal corner mark for Ascendant */}
                  <line x1={x} y1={y} x2={x + 30} y2={y + 30} stroke="#d4af37" strokeWidth="2" />
                </>
              )}

              {/* Rashi Name / Sanskrit indicator */}
              <text
                x={x + 6}
                y={y + 14}
                fill="#d4af37"
                fontSize="9"
                fontWeight="700"
                fontFamily="Outfit, sans-serif"
                opacity={0.8}
              >
                {rashi.sanskritName.slice(0, 4)} ({rNum})
              </text>

              {/* House Number badge if available */}
              {house && (
                <text
                  x={x + boxSize - 6}
                  y={y + 14}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="8"
                  fontWeight="600"
                >
                  H{house.houseNumber}
                </text>
              )}

              {/* Ascendant banner if in this sign */}
              {isAscendantSign && (
                <text
                  x={x + boxSize / 2}
                  y={y + 30}
                  textAnchor="middle"
                  fill="#f5e7a9"
                  fontSize="9"
                  fontWeight="800"
                >
                  ASC / लग्न
                </text>
              )}

              {/* Planets in this Rashi */}
              {house && house.planets.map((p, idx) => {
                const total = house.planets.length;
                const offsetStep = 13;
                const startY = y + (isAscendantSign ? 44 : 32) + idx * offsetStep;
                const color = PLANETS_DATA[p.name]?.color || '#ffffff';

                return (
                  <text
                    key={p.name}
                    x={x + boxSize / 2}
                    y={startY}
                    textAnchor="middle"
                    fill={color}
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {getPlanetShort(p.name)}
                    {p.isRetrograde && (
                      <tspan fill="#f59e0b" fontSize="7.5" fontWeight="800">
                        {' '}[R]
                      </tspan>
                    )}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
