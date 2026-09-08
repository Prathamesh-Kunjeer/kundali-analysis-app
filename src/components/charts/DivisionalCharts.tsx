import React, { useState, useMemo } from 'react';
import type { KundaliChart, Planet } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';
import {
  VARGA_ORDER,
  VARGA_INFO,
  buildDivisionalChart,
  type VargaDivision,
} from '../../core/varga';
import {
  generateVargaInterpretation,
  type VargaObservation,
} from '../../core/vargaInterpretations';
import { NorthIndianChart } from './KundaliCharts';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  chart: KundaliChart;
}

/* Planet colours matching KundaliCharts */
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
  Ascendant: '#c9a227',
};

/* Canonical glyphs */
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
  Ascendant: '⬆',
};

const PLANET_ORDER: Planet[] = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu',
];

export default function DivisionalCharts({ chart }: Props) {
  const { language, t, formatPlanet, formatSign, formatDignity } = useLanguage();
  const [selectedDivision, setSelectedDivision] = useState<VargaDivision>(1);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [showPlanetInsights, setShowPlanetInsights] = useState(false);

  // Compute the selected divisional chart purely and deterministically from birth chart
  const divChart = useMemo(() => {
    return buildDivisionalChart(chart, selectedDivision);
  }, [chart, selectedDivision]);

  // Compute personalized plain-English/Marathi life interpretations from chart data
  const interpretation = useMemo(() => {
    return generateVargaInterpretation(divChart, language);
  }, [divChart, language]);

  const currentInfo = VARGA_INFO[selectedDivision];

  function handleSelectPlanet(p: string) {
    setSelectedPlanet(p === selectedPlanet ? null : p || null);
  }

  // Row 1: D1 - D6 | Row 2: D7 - D12
  const row1 = VARGA_ORDER.slice(0, 6);
  const row2 = VARGA_ORDER.slice(6, 12);

  return (
    <div className="fade-in" style={{ width: '100%', paddingBottom: '2.5rem' }}>
      {/* ─── Top Quick Comparison / Summary Card ─────────────────────────── */}
      <div
        className="card"
        style={{
          marginBottom: '1rem',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderTop: '3.5px solid var(--brand-400)',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-400)', fontWeight: 700 }}>
              {t('varga.vargaChart')}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{currentInfo.code} — {currentInfo.name}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                ({currentInfo.sanskritName})
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              <b>{language === 'mr' ? 'प्रमुख क्षेत्र:' : 'Main Area:'}</b> {currentInfo.area}
            </div>
          </div>

          {/* Quick Lagna badge */}
          <div
            style={{
              padding: '0.45rem 0.8rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('varga.vargaLagna')}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-400)' }}>
              {formatSign(divChart.lagnaSign)} {divChart.lagnaDegreeFormatted}
            </div>
          </div>
        </div>
      </div>

      {/* ─── D1–D12 Selector ─────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '0.85rem',
          background: 'var(--surface-raised)',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>{t('varga.selectVarga')}</span>
          <span>{t('varga.defaultSelection')}</span>
        </div>

        {/* 2-Row selector: D1-D6 / D7-D12 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {[row1, row2].map((row, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '0.4rem',
              }}
            >
              {row.map(d => {
                const info = VARGA_INFO[d];
                const isSel = selectedDivision === d;
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setSelectedDivision(d);
                      setSelectedPlanet(null);
                    }}
                    className={`btn ${isSel ? 'btn-secondary' : 'btn-ghost'}`}
                    style={{
                      padding: '0.55rem 0.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: isSel ? '1.5px solid var(--brand-400)' : '1px solid var(--border-subtle)',
                      background: isSel ? 'var(--brand-glow)' : 'var(--surface-overlay)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      minWidth: 0,
                    }}
                    title={`${info.code} — ${info.name}: ${info.area}`}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        lineHeight: 1.1,
                        color: isSel ? 'var(--brand-400)' : 'var(--text-primary)',
                      }}
                    >
                      {info.code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        lineHeight: 1.1,
                        color: isSel ? 'var(--text-primary)' : 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                        marginTop: '0.15rem',
                      }}
                    >
                      {info.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main Desktop Split Workspace ──────────────────────────────────── */}
      <div className="grid-desktop-split" style={{ alignItems: 'start', gap: '1.25rem' }}>
        {/* Left Column: Divisional Chart & Planet Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Chart Header */}
          <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
              {currentInfo.code} — {currentInfo.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
              "{currentInfo.description}"
            </p>
          </div>

          {/* Kundali Chart (Reusing North Indian Renderer) */}
          <div className="card card-hero" style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
            <div className="chart-wrapper" style={{ width: '100%', maxWidth: 540 }}>
              <NorthIndianChart
                chart={divChart.syntheticChart}
                selectedPlanet={selectedPlanet}
                onSelectPlanet={handleSelectPlanet}
              />
            </div>
          </div>

          {/* Planet Guide & Click Details */}
          <div className="card">
            <div className="card-title mb-2" style={{ fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('varga.planetsIn')} {currentInfo.code} ({currentInfo.name})</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                {t('varga.clickToInspect')}
              </span>
            </div>

            {/* Planet buttons row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
              {PLANET_ORDER.map(p => {
                const meta = PLANET_LABELS[p];
                const divP = divChart.planets[p];
                if (!meta || !divP) return null;
                const isSelected = selectedPlanet === p;
                return (
                  <button
                    key={p}
                    onClick={() => handleSelectPlanet(isSelected ? '' : p)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.1rem',
                      padding: '0.4rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: isSelected ? `${PC[p]}22` : 'var(--surface-overlay)',
                      border: `1.5px solid ${isSelected ? PC[p] : 'var(--border-subtle)'}`,
                      transition: 'all 0.15s',
                      flex: '1 1 auto',
                      minWidth: 52,
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', lineHeight: 1, color: PC[p] }}>
                      {GLYPHS[p]}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isSelected ? PC[p] : 'var(--text-secondary)' }}>
                      {formatPlanet(p)}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {language === 'mr' ? `भा${divP.vargaHouse} · ${formatSign(divP.vargaSign).substring(0, 3)}` : `H${divP.vargaHouse} · ${divP.vargaSign.substring(0, 3)}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Planet Detail Card */}
            {selectedPlanet && (() => {
              const p = selectedPlanet;
              const meta = PLANET_LABELS[p as keyof typeof PLANET_LABELS];
              const divP = divChart.planets[p];
              if (!meta || !divP) return null;

              return (
                <div
                  className="fade-in"
                  style={{
                    padding: '0.95rem 1.1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: `${PC[p]}11`,
                    border: `1.5px solid ${PC[p]}44`,
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '0.75rem 1.25rem',
                    alignItems: 'start',
                  }}
                >
                  {/* Big glyph */}
                  <div style={{ fontSize: '3rem', lineHeight: 1, color: PC[p], gridRow: '1/3' }}>
                    {GLYPHS[p]}
                  </div>

                  {/* Title + Sign & House comparison */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: PC[p] }}>
                        {formatPlanet(p)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ({meta.english} / {meta.sanskrit})
                      </span>
                      {divP.isRetrograde && (
                        <span className="badge badge-violet" style={{ fontSize: '0.68rem' }}>℞ {t('common.retrograde')}</span>
                      )}
                      {divP.isCombust && (
                        <span className="badge badge-crimson" style={{ fontSize: '0.68rem' }}>☄ {t('common.combust')}</span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <b>{currentInfo.code} {t('common.sign')}:</b> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatSign(divP.vargaSign)}</span> · {t('common.house')} {divP.vargaHouse} · {divP.vargaDegreeFormatted}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      <b>{t('varga.natalSign')}:</b> {formatSign(divP.natalSign)} · {t('common.house')} {divP.natalHouse} · {formatDegree(divP.natalDegreeInSign)}
                    </div>
                  </div>

                  {/* Badges Grid */}
                  <div style={{ gridColumn: '2', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem' }}>
                    {[
                      { label: t('varga.vargaDignity'), value: formatDignity(divP.dignity) },
                      { label: t('common.nakshatra'), value: divP.nakshatraName ? `${divP.nakshatraName} (${t('common.pada')} ${divP.nakshatraPada ?? '—'})` : '—' },
                      { label: t('varga.natalStrength'), value: divP.strengthLevel ?? '—' },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          background: 'var(--surface-overlay)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '0.3rem 0.65rem',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{label}</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Collapsible Technical Calculation Rules */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowTechnical(t => !t)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  padding: '0.4rem 0.5rem',
                }}
              >
                <span>⚙ {t('varga.techCalcRules')} ({currentInfo.code} — {currentInfo.name})</span>
                <span>{showTechnical ? `▲ ${t('varga.hideRule')}` : `▼ ${t('varga.viewRule')}`}</span>
              </button>

              {showTechnical && (
                <div
                  style={{
                    marginTop: '0.6rem',
                    padding: '0.75rem 0.95rem',
                    background: 'var(--surface-overlay)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>Varga Name</span>
                      <b>{currentInfo.name} ({currentInfo.sanskritName})</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>{t('varga.convention')}</span>
                      <b>{t('varga.parashariConvention')}</b>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>{t('varga.divisionFactor')}</span>
                      <b>{currentInfo.division} {t('varga.equalParts')} ({formatPartSize(30 / currentInfo.division)} {t('varga.each')})</b>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>{t('varga.calculationRule')}</span>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--text-primary)' }}>{currentInfo.rule}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: "What does this chart say about my life?" Interpretation Section */}
        <div
          className="card"
          style={{
            border: '1px solid var(--border-subtle)',
            borderTop: '3.5px solid var(--brand-400)',
            background: 'var(--surface-raised)',
            padding: '1.25rem 1.35rem',
          }}
        >
          {/* Section Header + Overall Strength Badge */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.85rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-400)', fontWeight: 700 }}>
                {t('varga.personalizedInterpretation')} · {interpretation.code} ({interpretation.name})
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.15rem 0 0', color: 'var(--text-primary)' }}>
                {t('varga.interpretationHeading')}
              </h3>
            </div>

            {/* Strength Indicator Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('varga.overallInfluence')}</span>
              <span
                className={`badge ${
                  interpretation.overallTone === 'Supportive'
                    ? 'badge-supportive'
                    : interpretation.overallTone === 'Challenging'
                    ? 'badge-challenging'
                    : 'badge-neutral'
                }`}
                style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', fontWeight: 700 }}
              >
                {interpretation.overallTone === 'Supportive' ? `✨ ${t('common.supportive')}` : interpretation.overallTone === 'Challenging' ? `⚖ ${t('common.challenging')}` : `⚡ ${t('common.mixed')}`}
              </span>
            </div>
          </div>

          {/* 1-Line Tone Summary */}
          <div
            style={{
              fontSize: '0.86rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.25rem',
              background: 'var(--surface-overlay)',
              padding: '0.65rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '3px solid var(--brand-400)',
              lineHeight: 1.5,
            }}
          >
            <b>{t('varga.toneSummary')}</b> {interpretation.toneExplanation}
          </div>

          {/* 1. What this chart is about */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-400)', marginBottom: '0.35rem' }}>
              📖 {t('varga.whatThisChartIsAbout')}
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {interpretation.about}
            </p>
          </div>

          {/* 2. What stands out */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-400)', marginBottom: '0.5rem' }}>
              🌟 {t('varga.whatStandsOut')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {interpretation.standout.map((item, idx) => (
                <ObservationCard key={idx} item={item} icon="🔹" />
              ))}
            </div>
          </div>

          {/* 3. Positive influences & 4. Things to watch */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {/* Positive influences */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--semantic-supportive-fg)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>✨</span> {t('varga.positiveInfluences')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {interpretation.positives.map((item, idx) => (
                  <ObservationCard key={idx} item={item} icon="✦" />
                ))}
              </div>
            </div>

            {/* Things to watch */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--semantic-challenging-fg)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>💡</span> {t('varga.thingsToWatch')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {interpretation.watchOuts.map((item, idx) => (
                  <ObservationCard key={idx} item={item} icon="⚡" />
                ))}
              </div>
            </div>
          </div>

          {/* 5. Overall takeaway */}
          <div
            style={{
              marginBottom: '1.25rem',
              background: 'var(--surface-overlay)',
              padding: '0.9rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              🧭 {t('varga.overallTakeaway')}
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {interpretation.takeaway}
            </p>
          </div>

          {/* 6. Collapsible Planet Insights */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.9rem' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setShowPlanetInsights(v => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                padding: '0.5rem 0.6rem',
              }}
            >
              <span>🪐 {t('varga.planetInsights')} ({interpretation.planetInsights.length} {t('varga.keyPlacements')})</span>
              <span>{showPlanetInsights ? `▲ ${t('varga.hideInsights')}` : `▼ ${t('varga.viewInsights')}`}</span>
            </button>

            {showPlanetInsights && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {interpretation.planetInsights.map(pi => (
                  <div
                    key={pi.planet}
                    style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: 'var(--radius-sm)',
                      background: `${PC[pi.planet] || 'var(--brand-400)'}0d`,
                      border: `1px solid ${PC[pi.planet] || 'var(--brand-400)'}33`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '1.25rem', color: PC[pi.planet] || 'var(--brand-400)', lineHeight: 1 }}>
                          {GLYPHS[pi.planet] || '•'}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {formatPlanet(pi.planet)}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          ({pi.placement})
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {pi.role}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      <div style={{ background: 'var(--surface-overlay)', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)' }}>
                        <span style={{ color: 'var(--semantic-supportive-fg)', fontWeight: 600 }}>✦ {t('varga.positiveSide')} </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{pi.positive}</span>
                      </div>
                      <div style={{ background: 'var(--surface-overlay)', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)' }}>
                        <span style={{ color: 'var(--semantic-challenging-fg)', fontWeight: 600 }}>✦ {t('varga.challengeToNavigate')} </span>
                        <span style={{ color: 'var(--text-secondary)' }}>{pi.challenge}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <b>{t('varga.astrologicalRule')}</b> {pi.technical}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informative Disclaimer */}
          <p className="text-xs text-muted mt-3" style={{ fontSize: '0.7rem', lineHeight: 1.4, color: 'var(--text-muted)' }}>
            {t('varga.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-Component: Observation Card with "Why?" and Technical toggle ──────── */
function ObservationCard({ item, icon }: { item: VargaObservation; icon: string }) {
  const { language, t } = useLanguage();
  const [showTech, setShowTech] = useState(false);

  return (
    <div
      style={{
        background: 'var(--surface-overlay)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.75rem 0.95rem',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ color: 'var(--brand-400)' }}>{icon}</span>
        <span style={{ color: 'var(--text-primary)' }}>{item.title}</span>
      </div>

      <p style={{ margin: '0.35rem 0 0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        {item.explanation}
      </p>

      {/* "Why?" explanation */}
      <div
        style={{
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-xs)',
          padding: '0.4rem 0.65rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          borderLeft: '2.5px solid var(--brand-400)',
          lineHeight: 1.4,
        }}
      >
        <b style={{ color: 'var(--text-secondary)' }}>{language === 'mr' ? 'का? ' : 'Why? '}</b>
        {item.why}
      </div>

      {/* Optional Technical Details disclosure */}
      {item.technicalDetail && (
        <div style={{ marginTop: '0.35rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowTech(t => !t)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0.1rem 0.3rem',
            }}
          >
            {showTech ? `▲ ${t('common.hideTechnical')}` : `▼ ${t('common.showTechnical')}`}
          </button>
          {showTech && (
            <div
              style={{
                textAlign: 'left',
                marginTop: '0.25rem',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                fontFamily: 'monospace',
              }}
            >
              {item.technicalDetail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Helper to format degree */
function formatDegree(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}'`;
}

/* Helper to format part size (e.g. 3.3333 -> 3°20') */
function formatPartSize(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}'`;
}
