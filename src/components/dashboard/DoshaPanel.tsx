import React, { useState } from 'react';
import type { KundaliChart, DoshaResult } from '../../core/models';

interface Props { chart: KundaliChart; }

export default function DoshaPanel({ chart }: Props) {
  const [expanded, setExpanded] = useState<string | null>('manglik');
  const { doshas } = chart;

  return (
    <div className="fade-in">
      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        {doshas.map(d => (
          <div key={d.id} className="stat-card" style={{ borderLeft: `3px solid ${d.isPresent && !d.isCancelled ? 'var(--crimson-400)' : 'var(--teal-400)'}` }}>
            <div className="stat-label">{d.name}</div>
            <div className="stat-value" style={{ fontSize: '0.95rem', color: d.isPresent && !d.isCancelled ? 'var(--crimson-300)' : 'var(--teal-400)' }}>
              {!d.isPresent ? 'Not Present' : d.isCancelled ? 'Cancelled' : `Present — ${d.severity}`}
            </div>
          </div>
        ))}
      </div>

      {doshas.map(d => (
        <DoshaCard key={d.id} dosha={d} isExpanded={expanded === d.id} onToggle={() => setExpanded(expanded === d.id ? null : d.id)} />
      ))}
    </div>
  );
}

function DoshaCard({ dosha, isExpanded, onToggle }: { dosha: DoshaResult; isExpanded: boolean; onToggle: () => void }) {
  const isActive = dosha.isPresent && !dosha.isCancelled;
  const borderColor = !dosha.isPresent ? 'var(--teal-500)' : dosha.isCancelled ? 'var(--teal-400)' : dosha.severity === 'High' ? 'var(--crimson-400)' : 'var(--gold-400)';

  return (
    <div className="yoga-card" style={{ borderLeft: `3px solid ${borderColor}`, cursor: 'pointer', marginBottom: '0.75rem' }}
      onClick={onToggle}>
      <div className="flex justify-between items-center">
        <div>
          <div className="yoga-title">{dosha.name}</div>
          <div className="flex gap-2 mt-1">
            <span className="badge" style={{ background: borderColor + '22', color: borderColor, border: `1px solid ${borderColor}66`, fontSize: '0.65rem' }}>
              {!dosha.isPresent ? '✅ Not Present' : dosha.isCancelled ? '🔆 Cancelled' : `⚠ ${dosha.severity} Severity`}
            </span>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
      </div>

      {isExpanded && (
        <div className="fade-in" style={{ marginTop: '1rem' }}>
          {/* Description */}
          <div style={{ background: 'var(--surface-overlay)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
            <div className="text-xs text-muted mb-1">ANALYSIS</div>
            <p className="text-sm">{dosha.description}</p>
          </div>

          {/* Effects */}
          <div style={{ background: isActive ? 'rgba(198,40,40,0.06)' : 'rgba(38,166,154,0.06)', border: `1px solid ${isActive ? 'rgba(198,40,40,0.2)' : 'rgba(38,166,154,0.2)'}`, borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="text-xs mb-1" style={{ color: isActive ? 'var(--crimson-300)' : 'var(--teal-400)' }}>
              {isActive ? '⚠ EFFECTS' : '✅ STATUS'}
            </div>
            <p className="text-sm">{dosha.effects}</p>
          </div>

          {/* Cancellations */}
          {dosha.cancellations.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div className="text-xs text-muted mb-2">CANCELLATION RULES APPLIED</div>
              {dosha.cancellations.map((c, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <span style={{ color: 'var(--teal-400)', fontSize: '0.8rem' }}>✓</span>
                  <span className="text-sm">{c}</span>
                </div>
              ))}
            </div>
          )}

          {/* Remedies */}
          {dosha.remedies.length > 0 && (
            <div style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <div className="text-xs text-gold mb-2">🙏 REMEDIES</div>
              {dosha.remedies.map((r, i) => (
                <div key={i} className="flex items-start gap-2 mb-1">
                  <span style={{ color: 'var(--gold-400)', fontSize: '0.8rem', flexShrink: 0, marginTop: 2 }}>•</span>
                  <span className="text-sm">{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
