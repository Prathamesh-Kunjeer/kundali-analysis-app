import React, { useState, useMemo } from 'react';
import type { KundaliChart, Planet, PlanetAnalysis } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';
import { useLanguage } from '../../context/LanguageContext';
import {
  PLANET_REMEDIES,
  classifyRemedyStatus,
  getWhyExplanation,
  type RemedyItem,
  type ClassicalPlanet,
} from '../../core/planetRemedies';

interface Props {
  chart: KundaliChart;
}

const PC: Record<string, string> = {
  Sun: '#e07b39',
  Moon: '#7b9fd4',
  Mars: '#d94f4f',
  Mercury: '#4aad78',
  Jupiter: '#c9a227',
  Venus: '#c060a0',
  Saturn: '#5577b8',
  Rahu: '#8f5baa',
  Ketu: '#7d8a94',
};

const GLYPHS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
};

export default function RemediesTab({ chart }: Props) {
  const { language, t, formatPlanet } = useLanguage();

  // Categorize planets based on existing planetAnalysis without recalculating
  const { attentionPlanets, supportPlanets, topPriorityPlanet } = useMemo(() => {
    const attention: { planet: ClassicalPlanet; analysis: PlanetAnalysis }[] = [];
    const support: { planet: ClassicalPlanet; analysis: PlanetAnalysis }[] = [];

    const planetKeys = Object.keys(chart.planetAnalysis) as Planet[];
    for (const p of planetKeys) {
      if (p === 'Ascendant') continue;
      const analysis = chart.planetAnalysis[p];
      if (!analysis) continue;

      const category = classifyRemedyStatus(analysis);
      if (category === 'attention') {
        attention.push({ planet: p as ClassicalPlanet, analysis });
      } else if (category === 'support') {
        support.push({ planet: p as ClassicalPlanet, analysis });
      }
    }

    // Prioritize using existing strengthScore ascending (lowest score / most challenged first)
    attention.sort((a, b) => a.analysis.strengthScore - b.analysis.strengthScore);
    support.sort((a, b) => a.analysis.strengthScore - b.analysis.strengthScore);

    const topPriority = attention.length > 0 ? attention[0].planet : (support.length > 0 ? support[0].planet : null);

    return {
      attentionPlanets: attention,
      supportPlanets: support,
      topPriorityPlanet: topPriority,
    };
  }, [chart]);

  const totalFlagged = attentionPlanets.length + supportPlanets.length;

  return (
    <div className="fade-in" style={{ width: '100%', paddingBottom: '2.5rem' }}>
      {/* ─── Top Header & Summary Card ──────────────────────────────────────── */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderTop: '3.5px solid var(--brand-400)',
          padding: '1.25rem 1.45rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🌿</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {t('remedies.title')}
              </h2>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: 740, lineHeight: 1.55 }}>
              {t('remedies.subtitle')}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span
              className="badge badge-challenging"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              ⚠ {attentionPlanets.length} {t('remedies.planetsNeedAttention')}
            </span>
            <span
              className="badge badge-neutral"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              ⚡ {supportPlanets.length} {t('remedies.planetsNeedSupport')}
            </span>
          </div>
        </div>

        {/* High Priority Callout Note */}
        {topPriorityPlanet && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.65rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-overlay)',
              borderLeft: '3.5px solid var(--brand-400)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <b style={{ color: 'var(--text-primary)' }}>{t('remedies.startWith')}</b>{' '}
              <span style={{ fontWeight: 700, color: PC[topPriorityPlanet] || 'var(--brand-400)' }}>
                {formatPlanet(topPriorityPlanet)} ({PLANET_LABELS[topPriorityPlanet]?.english})
              </span>
            </div>
            <span className="badge badge-gold" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
              ★ {t('remedies.highPriority')}
            </span>
          </div>
        )}
      </div>

      {/* ─── All Balanced Edge-Case State ───────────────────────────────────── */}
      {totalFlagged === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            {t('remedies.allWell')}
          </h3>
        </div>
      )}

      {/* ─── Section 1: Planets Needing Attention ──────────────────────────── */}
      {attentionPlanets.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--semantic-challenging-fg)' }}>●</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {t('remedies.needsAttention')}
            </h3>
            <span className="badge badge-challenging" style={{ fontSize: '0.72rem' }}>
              {attentionPlanets.length}
            </span>
          </div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {t('remedies.needsAttentionSubtitle')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {attentionPlanets.map(({ planet, analysis }) => (
              <RemedyCard
                key={planet}
                planet={planet}
                analysis={analysis}
                statusType="attention"
                isTopPriority={planet === topPriorityPlanet}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Section 2: Planets Needing Support ────────────────────────────── */}
      {supportPlanets.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--semantic-neutral-fg)' }}>●</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {t('remedies.needsSupport')}
            </h3>
            <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
              {supportPlanets.length}
            </span>
          </div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {t('remedies.needsSupportSubtitle')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {supportPlanets.map(({ planet, analysis }) => (
              <RemedyCard
                key={planet}
                planet={planet}
                analysis={analysis}
                statusType="support"
                isTopPriority={planet === topPriorityPlanet}
              />
            ))}
          </div>
        </section>
      )}

      {/* ─── Unobtrusive Cultural Disclaimer ───────────────────────────────── */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface-overlay)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
          🛡 <b>{language === 'mr' ? 'सूचना: ' : 'Disclaimer: '}</b>{t('remedies.disclaimer')}
        </p>
      </div>
    </div>
  );
}

