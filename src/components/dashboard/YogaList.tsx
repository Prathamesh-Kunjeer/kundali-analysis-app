import React, { useState, useMemo, useCallback } from 'react';
import type { KundaliChart, YogaResult } from '../../core/models';
import { calculateCurrentSky } from '../../core/calculator';
import {
  evaluateAllYogaCautions,
  type YogaCautionEvaluation,
  type CurrentSkyData
} from '../../core/yogaCautionEvaluator';
import { useLanguage } from '../../context/LanguageContext';

interface Props { chart: KundaliChart; }

const CATEGORY_COLORS: Record<string, string> = {
  Mahapurusha: 'var(--brand-400)',
  RajaYoga: 'var(--brand-400)',
  DhanaYoga: 'var(--semantic-supportive-fg)',
  AuspiciousYoga: 'var(--semantic-supportive-fg)',
  InauspiciousYoga: 'var(--semantic-challenging-fg)',
  VipareetsRajaYoga: 'var(--semantic-neutral-fg)',
};

const STRENGTH_COLORS: Record<string, string> = {
  Exceptional: 'var(--brand-400)',
  Strong: 'var(--semantic-supportive-fg)',
  Moderate: 'var(--semantic-neutral-fg)',
  Mild: 'var(--text-muted)',
};

function getCategoryLabel(cat: string, lang: string = 'en'): string {
  if (lang === 'mr') {
    const mrMap: Record<string, string> = {
      Mahapurusha: 'पंच महापुरुष योग',
      RajaYoga: 'राजयोग',
      DhanaYoga: 'धनयोग',
      AuspiciousYoga: 'शुभ योग',
      InauspiciousYoga: 'आव्हानात्मक योग',
      VipareetsRajaYoga: 'विपरीत राजयोग',
    };
    return mrMap[cat] || cat;
  }
  const enMap: Record<string, string> = {
    Mahapurusha: 'Pancha Mahapurusha',
    RajaYoga: 'Raja Yoga',
    DhanaYoga: 'Dhana Yoga',
    AuspiciousYoga: 'Auspicious Yoga',
    InauspiciousYoga: 'Challenging Yoga',
    VipareetsRajaYoga: 'Vipareeta Raja Yoga',
  };
  return enMap[cat] || cat;
}

function getStrengthLabel(str: string, lang: string = 'en'): string {
  if (lang === 'mr') {
    const mrMap: Record<string, string> = {
      Exceptional: 'अतिउत्कृष्ट',
      Strong: 'बलवान',
      Moderate: 'मध्यम',
      Mild: 'सौम्य',
    };
    return mrMap[str] || str;
  }
  return str;
}

