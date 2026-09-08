import React, { useState } from 'react';
import { FullKundaliAnalysis, DashaPeriod } from '../../types/astrology';
import { PLANETS_DATA } from '../../data/constants';
import { Clock, Calendar, ChevronDown, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashaTabProps {
  data: FullKundaliAnalysis;
}

export const DashaTab: React.FC<DashaTabProps> = ({ data }) => {
  const [expandedMaha, setExpandedMaha] = useState<string | null>(
    data.dasha.currentMahadasha?.planet || data.dasha.mahadashas[0].planet
  );
  const [expandedAntar, setExpandedAntar] = useState<string | null>(
    data.dasha.currentAntardasha?.planet || null
  );

  const { birthBalance, mahadashas, currentMahadasha, currentAntardasha, currentPratyantardasha } = data.dasha;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Active Dasha Highlight Card */}
      <div
        className="glass-card-gold"
        style={{
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        <div>
          <span className="badge-gold">Current Cosmic Period</span>
          <h2 className="text-gold-gradient" style={{ fontSize: '1.75rem', marginTop: '6px', marginBottom: '8px' }}>
            {currentMahadasha?.planet} - {currentAntardasha?.planet} - {currentPratyantardasha?.planet}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
            You are currently undergoing the <strong>{currentMahadasha?.planet} Mahadasha</strong> ({currentMahadasha?.sanskritName}) with <strong>{currentAntardasha?.planet} Antardasha</strong> and <strong>{currentPratyantardasha?.planet} Pratyantardasha</strong>.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ background: 'rgba(9, 14, 33, 0.8)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Mahadasha Span</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
              {currentMahadasha?.startDate} to {currentMahadasha?.endDate}
            </div>
          </div>

          <div style={{ background: 'rgba(9, 14, 33, 0.8)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Antardasha Span</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
              {currentAntardasha?.startDate} to {currentAntardasha?.endDate}
            </div>
          </div>

          <div style={{ background: 'rgba(9, 14, 33, 0.8)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Birth Nakshatra Dasha Balance</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f3e5ab' }}>
              {birthBalance.nakshatraLord} Balance: {birthBalance.balanceYears} Y, {birthBalance.balanceMonths} M, {birthBalance.balanceDays} D
            </div>
          </div>
        </div>
      </div>

      {/* 120-Year Vimshottari Mahadasha Timeline */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 className="text-gold-gradient" style={{ fontSize: '1.3rem', marginBottom: '4px' }}>
              120-Year Vimshottari Dasha Cycle
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Click any Mahadasha to expand its 9 Antardashas and Pratyantardashas
            </p>
          </div>
          <span className="badge-gold">9 Mahadashas</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mahadashas.map((maha) => {
            const isExpanded = expandedMaha === maha.planet;
            const pData = PLANETS_DATA[maha.planet];

            return (
              <div
                key={maha.planet}
                style={{
                  background: maha.isCurrent ? 'rgba(212, 175, 55, 0.12)' : 'rgba(9, 14, 33, 0.7)',
                  border: maha.isCurrent ? '1.5px solid var(--border-gold-bright)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Mahadasha Header */}
                <div
                  onClick={() => setExpandedMaha(isExpanded ? null : maha.planet)}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: `${pData.color}22`,
                        border: `1px solid ${pData.color}66`,
                        color: pData.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      {pData.symbol}
                    </span>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc' }}>
                          {maha.planet} ({pData.sanskritName})
                        </span>
                        {maha.isCurrent && <span className="badge-gold">Active Now</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Duration: {maha.durationYears.toFixed(1)} Years ({pData.vimshottariYears} Y Full Cycle)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f3e5ab' }}>
                        {maha.startDate} to {maha.endDate}
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown size={20} color="#d4af37" /> : <ChevronRight size={20} color="#94a3b8" />}
                  </div>
                </div>

                {/* Nested Antardashas */}
                {isExpanded && maha.subPeriods && (
                  <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(212, 175, 55, 0.15)', marginTop: '8px' }}>
                    <h5 style={{ fontSize: '0.82rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '12px 0 10px' }}>
                      9 Antardashas of {maha.planet} Mahadasha
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                      {maha.subPeriods.map((antar) => {
                        const isAntarExpanded = expandedAntar === `${maha.planet}-${antar.planet}`;
                        const antarPData = PLANETS_DATA[antar.planet];

                        return (
                          <div
                            key={antar.planet}
                            style={{
                              background: antar.isCurrent ? 'rgba(212, 175, 55, 0.2)' : 'rgba(15, 22, 45, 0.8)',
                              border: antar.isCurrent ? '1px solid var(--gold-primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '10px',
                              padding: '10px 14px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: antarPData.color, fontWeight: 'bold' }}>{antarPData.symbol}</span>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f8fafc' }}>
                                  {maha.planet}-{antar.planet}
                                </span>
                                {antar.isCurrent && <span className="badge-gold" style={{ fontSize: '0.65rem' }}>Active</span>}
                              </div>
                              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                                {antar.startDate} to {antar.endDate}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
