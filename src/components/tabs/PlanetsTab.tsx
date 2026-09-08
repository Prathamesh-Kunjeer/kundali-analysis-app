import React from 'react';
import { FullKundaliAnalysis } from '../../types/astrology';
import { PLANETS_DATA, RASHIS } from '../../data/constants';
import { Sparkles, Compass, Shield, Zap } from 'lucide-react';

interface PlanetsTabProps {
  data: FullKundaliAnalysis;
}

export const PlanetsTab: React.FC<PlanetsTabProps> = ({ data }) => {
  const allPlanetsWithAsc = [data.ascendant, ...data.planets];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Planetary Positions Table Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 className="text-gold-gradient" style={{ fontSize: '1.35rem', marginBottom: '4px' }}>
              Planetary Positions & Graha Dignities (ग्रह स्थिति)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Precise sidereal longitudes, Nakshatras, Baladi Avasthas, and dignities under Lahiri Ayanamsha ({data.formattedAyanamsa})
            </p>
          </div>
          <span className="badge-gold">9 Grahas + Lagna</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(212, 175, 55, 0.4)', color: '#f3e5ab' }}>
                <th style={{ padding: '10px 12px' }}>Planet</th>
                <th style={{ padding: '10px 12px' }}>Sign (Rashi)</th>
                <th style={{ padding: '10px 12px' }}>House</th>
                <th style={{ padding: '10px 12px' }}>Degree</th>
                <th style={{ padding: '10px 12px' }}>Nakshatra</th>
                <th style={{ padding: '10px 12px' }}>Pada</th>
                <th style={{ padding: '10px 12px' }}>Nak Lord</th>
                <th style={{ padding: '10px 12px' }}>Navamsha (D9)</th>
                <th style={{ padding: '10px 12px' }}>Dignity</th>
                <th style={{ padding: '10px 12px' }}>Avastha</th>
              </tr>
            </thead>
            <tbody>
              {allPlanetsWithAsc.map((p) => {
                const pData = PLANETS_DATA[p.name];
                return (
                  <tr
                    key={p.name}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Planet Name */}
                    <td style={{ padding: '12px', fontWeight: '700', color: pData.color }}>
                      <span style={{ marginRight: '6px' }}>{pData.symbol}</span>
                      {p.sanskritName} ({p.name})
                      {p.isRetrograde && <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}> [R]</span>}
                      {p.isCombust && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}> *</span>}
                    </td>

                    {/* Sign */}
                    <td style={{ padding: '12px', color: '#f8fafc' }}>
                      {p.rashi} ({p.rashiNumber})
                    </td>

                    {/* House */}
                    <td style={{ padding: '12px', fontWeight: '700', color: '#d4af37' }}>
                      H{p.house}
                    </td>

                    {/* Degree in Sign */}
                    <td style={{ padding: '12px', fontFamily: 'Outfit, monospace', color: '#cbd5e1' }}>
                      {p.formattedDegree}
                    </td>

                    {/* Nakshatra */}
                    <td style={{ padding: '12px', color: '#f8fafc' }}>
                      {p.nakshatra}
                    </td>

                    {/* Pada */}
                    <td style={{ padding: '12px', color: '#f3e5ab', fontWeight: '600' }}>
                      Pada {p.pada}
                    </td>

                    {/* Nakshatra Lord */}
                    <td style={{ padding: '12px', color: '#94a3b8' }}>
                      {p.nakshatraLord}
                    </td>

                    {/* Navamsha */}
                    <td style={{ padding: '12px', color: '#93c5fd' }}>
                      {p.navamshaRashi} ({p.navamshaRashiNumber})
                    </td>

                    {/* Dignity Badge */}
                    <td style={{ padding: '12px' }}>
                      <span
                        className={
                          p.dignity === 'Exalted' || p.dignity === 'Own Sign' || p.dignity === 'Moolatrikona'
                            ? 'badge-emerald'
                            : p.dignity === 'Debilitated' || p.dignity === 'Enemy' || p.dignity === 'Great Enemy'
                            ? 'badge-ruby'
                            : 'badge-gold'
                        }
                      >
                        {p.dignity}
                      </span>
                    </td>

                    {/* Avastha */}
                    <td style={{ padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {p.avastha.split('-')[0]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ashtakavarga Matrix Table Card */}
      <div className="glass-card-gold" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 className="text-gold-gradient" style={{ fontSize: '1.35rem', marginBottom: '4px' }}>
              Sarvashtakavarga (SAV) Matrix & Strength Chart
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Classical Parashari Ashtakavarga benefic bindus across all 12 Bhavas (Benchmark: 28+ points is auspicious)
            </p>
          </div>
          <span className="badge-gold">Total: {data.ashtakavarga.totalSavPoints} Points</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'center' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(212, 175, 55, 0.4)', color: '#f3e5ab' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Graha</th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                  <th key={h} style={{ padding: '8px 10px' }}>H{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.ashtakavarga.bav.map((bav) => {
                const pData = PLANETS_DATA[bav.planet];
                return (
                  <tr key={bav.planet} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px', textAlign: 'left', fontWeight: '700', color: pData.color }}>
                      {pData.sanskritName} ({bav.planet})
                    </td>
                    {bav.points.map((pt, idx) => (
                      <td
                        key={idx}
                        style={{
                          padding: '8px',
                          color: pt >= 5 ? '#6ee7b7' : (pt <= 2 ? '#fca5a5' : '#cbd5e1'),
                          fontWeight: pt >= 5 ? '700' : 'normal'
                        }}
                      >
                        {pt}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {/* Total SAV Row */}
              <tr
                style={{
                  borderTop: '2px solid rgba(212, 175, 55, 0.5)',
                  background: 'rgba(212, 175, 55, 0.1)',
                  fontWeight: '800'
                }}
              >
                <td style={{ padding: '12px 10px', textAlign: 'left', color: '#f5e7a9', fontSize: '0.95rem' }}>
                  Total SAV Points
                </td>
                {data.ashtakavarga.sav.map((totalPt, idx) => (
                  <td
                    key={idx}
                    style={{
                      padding: '12px 8px',
                      fontSize: '0.95rem',
                      color: totalPt >= 28 ? '#10b981' : (totalPt < 25 ? '#ef4444' : '#f59e0b')
                    }}
                  >
                    {totalPt}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.78rem', color: '#94a3b8' }}>
          <span><strong style={{ color: '#10b981' }}>28+ Points:</strong> Strong & Auspicious House</span>
          <span><strong style={{ color: '#f59e0b' }}>25 - 27 Points:</strong> Moderate Energy</span>
          <span><strong style={{ color: '#ef4444' }}>&lt; 25 Points:</strong> Requires conscious effort</span>
        </div>
      </div>
    </div>
  );
};