export default function YogaList({ chart }: Props) {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Shared Current Sky dataset for transit evaluations: auto-updates on chart switch or manual refresh
  const [refreshKey, setRefreshKey] = useState(0);
  const skyData = useMemo<CurrentSkyData>(() => {
    return calculateCurrentSky(chart.birthData.latitude, chart.birthData.longitude, chart.birthData.timezone, chart);
  }, [chart, refreshKey]);

  const refreshTransits = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Single batch caution evaluation for all yogas in active chart
  const cautionEvaluations = useMemo(() => {
    return evaluateAllYogaCautions(chart, skyData);
  }, [chart, skyData]);

  const { yogas } = chart;
  const categories = ['All', ...Array.from(new Set(yogas.map(y => y.category)))];

  const filtered = filter === 'All' ? yogas : yogas.filter(y => y.category === filter);
  const strongYogas = yogas.filter(y => ['Exceptional', 'Strong'].includes(y.strength));
  const moderateYogas = yogas.filter(y => y.strength === 'Moderate');

  // Count active transit cautions across current filtered yogas
  const activeCautionCount = useMemo(() => {
    return yogas.filter(y => cautionEvaluations[y.id]?.status === 'Caution Active').length;
  }, [yogas, cautionEvaluations]);

  const timeStr = skyData.calculatedAt.toLocaleTimeString(language === 'mr' ? 'mr-IN' : 'en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const dateStr = skyData.calculatedAt.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="fade-in">
      {/* ─── Hero Summary Header ───────────────────────────────────────── */}
      <div className="card card-hero" style={{ marginBottom:'1.5rem', padding:'1.5rem 1.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'1.25rem' }}>
          <div>
            <h2 style={{ fontSize:'1.35rem', fontWeight:800, margin:0, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span>✨</span>
              <span>{language === 'mr' ? 'कुंडलीतील राजयोग व शुभ योग' : 'Raj Yogas in this Kundali'}</span>
            </h2>
            <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'0.25rem', marginBottom:0 }}>
              {language === 'mr'
                ? 'जन्मपत्रिकेतील उपस्थित राजयोग आणि सध्याच्या गोचर स्थितीनुसार सजगता अटींचे थेट विश्लेषण.'
                : 'Natal Raj Yogas with real-time transit caution condition evaluation based on live Current Sky data.'}
            </p>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.35rem' }}>
              📡 {t('yoga.basedOnCurrentSky')} · {t('yoga.calculated')}: <b>{dateStr}</b> {timeStr}
            </div>
          </div>

          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
            <span className="badge badge-gold" style={{ fontSize:'0.8rem', padding:'0.35rem 0.85rem' }}>
              {yogas.length} {language === 'mr' ? 'योग उपस्थित' : 'Total Detected'}
            </span>
            <button
              onClick={refreshTransits}
              className="btn btn-secondary"
              style={{ fontSize:'0.78rem', padding:'0.35rem 0.75rem', display:'inline-flex', alignItems:'center', gap:'4px' }}
              title={t('yoga.refreshTransits')}
            >
              🔄 {t('yoga.refreshTransits')}
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'0.85rem' }}>
          <div style={{ background:'var(--surface-overlay)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', borderLeft:'3.5px solid var(--brand-400)' }}>
            <div style={{ fontSize:'0.7rem', textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.06em', fontWeight:600 }}>
              {language === 'mr' ? 'एकूण उपस्थित योग' : 'Detected Yogas'}
            </div>
            <div style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--brand-400)', marginTop:'0.15rem' }}>
              {yogas.length}
            </div>
          </div>

          <div style={{ background:'var(--surface-overlay)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', borderLeft:'3.5px solid var(--semantic-supportive-fg)' }}>
            <div style={{ fontSize:'0.7rem', textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.06em', fontWeight:600 }}>
              🌟 {language === 'mr' ? 'अतिउत्कृष्ट व बलवान' : 'Strong & Exceptional'}
            </div>
            <div style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--semantic-supportive-fg)', marginTop:'0.15rem' }}>
              {strongYogas.length}
            </div>
          </div>

          <div style={{ background:'var(--surface-overlay)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', borderLeft:'3.5px solid var(--semantic-neutral-fg)' }}>
            <div style={{ fontSize:'0.7rem', textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.06em', fontWeight:600 }}>
              ⚖ {language === 'mr' ? 'मध्यम प्रभाव' : 'Moderate Strength'}
            </div>
            <div style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--semantic-neutral-fg)', marginTop:'0.15rem' }}>
              {moderateYogas.length}
            </div>
          </div>

          <div style={{ background:'var(--surface-overlay)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', borderLeft:`3.5px solid ${activeCautionCount > 0 ? '#f59e0b' : 'var(--semantic-supportive-fg)'}` }}>
            <div style={{ fontSize:'0.7rem', textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.06em', fontWeight:600 }}>
              {activeCautionCount > 0 ? '🟠' : '🟢'} {language === 'mr' ? 'गोचर सजगता सक्रिय' : 'Transit Caution Active'}
            </div>
            <div style={{ fontSize:'1.35rem', fontWeight:800, color: activeCautionCount > 0 ? '#f59e0b' : 'var(--semantic-supportive-fg)', marginTop:'0.15rem' }}>
              {activeCautionCount} <span style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-muted)' }}>/ {yogas.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Category Filter Chips ─────────────────────────────────────── */}
      <div style={{ display:'flex', gap:'0.45rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {categories.map(cat => {
          const count = cat === 'All' ? yogas.length : yogas.filter(y => y.category === cat).length;
          const isAct = filter === cat;
          return (
            <button
              key={cat}
              className={`btn ${isAct ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ padding:'0.35rem 0.85rem', fontSize:'0.78rem' }}
              onClick={() => setFilter(cat)}
            >
              {cat === 'All' ? (language === 'mr' ? 'सर्व योग' : 'All Yogas') : getCategoryLabel(cat, language)}
              <span className="badge badge-subtle" style={{ marginLeft: 4, fontSize:'0.65rem' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Yoga Cards Grid (Desktop 2-Column) ─────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <p>
            {language === 'mr'
              ? 'या वर्गामध्ये कोणताही योग आढळला नाही.'
              : 'No yogas found in this category for the current chart.'}
          </p>
        </div>
      ) : (
        <div className="grid-desktop-2">
          {filtered.map(yoga => (
            <YogaCard
              key={yoga.id}
              yoga={yoga}
              evaluation={cautionEvaluations[yoga.id]}
              timestampStr={`${dateStr} ${timeStr}`}
              isExpanded={expanded === yoga.id}
              onToggle={() => setExpanded(expanded === yoga.id ? null : yoga.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function YogaCard({
  yoga,
  evaluation,
  timestampStr,
  isExpanded,
  onToggle
}: {
  yoga: YogaResult;
  evaluation?: YogaCautionEvaluation;
  timestampStr: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { language, t, formatPlanet, formatSign } = useLanguage();
  const [showEvidence, setShowEvidence] = useState(false);

  const isChallenge = yoga.category === 'InauspiciousYoga';
  const borderColor = CATEGORY_COLORS[yoga.category] || 'var(--border-subtle)';

  const isCautionActive = evaluation?.status === 'Caution Active';
  const hasEvaluation = !!evaluation;

  return (
    <div
      className="card card-interactive"
      style={{
        borderLeft: `4px solid ${borderColor}`,
        cursor: 'pointer',
        padding: '1.25rem 1.35rem',
      }}
      onClick={onToggle}
    >
      {/* Header Row: Icon, Title, Category & Strength Badges, Caret */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.75rem' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
          <div style={{
            width:36, height:36, borderRadius:'50%',
            background: isChallenge ? 'rgba(229,62,62,0.15)' : 'var(--brand-glow)',
            display:'grid', placeItems:'center', fontSize:'1.15rem', flexShrink:0,
            color: isChallenge ? 'var(--danger-fg)' : 'var(--brand-400)',
          }}>
            {isChallenge ? '⚠' : '✨'}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--text-primary)', lineHeight:1.3 }}>
              {yoga.name}
            </div>
            <div style={{ display:'flex', gap:'0.4rem', marginTop:'0.35rem', flexWrap:'wrap', alignItems:'center' }}>
              <span className="badge" style={{ background: borderColor + '22', color: borderColor, border: `1px solid ${borderColor}66`, fontSize:'0.68rem' }}>
                {getCategoryLabel(yoga.category, language)}
              </span>
              <span className="badge badge-subtle" style={{ fontSize:'0.68rem', color: STRENGTH_COLORS[yoga.strength] }}>
                {getStrengthLabel(yoga.strength, language)}
              </span>
            </div>
          </div>
        </div>

        <span style={{
          color:'var(--text-muted)',
          fontSize:'0.85rem',
          transition:'transform 0.2s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'none',
          padding:'0.25rem',
        }}>
          ▼
        </span>
      </div>

      {/* ─── Compact Status Dual Badges (Always Visible) ────────────────── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))',
        gap:'0.5rem',
        marginTop:'0.85rem',
        marginBottom:'0.45rem',
      }}>
        {/* Natal Status */}
        <div style={{
          background:'var(--surface-overlay)',
          padding:'0.45rem 0.65rem',
          borderRadius:'var(--radius-sm)',
          border:'1px solid var(--border-subtle)',
        }}>
          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.03em' }}>
            {t('yoga.birthStatus')}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'2px', fontWeight:700, fontSize:'0.8rem', color:'var(--semantic-supportive-fg)' }}>
            <span>🟢</span>
            <span>{t('yoga.presentInBirth')}</span>
          </div>
        </div>

        {/* Real-Time Current Condition Status */}
        <div style={{
          background:'var(--surface-overlay)',
          padding:'0.45rem 0.65rem',
          borderRadius:'var(--radius-sm)',
          border: `1px solid ${isCautionActive ? 'rgba(245, 158, 11, 0.45)' : 'rgba(16, 185, 129, 0.35)'}`,
        }}>
          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.03em' }}>
            {t('yoga.currentCondition')}
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:'4px', marginTop:'2px', fontWeight:700, fontSize:'0.8rem',
            color: isCautionActive ? '#f59e0b' : 'var(--semantic-supportive-fg)'
          }}>
            <span>{isCautionActive ? '🟠' : '🟢'}</span>
            <span>{isCautionActive ? t('yoga.cautionActive') : t('yoga.noCaution')}</span>
          </div>
        </div>
      </div>

      {/* Brief description / traditional meaning */}
      <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'0.5rem', marginBottom:0, lineHeight:1.55 }}>
        {yoga.description}
      </p>

      {/* ─── Expanded Real-Time Analysis & Technical Evidence ───────────── */}
      {isExpanded && (
        <div className="fade-in" style={{ marginTop:'1rem', paddingTop:'0.85rem', borderTop:'1px solid var(--border-subtle)' }}>
          
          {/* Timestamp Notice */}
          <div style={{
            fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'0.75rem',
            display:'flex', alignItems:'center', gap:'4px'
          }}>
            <span>📡</span>
            <span>{t('yoga.basedOnCurrentSky')} · {t('yoga.calculated')}: <b>{timestampStr}</b></span>
          </div>

          {/* Why this status? Explanation Box */}
          {hasEvaluation && (
            <div style={{
              background: isCautionActive ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              borderLeft: `3px solid ${isCautionActive ? '#f59e0b' : 'var(--semantic-supportive-fg)'}`,
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '0.75rem',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                fontWeight: 700, fontSize: '0.76rem',
                color: isCautionActive ? '#f59e0b' : 'var(--semantic-supportive-fg)',
                marginBottom: '3px',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <span>{isCautionActive ? '⚡' : '🛡'}</span>
                <span>{t('yoga.why')}</span>
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                {language === 'mr' ? evaluation.whySummaryMr : evaluation.whySummary}
              </div>
            </div>
          )}

          {/* Expandable "See Why" Evidence Trigger */}
          {hasEvaluation && evaluation.checks.length > 0 && (
            <div style={{ marginBottom: '0.85rem' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEvidence(prev => !prev);
                }}
                className="btn btn-ghost"
                style={{
                  fontSize: '0.74rem',
                  padding: '0.25rem 0.6rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--brand-400)',
                  fontWeight: 600,
                  background: 'var(--surface-overlay)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)'
                }}
              >
                <span>{showEvidence ? '▲' : '▼'}</span>
                <span>{showEvidence ? t('yoga.hideWhy') : t('yoga.seeWhy')}</span>
              </button>

              {/* Exact Planetary Checks Table/Card */}
              {showEvidence && (
                <div
                  className="fade-in"
                  style={{
                    marginTop: '0.6rem',
                    background: 'var(--surface-overlay)',
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.65rem',
                    marginBottom: '0.65rem'
                  }}>
                    {evaluation.checks.map(c => {
                      return (
                        <div
                          key={c.planet}
                          style={{
                            background: 'var(--surface-raised)',
                            padding: '0.6rem 0.75rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--brand-400)', marginBottom: '4px', fontSize: '0.84rem' }}>
                            {formatPlanet(c.planet)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', color: 'var(--text-secondary)' }}>
                            <div>• {t('yoga.currentSign')}: <b>{formatSign(c.sign)}</b></div>
                            <div>• {t('yoga.degree')}: <b>{c.dmsString}</b></div>
                            {c.checksPerformed.debilitated !== undefined && (
                              <div>
                                • {t('yoga.debilitated')}: <b style={{ color: c.isDebilitated ? '#ef4444' : '#10b981' }}>
                                  {c.isDebilitated ? t('yoga.yes') : t('yoga.no')}
                                </b>
                              </div>
                            )}
                            {c.checksPerformed.combust !== undefined && (
                              <div>
                                • {t('yoga.combust')}: <b style={{ color: c.isCombust ? '#ef4444' : '#10b981' }}>
                                  {c.isCombust ? t('yoga.yes') : t('yoga.no')}
                                </b>
                              </div>
                            )}
                            {c.checksPerformed.heavilyAfflicted !== undefined && (
                              <div>
                                • {t('yoga.heavyMalefic')}: <b style={{ color: c.isHeavilyAfflicted ? '#ef4444' : '#10b981' }}>
                                  {c.isHeavilyAfflicted
                                    ? `${t('yoga.yes')}${c.afflictionSummary ? ` (${language === 'mr' ? c.afflictionSummaryMr : c.afflictionSummary})` : ''}`
                                    : t('yoga.no')}
                                </b>
                              </div>
                            )}
                            {c.checksPerformed.retrograde !== undefined && (
                              <div>
                                • {t('yoga.retrograde')}: <b style={{ color: c.isRetrograde ? '#f59e0b' : '#10b981' }}>
                                  {c.isRetrograde ? t('yoga.yes') : t('yoga.no')}
                                </b>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Result Box */}
                  <div style={{
                    padding: '0.45rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    background: isCautionActive ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    color: isCautionActive ? '#f59e0b' : '#10b981',
                    fontWeight: 600,
                    fontSize: '0.76rem'
                  }}>
                    <b>{t('yoga.result')}:</b> {language === 'mr' ? evaluation.resultExplanationMr : evaluation.resultExplanation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Planets, Houses, Signs Involved */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'0.5rem', marginBottom:'0.85rem' }}>
            <div style={{ background:'var(--surface-overlay)', padding:'0.5rem 0.7rem', borderRadius:'var(--radius-sm)' }}>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{language === 'mr' ? 'संबंधित ग्रह' : 'Planets Involved'}</div>
              <div style={{ fontWeight:600, fontSize:'0.8rem', color:'var(--text-primary)', marginTop:'0.15rem' }}>
                {yoga.planetsInvolved.map(p => formatPlanet(p)).join(', ')}
              </div>
            </div>

            <div style={{ background:'var(--surface-overlay)', padding:'0.5rem 0.7rem', borderRadius:'var(--radius-sm)' }}>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{language === 'mr' ? 'संबंधित भाव' : 'Houses Involved'}</div>
              <div style={{ fontWeight:600, fontSize:'0.8rem', color:'var(--text-primary)', marginTop:'0.15rem' }}>
                {yoga.housesInvolved.map(h => `H${h}`).join(', ')}
              </div>
            </div>

            <div style={{ background:'var(--surface-overlay)', padding:'0.5rem 0.7rem', borderRadius:'var(--radius-sm)' }}>
              <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{language === 'mr' ? 'संबंधित राशी' : 'Signs Involved'}</div>
              <div style={{ fontWeight:600, fontSize:'0.8rem', color:'var(--text-primary)', marginTop:'0.15rem' }}>
                {yoga.signsInvolved.map(s => formatSign(s)).join(', ')}
              </div>
            </div>
          </div>

          {/* Positive influence */}
          {yoga.positiveEffects && (
            <div style={{ marginBottom:'0.65rem' }}>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--semantic-supportive-fg)', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                <span>✅</span>
                <span>{language === 'mr' ? 'शुभ फळ व प्रभाव' : 'Positive Influence'}</span>
              </div>
              <div style={{ fontSize:'0.84rem', color:'var(--text-secondary)', marginLeft:'0.85rem', lineHeight:1.6 }}>
                {yoga.positiveEffects}
              </div>
            </div>
          )}

          {/* Classical Caution Rule Reference */}
          {yoga.cautionaryEffects && (
            <div>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--semantic-neutral-fg)', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                <span>📜</span>
                <span>{t('yoga.classicalRule')}</span>
              </div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginLeft:'0.85rem', lineHeight:1.55, fontStyle:'italic' }}>
                &ldquo;{yoga.cautionaryEffects}&rdquo;
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
