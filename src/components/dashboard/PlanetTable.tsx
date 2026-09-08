import React, { useState } from 'react';
import type { KundaliChart, Planet, PlanetAnalysis } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';

interface Props { chart: KundaliChart; onSelectPlanet: (p: Planet) => void; }

const ALL_PLANETS: Planet[] = ['Ascendant','Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

const PLANET_COLORS: Record<string, string> = {
  Sun:'#ff8c00', Moon:'#c0c0ff', Mars:'#ff4500', Mercury:'#32cd32',
  Jupiter:'#ffd700', Venus:'#ff69b4', Saturn:'#4169e1', Rahu:'#8b008b',
  Ketu:'#808080', Ascendant:'#d4a017',
};

const DIGNITY_COLORS: Record<string, string> = {
  Exalted:'var(--dignity-exalted, #ffd700)',
  Moolatrikona:'var(--gold-300)',
  OwnSign:'var(--teal-300)',
  Friend:'#81c784',
  GreatFriend:'#66bb6a',
  Neutral:'var(--text-secondary)',
  Enemy:'#ef9a9a',
  GreatEnemy:'#e57373',
  Debilitated:'var(--crimson-300)',
};

export default function PlanetTable({ chart, onSelectPlanet }: Props) {
  const [sortBy, setSortBy] = useState<'house' | 'planet' | 'strength'>('house');
  const { planetAnalysis, planets } = chart;

  const sorted = [...ALL_PLANETS].sort((a, b) => {
    if (sortBy === 'house') return (planets[a]?.house || 0) - (planets[b]?.house || 0);
    if (sortBy === 'strength') return (planetAnalysis[b]?.strengthScore || 0) - (planetAnalysis[a]?.strengthScore || 0);
    return a.localeCompare(b);
  });

  return (
    <div className="card fade-in">
      <div className="card-header">
        <span className="card-title">🪐 Planetary Positions</span>
        <div className="flex gap-2">
          {(['house','planet','strength'] as const).map(s => (
            <button key={s} className={`btn ${sortBy === s ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.72rem' }}
              onClick={() => setSortBy(s)}>
              {s === 'house' ? 'By House' : s === 'planet' ? 'Alphabetical' : 'By Strength'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Planet</th>
              <th>Sign</th>
              <th>House</th>
              <th>Degree</th>
              <th>Nakshatra</th>
              <th>Pada</th>
              <th>Dignity</th>
              <th>Strength</th>
              <th>Status</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => {
              const pos = planets[p];
              const analysis = planetAnalysis[p];
              if (!pos || !analysis) return null;
              const color = PLANET_COLORS[p] || '#fff';
              return (
                <tr key={p} style={{ cursor: 'pointer' }} onClick={() => onSelectPlanet(p)}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="planet-dot" style={{ background: color }} />
                      <div>
                        <div style={{ fontWeight: 600, color }}>{PLANET_LABELS[p].symbol} {PLANET_LABELS[p].english}</div>
                        <div className="text-xs text-muted sanskrit">{PLANET_LABELS[p].sanskrit}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontWeight: 500 }}>{pos.sign}</span></td>
                  <td>
                    <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>H{pos.house}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{pos.dmsString}</td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>{pos.nakshatra.name}</div>
                    <div className="text-xs text-muted">Lord: {PLANET_LABELS[pos.nakshatra.lord].english}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-subtle">{pos.nakshatraPosition.pada}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: DIGNITY_COLORS[pos.dignity] || '#fff', fontWeight: 600 }}>
                      {pos.dignity === 'OwnSign' ? 'Own Sign' : pos.dignity}
                    </span>
                  </td>
                  <td>
                    <StrengthIndicator score={analysis.strengthScore} level={analysis.strengthLevel} />
                  </td>
                  <td>
                    <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                      {pos.isRetrograde && <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>℞</span>}
                      {pos.isCombust   && <span className="badge badge-crimson" style={{ fontSize: '0.65rem' }}>☄</span>}
                      {analysis.isVargottama && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Varg</span>}
                      {analysis.isAfflicted  && <span className="badge badge-crimson" style={{ fontSize: '0.65rem' }}>Aff</span>}
                      {!pos.isRetrograde && !pos.isCombust && !analysis.isAfflicted && (
                        <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>Clear</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <FunctionalBadge nature={analysis.functionalNature} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted mt-3">Click any row for a detailed planet analysis. Varg = Vargottama (same sign in D1 and D9).</p>
    </div>
  );
}

function StrengthIndicator({ score, level }: { score: number; level: string }) {
  const color = level === 'Strong' ? 'var(--teal-400)' : level === 'Moderate' ? 'var(--gold-400)' : 'var(--crimson-300)';
  return (
    <div style={{ minWidth: 90 }}>
      <div className="flex justify-between" style={{ marginBottom: 2 }}>
        <span style={{ fontSize: '0.72rem', color }}>{level}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{score}</span>
      </div>
      <div className="strength-bar">
        <div className="strength-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function FunctionalBadge({ nature }: { nature: string }) {
  const map: Record<string, string> = {
    Yogakaraka: 'badge-gold',
    Benefic: 'badge-teal',
    Malefic: 'badge-crimson',
    Neutral: 'badge-subtle',
  };
  return <span className={`badge ${map[nature] || 'badge-subtle'}`} style={{ fontSize: '0.7rem' }}>{nature}</span>;
}