// ─── Sub-Component: Single Planet Remedy Card ─────────────────────────────────

interface RemedyCardProps {
  planet: ClassicalPlanet;
  analysis: PlanetAnalysis;
  statusType: 'attention' | 'support';
  isTopPriority: boolean;
}

function RemedyCard({ planet, analysis, statusType, isTopPriority }: RemedyCardProps) {
  const { language, t, formatPlanet, formatSign, formatDignity } = useLanguage();
  const [showTech, setShowTech] = useState(false);

  const guide = PLANET_REMEDIES[planet];
  const meta = PLANET_LABELS[planet];
  const pos = analysis.position;
  const whyText = getWhyExplanation(analysis, language);

  const isMr = language === 'mr';
  const planetColor = PC[planet] || 'var(--brand-400)';

  const statusLabel =
    statusType === 'attention'
      ? t('remedies.needsAttention')
      : t('remedies.needsSupport');

  const statusBadgeClass =
    statusType === 'attention' ? 'badge-challenging' : 'badge-neutral';

  return (
    <div
      className="card"
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderLeft: `4px solid ${statusType === 'attention' ? 'var(--semantic-challenging-fg)' : 'var(--semantic-neutral-fg)'}`,
        padding: '1.25rem 1.35rem',
      }}
    >
      {/* 1. Header: Planet Symbol, Name & Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.9rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Planet Icon Orb */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: `${planetColor}15`,
              border: `1.5px solid ${planetColor}`,
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.35rem',
              color: planetColor,
              flexShrink: 0,
            }}
          >
            {GLYPHS[planet] || meta?.symbol || '•'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                {formatPlanet(planet)}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ({meta?.english} / {meta?.sanskrit})
              </span>
              {isTopPriority && (
                <span className="badge badge-gold" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                  ★ {t('remedies.highPriority')}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {isMr
                ? `भाव ${pos.house} (${formatSign(pos.sign)}) · ${guide?.traditionalFocus.mr}`
                : `House ${pos.house} (${pos.sign}) · ${guide?.traditionalFocus.en}`}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '0.76rem', fontWeight: 700, padding: '0.25rem 0.65rem' }}>
          {statusType === 'attention' ? '⚠ ' : '⚡ '} {statusLabel}
        </span>
      </div>

      {/* 2. Personalized "Why?" Explanation */}
      <div
        style={{
          background: 'var(--surface-overlay)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 0.95rem',
          borderLeft: '3px solid var(--brand-400)',
          marginBottom: '1rem',
        }}
      >
        <div style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--brand-400)', marginBottom: '0.25rem' }}>
          ❓ {t('remedies.whyTitle')}
        </div>
        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {whyText}
        </p>

        {/* Expandable Technical Factors */}
        <div style={{ marginTop: '0.45rem' }}>
          <button
            onClick={() => setShowTech(s => !s)}
            className="btn btn-ghost"
            style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', color: 'var(--text-muted)' }}
          >
            {showTech ? `▲ ${t('common.hideTechnical')}` : `▼ ${t('remedies.technicalFactors')}`}
          </button>

          {showTech && (
            <div
              className="fade-in"
              style={{
                marginTop: '0.45rem',
                padding: '0.55rem 0.75rem',
                background: 'var(--surface-raised)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.76rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div className="info-row">
                <span className="label">{isMr ? 'भाव व रास' : 'House & Sign'}</span>
                <span className="value">H{pos.house} ({formatSign(pos.sign)})</span>
              </div>
              <div className="info-row">
                <span className="label">{isMr ? 'ग्रह बल (Dignity)' : 'Dignity'}</span>
                <span className="value">{formatDignity(pos.dignity)}</span>
              </div>
              <div className="info-row">
                <span className="label">{isMr ? 'कार्यात्मक स्वभाव' : 'Functional Role'}</span>
                <span className="value">{analysis.functionalNature}</span>
              </div>
              <div className="info-row">
                <span className="label">{isMr ? 'एकूण सामर्थ्य गुण' : 'Strength Score'}</span>
                <span className="value">{analysis.strengthScore}/100 ({analysis.strengthLevel})</span>
              </div>
              {pos.isRetrograde && (
                <div className="info-row">
                  <span className="label">{isMr ? 'गती' : 'Motion'}</span>
                  <span className="value" style={{ color: 'var(--brand-400)' }}>℞ {isMr ? 'वक्री' : 'Retrograde'}</span>
                </div>
              )}
              {pos.isCombust && (
                <div className="info-row">
                  <span className="label">{isMr ? 'अस्त स्थिती' : 'Combustion'}</span>
                  <span className="value" style={{ color: 'var(--semantic-challenging-fg)' }}>☄ {isMr ? 'अस्त (सूर्याजवळ)' : 'Combust'}</span>
                </div>
              )}
              {analysis.isAfflicted && (
                <div className="info-row">
                  <span className="label">{isMr ? 'आव्हानात्मक दृष्टी' : 'Afflictions'}</span>
                  <span className="value" style={{ color: 'var(--semantic-challenging-fg)' }}>{isMr ? 'क्रूर ग्रहांचा प्रभाव' : 'Malefic aspects present'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Exactly 3 Traditional Remedies */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🕊</span>
          <span>{t('remedies.threeRemediesTitle')}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {guide?.remedies.map((remedy: RemedyItem, idx: number) => (
            <RemedyItemBox key={remedy.id} remedy={remedy} index={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Component: Remedy Item Box ───────────────────────────────────────────

function RemedyItemBox({ remedy, index }: { remedy: RemedyItem; index: number }) {
  const { language, t } = useLanguage();
  const isMr = language === 'mr';

  const title = isMr ? remedy.title.mr : remedy.title.en;
  const action = isMr ? remedy.action.mr : remedy.action.en;
  const timing = isMr ? remedy.timing.mr : remedy.timing.en;
  const rationale = isMr ? remedy.rationale.mr : remedy.rationale.en;

  const categoryIcons: Record<string, string> = {
    devotion: '🪔',
    service: '🤝',
    lifestyle: '🌱',
    charity: '🌾',
  };

  return (
    <div
      style={{
        background: 'var(--surface-overlay)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem 0.95rem',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.55rem',
      }}
    >
      <div>
        {/* Number + Category + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: 22,
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-grid',
              placeItems: 'center',
              color: 'var(--brand-400)',
              flexShrink: 0,
              marginTop: '0.1rem',
            }}
          >
            {index}
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
              {title}
            </div>
          </div>
        </div>

        {/* What to do */}
        <p style={{ margin: '0.35rem 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {action}
        </p>
      </div>

      {/* Timing & Traditional Purpose */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          ⏱ <b>{t('remedies.timing')}:</b> {timing}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {categoryIcons[remedy.category] || '✦'} <b>{t('remedies.rationale')}:</b> {rationale}
        </div>
      </div>
    </div>
  );
}
