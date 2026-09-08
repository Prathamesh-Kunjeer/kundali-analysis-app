import React, { useState } from 'react';
import type { KundaliChart, Planet } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';

interface Props { chart: KundaliChart; }

const PLANET_COLORS: Record<string, string> = {
  Sun:'#ff8c00', Moon:'#c0c0ff', Mars:'#ff4500', Mercury:'#32cd32',
  Jupiter:'#ffd700', Venus:'#ff69b4', Saturn:'#4169e1', Rahu:'#8b008b',
  Ketu:'#808080', Ascendant:'#d4a017',
};

export default function HouseGrid({ chart }: Props) {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const { houses, planets, planetAnalysis } = chart;

  const selected = selectedHouse !== null ? houses[selectedHouse - 1] : null;

  return (
    <div className="fade-in">
      <div className="grid-2" style={{ gap: '1.25rem' }}>
        {/* House Grid */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🏠 12 Bhavas</span>
            <span className="text-xs text-muted">Click house to inspect</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {houses.map(house => {
              const isSelected = selectedHouse === house.number;
              const hasKendra  = house.isKendra;
              const hasTrikona = house.isTrikona;
              const hasDusthana= house.isDusthana;
              const accent = hasKendra && hasTrikona
                ? 'var(--gold-glow)'
                : hasKendra   ? 'rgba(38,166,154,0.1)'
                : hasTrikona  ? 'rgba(212,160,23,0.1)'
                : hasDusthana ? 'rgba(198,40,40,0.08)'
                : 'transparent';

              return (
                <div
                  key={house.number}
                  onClick={() => setSelectedHouse(isSelected ? null : house.number)}
                  style={{
                    background: isSelected ? 'var(--gold-glow)' : accent,
                    border: `1px solid ${isSelected ? 'var(--gold-500)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.6rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    minHeight: 90,
                  }}
                >
                  <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>H{house.number}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{house.sign.substring(0, 3)}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    Lord: <span style={{ color: PLANET_COLORS[house.lord] }}>{PLANET_LABELS[house.lord].symbol}</span>
                  </div>
                  <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                    {house.planets.map(p => (
                      <span key={p} style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        color: PLANET_COLORS[p] || '#fff',
                        padding: '1px 4px',
                        background: (PLANET_COLORS[p] || '#fff') + '18',
                        borderRadius: 3,
                      }}>
                        {PLANET_LABELS[p].symbol}
                      </span>
                    ))}
                    {house.planets.length === 0 && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Empty</span>}
                  </div>
                  <div className="flex gap-1 mt-1" style={{ flexWrap: 'wrap' }}>
                    {house.isKendra && house.isTrikona && <span style={{ fontSize: '0.58rem', color: 'var(--gold-400)' }}>K+T</span>}
                    {house.isKendra && !house.isTrikona && <span style={{ fontSize: '0.58rem', color: 'var(--teal-400)' }}>Kendra</span>}
                    {house.isTrikona && !house.isKendra && <span style={{ fontSize: '0.58rem', color: 'var(--gold-400)' }}>Trikona</span>}
                    {house.isDusthana && <span style={{ fontSize: '0.58rem', color: 'var(--crimson-300)' }}>Dusthana</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-3" style={{ fontSize: '0.7rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--teal-400)' }}>■ Kendra</span>
            <span style={{ color: 'var(--gold-400)' }}>■ Trikona</span>
            <span style={{ color: 'var(--crimson-300)' }}>■ Dusthana</span>
            <span style={{ color: 'var(--gold-400)' }}>■ K+T (1st house)</span>
          </div>
        </div>

        {/* House Detail Panel */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {selected ? `House ${selected.number} — ${selected.sanskritName}` : '📋 House Inspector'}
            </span>
          </div>

          {!selected ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-icon">🏠</div>
              <p>Click any house in the grid to inspect its details</p>
            </div>
          ) : (
            <div className="fade-in">
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold-400)', marginBottom: 4 }}>
                  {selected.sign}
                </div>
                <p className="text-xs text-secondary">{selected.significance}</p>
              </div>

              <div className="info-row"><span className="label">Sign Lord</span>
                <span className="value" style={{ color: PLANET_COLORS[selected.lord] }}>
                  {PLANET_LABELS[selected.lord].symbol} {PLANET_LABELS[selected.lord].english}
                </span>
              </div>
              <div className="info-row"><span className="label">Type</span>
                <span className="value">
                  {[
                    selected.isKendra ? 'Kendra' : null,
                    selected.isTrikona ? 'Trikona' : null,
                    selected.isDusthana ? 'Dusthana' : null,
                    selected.isUpachaya ? 'Upachaya' : null,
                  ].filter(Boolean).join(' / ') || 'Neutral'}
                </span>
              </div>

              <div className="divider" />

              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                OCCUPYING PLANETS
              </div>

              {selected.planets.length === 0 ? (
                <p className="text-sm text-muted">No planets occupy this house.</p>
              ) : selected.planets.map(p => {
                const pos = planets[p];
                const analysis = planetAnalysis[p];
                return (
                  <div key={p} style={{
                    background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '0.5rem'
                  }}>
                    <div className="flex justify-between items-center mb-2">
                      <span style={{ color: PLANET_COLORS[p], fontWeight: 700, fontSize: '0.9rem' }}>
                        {PLANET_LABELS[p].symbol} {PLANET_LABELS[p].english}
                      </span>
                      <div className="flex gap-1">
                        {pos.isRetrograde && <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>℞ Retro</span>}
                        {pos.isCombust && <span className="badge badge-crimson" style={{ fontSize: '0.65rem' }}>☄ Combust</span>}
                      </div>
                    </div>
                    <div className="grid-2" style={{ gap: '0.25rem' }}>
                      <div className="text-xs text-muted">Sign: <span style={{ color: 'var(--text-primary)' }}>{pos.sign}</span></div>
                      <div className="text-xs text-muted">Degree: <span style={{ color: 'var(--text-primary)' }}>{pos.dmsString}</span></div>
                      <div className="text-xs text-muted">Nakshatra: <span style={{ color: 'var(--text-primary)' }}>{pos.nakshatra.name}</span></div>
                      <div className="text-xs text-muted">Dignity: <span style={{ color: 'var(--text-primary)' }}>{pos.dignity}</span></div>
                    </div>
                    {analysis && (
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs text-muted">Strength:</span>
                        <div className="strength-bar" style={{ flex: 1 }}>
                          <div className="strength-fill" style={{ width: `${analysis.strengthScore}%`, background: analysis.strengthLevel === 'Strong' ? 'var(--teal-400)' : analysis.strengthLevel === 'Moderate' ? 'var(--gold-400)' : 'var(--crimson-300)' }} />
                        </div>
                        <span className="text-xs text-muted">{analysis.strengthScore}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
