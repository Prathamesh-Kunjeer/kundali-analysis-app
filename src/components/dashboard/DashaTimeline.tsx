import React, { useState } from 'react';
import type { KundaliChart, DashaPeriod } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';

interface Props { chart: KundaliChart; }

const PLANET_COLORS: Record<string, string> = {
  Sun:'#ff8c00', Moon:'#c0c0ff', Mars:'#ff4500', Mercury:'#32cd32',
  Jupiter:'#ffd700', Venus:'#ff69b4', Saturn:'#4169e1', Rahu:'#8b008b',
  Ketu:'#808080', Ascendant:'#d4a017',
};

function fmt(d: Date) {
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

function fmtFull(d: Date) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function durationLabel(years: number): string {
  const y = Math.floor(years);
  const m = Math.round((years - y) * 12);
  return `${y}y ${m}m`;
}

export default function DashaTimeline({ chart }: Props) {
  const [expanded, setExpanded] = useState<string | null>(chart.dasha.currentMahadasha?.planet || null);
  const { dasha } = chart;

  const allStart = dasha.mahadashas[0]?.startDate ? new Date(dasha.mahadashas[0].startDate).getTime() : Date.now();
  const allEnd   = dasha.mahadashas[dasha.mahadashas.length - 1]?.endDate
    ? new Date(dasha.mahadashas[dasha.mahadashas.length - 1].endDate).getTime() : Date.now();
  const totalSpan = allEnd - allStart;

  return (
    <div className="fade-in">
      {/* Birth Balance */}
      <div className="card card-gold mb-4">
        <div className="grid-4">
          <div className="stat-card" style={{ border: 'none', background: 'transparent' }}>
            <div className="stat-label">Janma Nakshatra</div>
            <div className="stat-value" style={{ fontSize: '0.95rem' }}>{chart.janmaNakshatra.name}</div>
          </div>
          <div className="stat-card" style={{ border: 'none', background: 'transparent' }}>
            <div className="stat-label">Starting Lord</div>
            <div className="stat-value" style={{ fontSize: '0.95rem' }}>{PLANET_LABELS[dasha.birthBalance.nakshatraLord].english}</div>
          </div>
          <div className="stat-card" style={{ border: 'none', background: 'transparent' }}>
            <div className="stat-label">Balance at Birth</div>
            <div className="stat-value" style={{ fontSize: '0.95rem' }}>
              {dasha.birthBalance.balanceYears}y {dasha.birthBalance.balanceMonths}m {dasha.birthBalance.balanceDays}d
            </div>
          </div>
          <div className="stat-card" style={{ border: 'none', background: 'transparent' }}>
            <div className="stat-label">Current Period</div>
            <div className="stat-value" style={{ fontSize: '0.95rem' }}>
              {dasha.currentMahadasha ? PLANET_LABELS[dasha.currentMahadasha.planet].english : '—'} Maha
            </div>
          </div>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="card mb-4">
        <div className="card-title mb-3">120-Year Vimshottari Timeline</div>
        <div style={{ display: 'flex', height: 28, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          {dasha.mahadashas.map(maha => {
            const start = new Date(maha.startDate).getTime();
            const end   = new Date(maha.endDate).getTime();
            const widthPct = ((end - start) / totalSpan) * 100;
            const color = PLANET_COLORS[maha.planet] || '#888';
            return (
              <div key={maha.planet}
                title={`${PLANET_LABELS[maha.planet].english}: ${fmt(maha.startDate)} → ${fmt(maha.endDate)}`}
                style={{ flex: `0 0 ${widthPct}%`, background: color + (maha.isCurrent ? 'ff' : '44'), borderRight: '1px solid rgba(0,0,0,0.3)', position: 'relative', cursor: 'pointer', transition: 'opacity 0.2s' }}
                onClick={() => setExpanded(expanded === maha.planet ? null : maha.planet)}
              >
                {widthPct > 8 && (
                  <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: '0.65rem', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {PLANET_LABELS[maha.planet].symbol}
                  </span>
                )}
                {maha.isCurrent && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: `2px solid ${color}`, borderRadius: 'var(--radius-sm)', pointerEvents: 'none' }} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2" style={{ flexWrap: 'wrap' }}>
          {dasha.mahadashas.map(m => (
            <span key={m.planet} className="flex items-center gap-1 text-xs">
              <span className="planet-dot" style={{ background: PLANET_COLORS[m.planet] }} />
              <span style={{ color: m.isCurrent ? PLANET_COLORS[m.planet] : 'var(--text-muted)' }}>
                {PLANET_LABELS[m.planet].english} {m.isCurrent ? '●' : ''}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Mahadasha Cards */}
      <div>
        {dasha.mahadashas.map(maha => {
          const color = PLANET_COLORS[maha.planet] || '#888';
          const isExp = expanded === maha.planet;
          return (
            <div key={maha.planet}
              style={{
                marginBottom: '0.5rem',
                background: 'var(--surface-raised)',
                border: `1px solid ${maha.isCurrent ? color : 'var(--border-subtle)'}`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              {/* Maha header */}
              <div className="flex justify-between items-center" style={{ padding: '0.75rem 1rem', cursor: 'pointer' }}
                onClick={() => setExpanded(isExp ? null : maha.planet)}>
                <div className="flex items-center gap-3">
                  <span style={{ color, fontSize: '1.3rem' }}>{PLANET_LABELS[maha.planet].symbol}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: maha.isCurrent ? color : 'var(--text-primary)' }}>
                      {maha.planetLabel} Mahadasha
                      {maha.isCurrent && <span className="badge badge-teal" style={{ marginLeft: 8, fontSize: '0.65rem' }}>CURRENT</span>}
                    </div>
                    <div className="text-xs text-muted">{fmtFull(maha.startDate)} → {fmtFull(maha.endDate)} · {durationLabel(maha.durationYears)}</div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExp ? 'rotate(180deg)' : 'none' }}>▼</span>
              </div>

              {/* Antardashas */}
              {isExp && (
                <div className="fade-in" style={{ padding: '0 1rem 1rem' }}>
                  <div className="text-xs text-muted mb-2">ANTARDASHAS (BHUKTI)</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ fontSize: '0.78rem' }}>
                      <thead>
                        <tr>
                          <th>Antardasha Lord</th>
                          <th>Start</th>
                          <th>End</th>
                          <th>Duration</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maha.antardasha.map(antar => (
                          <tr key={antar.planet} style={{ background: antar.isCurrent ? 'rgba(212,160,23,0.06)' : undefined }}>
                            <td>
                              <span style={{ color: PLANET_COLORS[antar.planet], fontWeight: 700 }}>
                                {PLANET_LABELS[antar.planet].symbol} {PLANET_LABELS[antar.planet].english}
                              </span>
                            </td>
                            <td>{fmt(antar.startDate)}</td>
                            <td>{fmt(antar.endDate)}</td>
                            <td>{durationLabel(antar.durationYears)}</td>
                            <td>
                              {antar.isCurrent
                                ? <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>● Running</span>
                                : new Date(antar.endDate) < new Date()
                                  ? <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>Past</span>
                                  : <span className="badge badge-subtle" style={{ fontSize: '0.65rem' }}>Future</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pratyantardasha for current antardasha */}
                  {maha.isCurrent && dasha.currentAntardasha && dasha.currentPratyantardasha && (
                    <div style={{ marginTop: '1rem' }}>
                      <div className="text-xs text-gold mb-2">CURRENT PRATYANTARDASHA</div>
                      <div className="flex items-center gap-3 p-3" style={{ background: 'var(--surface-overlay)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)' }}>
                        <span style={{ color: PLANET_COLORS[dasha.currentPratyantardasha.planet], fontSize: '1.2rem' }}>
                          {PLANET_LABELS[dasha.currentPratyantardasha.planet].symbol}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{dasha.currentPratyantardasha.planetLabel}</div>
                          <div className="text-xs text-muted">{fmtFull(dasha.currentPratyantardasha.startDate)} → {fmtFull(dasha.currentPratyantardasha.endDate)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
