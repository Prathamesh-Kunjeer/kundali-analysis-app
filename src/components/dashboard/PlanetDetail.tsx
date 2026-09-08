import React from 'react';
import type { KundaliChart, Planet, PlanetAnalysis } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';

interface Props { chart: KundaliChart; planet: Planet; onClose: () => void; }

const PLANET_COLORS: Record<string, string> = {
  Sun:'#ff8c00', Moon:'#c0c0ff', Mars:'#ff4500', Mercury:'#32cd32',
  Jupiter:'#ffd700', Venus:'#ff69b4', Saturn:'#4169e1', Rahu:'#8b008b',
  Ketu:'#808080', Ascendant:'#d4a017',
};

const TABS = ['Position', 'Condition', 'Aspects', 'Interpretation'] as const;
type Tab = typeof TABS[number];

export default function PlanetDetail({ chart, planet, onClose }: Props) {
  const [tab, setTab] = React.useState<Tab>('Position');
  const analysis: PlanetAnalysis | undefined = chart.planetAnalysis[planet];
  const pos = chart.planets[planet];
  const color = PLANET_COLORS[planet] || '#fff';

  if (!analysis || !pos) return null;

  return (
    <div className="card card-gold fade-in" style={{ marginBottom: '1.25rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: color + '22', border: `2px solid ${color}`, display: 'grid', placeItems: 'center', fontSize: '1.6rem' }}>
            {PLANET_LABELS[planet].symbol}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color }}>{PLANET_LABELS[planet].english}</div>
            <div className="sanskrit text-sm">{PLANET_LABELS[planet].sanskrit}</div>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.25rem 0.75rem' }}>✕ Close</button>
      </div>

      {/* Quick Status Row */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <span className="badge badge-gold">{pos.sign} · H{pos.house}</span>
        <span className="badge badge-subtle">{pos.dignity}</span>
        <span className="badge badge-subtle">{pos.nakshatra.name} P{pos.nakshatraPosition.pada}</span>
        {pos.isRetrograde && <span className="badge badge-violet">℞ Retrograde</span>}
        {pos.isCombust && <span className="badge badge-crimson">☄ Combust</span>}
        {analysis.isVargottama && <span className="badge badge-gold">Vargottama</span>}
        <span className="badge" style={{ background: analysis.functionalNature === 'Yogakaraka' ? 'var(--gold-glow)' : analysis.functionalNature === 'Benefic' ? 'var(--teal-100)' : analysis.functionalNature === 'Malefic' ? 'var(--crimson-100)' : 'transparent', color: analysis.functionalNature === 'Yogakaraka' ? 'var(--gold-400)' : analysis.functionalNature === 'Benefic' ? 'var(--teal-300)' : analysis.functionalNature === 'Malefic' ? 'var(--crimson-300)' : 'var(--text-secondary)', border: '1px solid currentColor' }}>
          {analysis.functionalNature}
        </span>
      </div>

      {/* Strength bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-muted">Overall Strength</span>
          <span className="text-xs" style={{ color: analysis.strengthLevel === 'Strong' ? 'var(--teal-400)' : analysis.strengthLevel === 'Moderate' ? 'var(--gold-400)' : 'var(--crimson-300)' }}>
            {analysis.strengthLevel} ({analysis.strengthScore}/100)
          </span>
        </div>
        <div className="strength-bar" style={{ height: 8 }}>
          <div className="strength-fill" style={{ width: `${analysis.strengthScore}%`, background: analysis.strengthLevel === 'Strong' ? 'var(--teal-400)' : analysis.strengthLevel === 'Moderate' ? 'var(--gold-400)' : 'var(--crimson-300)' }} />
        </div>
      </div>

      {/* Inner tabs */}
      <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="tab-btn" style={{ fontSize: '0.78rem', padding: '0.5rem 1rem' }}
            data-active={tab === t ? '' : undefined}>
            <span className={tab === t ? 'text-gold' : ''}>{t}</span>
          </button>
        ))}
      </div>

      {tab === 'Position' && (
        <div className="grid-2 fade-in">
          <div>
            <div className="info-row"><span className="label">Longitude</span><span className="value">{pos.longitude.toFixed(4)}°</span></div>
            <div className="info-row"><span className="label">Degree in Sign</span><span className="value">{pos.dmsString}</span></div>
            <div className="info-row"><span className="label">Sign</span><span className="value">{pos.sign}</span></div>
            <div className="info-row"><span className="label">House</span><span className="value">{pos.house}</span></div>
            <div className="info-row"><span className="label">Speed</span><span className="value">{pos.speed.toFixed(4)}°/day</span></div>
          </div>
          <div>
            <div className="info-row"><span className="label">Nakshatra</span><span className="value">{pos.nakshatra.name}</span></div>
            <div className="info-row"><span className="label">Pada</span><span className="value">{pos.nakshatraPosition.pada}</span></div>
            <div className="info-row"><span className="label">Nakshatra Lord</span><span className="value">{PLANET_LABELS[pos.nakshatra.lord].english}</span></div>
            <div className="info-row"><span className="label">Avastha</span><span className="value">{pos.avastha}</span></div>
            <div className="info-row"><span className="label">House Ownership</span><span className="value">H{analysis.houseOwnership.join(', H')}</span></div>
          </div>
        </div>
      )}

      {tab === 'Condition' && (
        <div className="fade-in">
          <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1rem' }}>
            <ConditionFlag label="Exalted (Uchha)"         value={analysis.isExalted}        positive />
            <ConditionFlag label="Debilitated (Neecha)"    value={analysis.isDebilitated}    positive={false} />
            <ConditionFlag label="Own Sign (Swakshetra)"   value={analysis.isInOwnSign}      positive />
            <ConditionFlag label="Friendly Sign"           value={analysis.isInFriendlySign} positive />
            <ConditionFlag label="Enemy Sign"              value={analysis.isInEnemySign}    positive={false} />
            <ConditionFlag label="Retrograde (Vakri)"      value={analysis.isRetrograde}     positive={null} />
            <ConditionFlag label="Combust (Asta)"          value={analysis.isCombust}        positive={false} />
            <ConditionFlag label="Afflicted (Peedit)"      value={analysis.isAfflicted}      positive={false} />
            <ConditionFlag label="Vargottama"              value={analysis.isVargottama}     positive />
          </div>
        </div>
      )}

      {tab === 'Aspects' && (
        <div className="fade-in">
          <div className="mb-4">
            <div className="text-xs text-muted mb-2">ASPECTS CAST BY {PLANET_LABELS[planet].english.toUpperCase()}</div>
            {analysis.aspectsGiven.length === 0 ? <p className="text-sm text-muted">No special aspects beyond the 7th.</p> :
              analysis.aspectsGiven.map((a, i) => (
                <div key={i} className="info-row">
                  <span className="label">→ House {a.toHouse}{a.toPlanet ? ` (${PLANET_LABELS[a.toPlanet].english})` : ''}</span>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${a.strength === 'Full' ? 'badge-teal' : 'badge-gold'}`} style={{ fontSize: '0.68rem' }}>{a.strength}</span>
                    <span className="text-xs text-muted">{a.rule}</span>
                  </div>
                </div>
              ))
            }
          </div>
          <div>
            <div className="text-xs text-muted mb-2">ASPECTS RECEIVED BY {PLANET_LABELS[planet].english.toUpperCase()}</div>
            {analysis.aspectsReceived.length === 0 ? <p className="text-sm text-muted">No planets are aspecting this planet.</p> :
              analysis.aspectsReceived.map((a, i) => (
                <div key={i} className="info-row">
                  <span className="label">{PLANET_LABELS[a.fromPlanet].symbol} {PLANET_LABELS[a.fromPlanet].english} → H{a.toHouse}</span>
                  <span className={`badge ${a.strength === 'Full' ? 'badge-teal' : 'badge-gold'}`} style={{ fontSize: '0.68rem' }}>{a.strength}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {tab === 'Interpretation' && (
        <div className="fade-in">
          {(Object.entries(analysis.interpretation) as [string, string][]).map(([key, text]) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <div className="text-xs text-gold mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {key === 'career' ? '💼 Career' : key === 'wealth' ? '💰 Wealth' : key === 'relationships' ? '❤ Relationships' : key === 'health' ? '🌿 Health' : key === 'personality' ? '✨ Personality' : key === 'education' ? '📚 Education' : '🕉 Spirituality'}
              </div>
              <p className="text-sm" style={{ lineHeight: 1.65 }}>{text}</p>
              {key !== 'spirituality' && <div className="divider" style={{ margin: '0.75rem 0' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConditionFlag({ label, value, positive }: { label: string; value: boolean; positive: boolean | null }) {
  const cls = !value ? 'badge-subtle' :
    positive === null ? 'badge-violet' :
    positive ? 'badge-teal' : 'badge-crimson';
  const icon = !value ? '—' : positive === null ? '℞' : positive ? '✓' : '✗';
  return (
    <div className="flex justify-between items-center" style={{ padding: '0.35rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span className="text-sm text-secondary">{label}</span>
      <span className={`badge ${cls}`} style={{ fontSize: '0.72rem' }}>{icon} {value ? 'Yes' : 'No'}</span>
    </div>
  );
}
