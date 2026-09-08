import React, { useState } from 'react';
import type { KundaliChart } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';

interface Props { chart: KundaliChart; }

const TOPICS = [
  { key: 'career',        label: 'Career & Profession', icon: '💼', house: 10 },
  { key: 'wealth',        label: 'Wealth & Finance',    icon: '💰', house: 2  },
  { key: 'relationships', label: 'Relationships',        icon: '❤',  house: 7  },
  { key: 'health',        label: 'Health',               icon: '🌿', house: 1  },
  { key: 'personality',   label: 'Personality',          icon: '✨', house: 1  },
  { key: 'education',     label: 'Education',            icon: '📚', house: 5  },
  { key: 'spirituality',  label: 'Spirituality',         icon: '🕉', house: 9  },
] as const;

type Topic = typeof TOPICS[number]['key'];

export default function Interpretations({ chart }: Props) {
  const [topic, setTopic] = useState<Topic>('career');
  const { planetAnalysis, houses, lagnaSign } = chart;

  const topicDef = TOPICS.find(t => t.key === topic)!;
  const house = houses[topicDef.house - 1];

  // Gather interpretations from all planets for this topic
  const planetReadings = Object.entries(planetAnalysis)
    .filter(([p]) => p !== 'Ascendant')
    .map(([p, a]) => ({
      planet: p,
      text: (a.interpretation as unknown as Record<string, string>)[topic] || '',
      strength: a.strengthLevel,
      score: a.strengthScore,
      nature: a.functionalNature,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="fade-in">
      {/* Topic selector */}
      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {TOPICS.map(t => (
          <button key={t.key} className={`btn ${topic === t.key ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            onClick={() => setTopic(t.key)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* House context */}
      <div className="card card-gold mb-4">
        <div className="flex items-center gap-3">
          <div className="section-icon" style={{ fontSize: '1.4rem' }}>{topicDef.icon}</div>
          <div>
            <h2 style={{ marginBottom: 2 }}>{topicDef.label}</h2>
            <p className="text-xs text-secondary">
              Primary house: {topicDef.house} ({house?.sign}) · Lord: {house ? PLANET_LABELS[house.lord].english : '—'} · Lagna: {lagnaSign}
            </p>
          </div>
        </div>
      </div>

      {/* Planet-by-planet readings */}
      <div>
        {planetReadings.map(({ planet, text, strength, score, nature }) => {
          if (!text) return null;
          const COLORS: Record<string, string> = {
            Sun:'#ff8c00', Moon:'#c0c0ff', Mars:'#ff4500', Mercury:'#32cd32',
            Jupiter:'#ffd700', Venus:'#ff69b4', Saturn:'#4169e1', Rahu:'#8b008b', Ketu:'#808080',
          };
          const color = COLORS[planet] || '#fff';
          const natCls = nature === 'Yogakaraka' ? 'badge-gold' : nature === 'Benefic' ? 'badge-teal' : nature === 'Malefic' ? 'badge-crimson' : 'badge-subtle';
          return (
            <div key={planet} className="card" style={{ marginBottom: '0.75rem', borderLeft: `3px solid ${color}` }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ color, fontWeight: 700 }}>{PLANET_LABELS[planet as keyof typeof PLANET_LABELS].symbol} {PLANET_LABELS[planet as keyof typeof PLANET_LABELS].english}</span>
                  <span className={`badge ${natCls}`} style={{ fontSize: '0.65rem' }}>{nature}</span>
                  <span className="badge badge-subtle" style={{ fontSize: '0.65rem', color: strength === 'Strong' ? 'var(--teal-400)' : strength === 'Moderate' ? 'var(--gold-400)' : 'var(--crimson-300)' }}>
                    {strength} ({score})
                  </span>
                </div>
              </div>
              <p className="text-sm" style={{ lineHeight: 1.7 }}>{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
