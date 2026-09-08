import React, { useState } from 'react';
import { DivisionalChart, PlanetName } from '../../types/astrology';
import { PLANETS_DATA } from '../../data/constants';

interface NorthIndianChartProps {
  chart: DivisionalChart;
  highlightHouse?: number;
  onHouseClick?: (houseNum: number) => void;
}

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  chart,
  highlightHouse,
  onHouseClick
}) => {
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  // House centers & text anchor positions in 400x400 canvas
  const houseCentroids: Record<number, { x: number; y: number; rashiX: number; rashiY: number }> = {
    1: { x: 200, y: 110, rashiX: 200, rashiY: 70 },
    2: { x: 100, y: 45, rashiX: 100, rashiY: 25 },
    3: { x: 45, y: 100, rashiX: 25, rashiY: 100 },
    4: { x: 110, y: 200, rashiX: 70, rashiY: 200 },
    5: { x: 45, y: 300, rashiX: 25, rashiY: 300 },
    6: { x: 100, y: 355, rashiX: 100, rashiY: 375 },
    7: { x: 200, y: 290, rashiX: 200, rashiY: 330 },
    8: { x: 300, y: 355, rashiX: 300, rashiY: 375 },
    9: { x: 355, y: 300, rashiX: 375, rashiY: 300 },
    10: { x: 290, y: 200, rashiX: 330, rashiY: 200 },
    11: { x: 355, y: 100, rashiX: 375, rashiY: 100 },
    12: { x: 300, y: 45, rashiX: 300, rashiY: 25 }
  };

  // 12 House polygon points in 400x400 coordinate space
  const housePolygons: Record<number, string> = {
    1: '200,0 300,100 200,200 100,100',
    2: '0,0 200,0 100,100',
    3: '0,0 0,200 100,100',
    4: '0,200 100,100 200,200 100,300',
    5: '0,200 0,400 100,300',
    6: '0,400 200,400 100,300',
    7: '200,400 100,300 200,200 300,300',
    8: '200,400 400,400 300,300',
    9: '400,200 400,400 300,300',
    10: '400,200 300,300 200,200 300,100',
    11: '400,0 400,200 300,100',
    12: '200,0 400,0 300,100'
  };

  const getPlanetShort = (name: PlanetName): string => {
    const map: Record<string, string> = {
      Sun: 'Su (सू)',
      Moon: 'Mo (चं)',
      Mars: 'Ma (मं)',
      Mercury: 'Me (बु)',
      Jupiter: 'Ju (गु)',
      Venus: 'Ve (शु)',
      Saturn: 'Sa (श)',
      Rahu: 'Ra (रा)',
      Ketu: 'Ke (के)',
      Ascendant: 'ASC (लग्न)'
    };
    return map[name] || name;
  };

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
        {/* Background Grid Lines & Sacred Geometry */}
        <defs>
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="200" cy="200" r="180" fill="url(#goldGlow)" />

        {/* Outer Square & Cross-diagonals */}
        <rect
          x="0"
          y="0"
          width="400"
          height="400"
          fill="none"
          stroke="#d4af37"
          strokeWidth="2"
        />

        {/* 12 House Interactive Polygons */}
        {chart.houses.map((house) => {
          const hNum = house.houseNumber;
          const isHovered = hoveredHouse === hNum;
          const isHighlighted = highlightHouse === hNum;

          return (
            <g
              key={hNum}
              onClick={() => onHouseClick && onHouseClick(hNum)}
              onMouseEnter={() => setHoveredHouse(hNum)}
              onMouseLeave={() => setHoveredHouse(null)}
              style={{ cursor: 'pointer' }}
            >
              <polygon
                points={housePolygons[hNum]}
                fill={
                  isHighlighted
                    ? 'rgba(212, 175, 55, 0.28)'
                    : isHovered
                    ? 'rgba(212, 175, 55, 0.18)'
                    : hNum === 1
                    ? 'rgba(212, 175, 55, 0.08)'
                    : 'transparent'
                }
                stroke="#d4af37"
                strokeWidth={isHovered || isHighlighted ? '2' : '1.2'}
                strokeOpacity={isHovered || isHighlighted ? '1' : '0.75'}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Rashi Number in Roman / Devnagari badge */}
              <text
                x={houseCentroids[hNum].rashiX}
                y={houseCentroids[hNum].rashiY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f5e7a9"
                fontSize="11"
                fontWeight="700"
                fontFamily="Outfit, sans-serif"
                opacity={0.85}
              >
                {house.rashiNumber}
              </text>

              {/* House Number (subtle marker for house 1) */}
              {hNum === 1 && (
                <text
                  x="200"
                  y="28"
                  textAnchor="middle"
                  fill="#d4af37"
                  fontSize="9"
                  fontWeight="600"
                  letterSpacing="1px"
                >
                  LAGNA
                </text>
              )}

              {/* Occupying Planets */}
              {house.planets.map((p, idx) => {
                const total = house.planets.length;
                const offsetStep = 15;
                const startY = houseCentroids[hNum].y - ((total - 1) * offsetStep) / 2;
                const yPos = startY + idx * offsetStep;

                const color = PLANETS_DATA[p.name]?.color || '#f8fafc';

                return (
                  <text
                    key={p.name}
                    x={houseCentroids[hNum].x}
                    y={yPos}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={color}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    style={{ textShadow: `0 0 6px ${color}88` }}
                  >
                    {getPlanetShort(p.name)}
                    {p.isRetrograde && (
                      <tspan fill="#f59e0b" fontSize="8" fontWeight="800">
                        {' '}[R]
                      </tspan>
                    )}
                    {p.isCombust && (
                      <tspan fill="#ef4444" fontSize="8" fontWeight="800">
                        *
                      </tspan>
                    )}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Interactive Legend Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '10px',
          padding: '6px 12px',
          background: 'rgba(13, 18, 36, 0.6)',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: '#94a3b8'
        }}
      >
        <span>
          <strong style={{ color: '#d4af37' }}>{chart.sanskritTitle}</strong>
        </span>
        <span style={{ display: 'flex', gap: '8px' }}>
          <span><strong style={{ color: '#f59e0b' }}>[R]</strong> Retro</span>
          <span><strong style={{ color: '#ef4444' }}>*</strong> Combust</span>
        </span>
      </div>
    </div>
  );
};
