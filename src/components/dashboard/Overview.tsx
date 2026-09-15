import React, { useMemo, useState } from 'react';
import type { KundaliChart, Planet } from '../../core/models';
import type { Profile } from '../../utils/profiles';
import { validateProfileLocation } from '../../utils/locationValidator';
import { PLANET_LABELS } from '../../core/constants';
import { useLanguage } from '../../context/LanguageContext';
import { PLANET_THEME_COLORS, withAlpha } from '../../utils/themeColors';
import { generateOverviewInsights } from '../../core/overviewEngine';

interface Props {
  chart: KundaliChart;
  onNavigate?: (tab: string) => void;
  profile?: Profile | null;
  onEditProfile?: () => void;
}

const PC = PLANET_THEME_COLORS;

function formatDate(d: Date, lang: string = 'en') {
  return new Date(d).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { month:'short', year:'numeric' });
}

export default function Overview({ chart, onNavigate, profile, onEditProfile }: Props) {
  const { language, t, formatPlanet, formatSign } = useLanguage();
  const {
    birthData, lagnaSign, lagnaLord, moonSign, sunSign,
    janmaNakshatra, janmaNakshatraPada, dasha, doshas, yogas,
  } = chart;

  const curMaha = dasha.currentMahadasha;
  const curAntar = dasha.currentAntardasha;
  const manglik  = doshas.find(d => d.id === 'manglik');
  const kaalSarp = doshas.find(d => d.id === 'kaal_sarp');
  const sadeSati = doshas.find(d => d.id === 'sade_sati');

  const rajaYogas  = yogas.filter(y => ['RajaYoga','Mahapurusha','DhanaYoga'].includes(y.category));
  const topYogas   = rajaYogas.slice(0, 4);

  // Generate evidence-first personalized overview insights (Career, Wealth, Relationships, Growth)
  const insights = useMemo(() => generateOverviewInsights(chart), [chart]);
  const [expandedTrace, setExpandedTrace] = useState<Record<string, boolean>>({});

  const toggleTrace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTrace(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const locationString = [birthData.cityName, birthData.state, birthData.country].filter(Boolean).join(', ');
  const lat = birthData.latitude;
  const lon = birthData.longitude;
  const latFormatted = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const lonFormatted = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
  const tzOffset = birthData.timezone;
  const tzFormatted = `UTC${tzOffset >= 0 ? '+' : ''}${tzOffset}`;

  const locationValidation = profile?.locationNeedsVerification
    ? { isMismatch: true, reason: language === 'mr' ? 'जन्मस्थानाचे निर्देशांक पडताळणे आवश्यक आहे' : 'Stored coordinates may not match the birth city.' }
    : validateProfileLocation(birthData);

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
      {/* Location Verification Alert if coordinates mismatch */}
      {locationValidation.isMismatch && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
          gap: '0.75rem', padding: '0.75rem 1.15rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(217, 79, 79, 0.08)', border: '1px solid var(--danger-fg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            <span style={{ fontSize: '1.15rem' }}>⚠️</span>
            <span>
              <b>{t('common.locationVerificationNeeded')}:</b> {locationValidation.reason || locationString}
            </span>
          </div>
          {onEditProfile && (
            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }} onClick={onEditProfile}>
              {t('common.fixLocation')}
            </button>
          )}
        </div>
      )}

      {/* ─── HERO IDENTITY BANNER ────────────────────────────────────────── */}
      <div className="card card-hero">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <img
                src="/brand/logo-icon.png"
                alt="Kundali Analysis Emblem"
                width={36}
                height={36}
                style={{ objectFit:'contain', filter: 'drop-shadow(0 1px 4px rgba(201, 151, 22, 0.25))' }}
              />
              <div>
                <h2 style={{ fontSize:'1.45rem', fontWeight:800, margin:0, color:'var(--text-primary)', letterSpacing:'0.02em' }}>
                  {birthData.name || (language === 'mr' ? 'जन्मकुंडली विश्लेषण' : 'Natal Chart')}
                </h2>
                <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'0.2rem' }}>
                  {birthData.dob} · {birthData.tob} · <b>{locationString}</b>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <span className="badge badge-gold" style={{ fontSize:'0.75rem', padding:'0.3rem 0.75rem' }}>
              Lahiri {chart.ayanamsha.toFixed(3)}°
            </span>
            <span className="badge badge-subtle" style={{ fontSize:'0.75rem', padding:'0.3rem 0.75rem' }}>
              {latFormatted}, {lonFormatted}
            </span>
            <span className="badge badge-subtle" style={{ fontSize:'0.75rem', padding:'0.3rem 0.75rem' }}>
              {tzFormatted}{birthData.tzName ? ` (${birthData.tzName})` : ''}
            </span>
          </div>
        </div>

        {/* 4 Celestial Pillar Badges */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',
          gap:'1rem',
          marginTop:'0.75rem',
        }}>
          {/* Lagna */}
          <div style={{
            background:'var(--surface-overlay)',
            padding:'0.9rem 1.1rem',
            borderRadius:'var(--radius-md)',
            border:'1px solid var(--border-subtle)',
            borderLeft:'3.5px solid var(--color-border-accent)',
          }}>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
              🌅 {t('overview.natalLagna')}
            </div>
            <div style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)', marginTop:'0.2rem' }}>
              {formatSign(lagnaSign)}
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.15rem' }}>
              {t('common.lord')}: <b style={{ color:'var(--color-text-accent)' }}>{formatPlanet(lagnaLord)}</b>
            </div>
          </div>

          {/* Moon Sign */}
          <div style={{
            background:'var(--surface-overlay)',
            padding:'0.9rem 1.1rem',
            borderRadius:'var(--radius-md)',
            border:'1px solid var(--border-subtle)',
            borderLeft:'3.5px solid var(--color-planet-moon)',
          }}>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
              🌙 {t('overview.moonSign')}
            </div>
            <div style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)', marginTop:'0.2rem' }}>
              {formatSign(moonSign)}
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.15rem' }}>
              {t('common.mindComfort')}
            </div>
          </div>

          {/* Sun Sign */}
          <div style={{
            background:'var(--surface-overlay)',
            padding:'0.9rem 1.1rem',
            borderRadius:'var(--radius-md)',
            border:'1px solid var(--border-subtle)',
            borderLeft:'3.5px solid var(--color-planet-sun)',
          }}>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
              ☀️ {t('overview.sunSign')}
            </div>
            <div style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)', marginTop:'0.2rem' }}>
              {formatSign(sunSign)}
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.15rem' }}>
              {t('common.vitalitySoul')}
            </div>
          </div>

          {/* Nakshatra */}
          <div style={{
            background:'var(--surface-overlay)',
            padding:'0.9rem 1.1rem',
            borderRadius:'var(--radius-md)',
            border:'1px solid var(--border-subtle)',
            borderLeft:'3.5px solid var(--color-planet-venus)',
          }}>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
              ✨ {t('overview.nakshatraPada')}
            </div>
            <div style={{ fontSize:'1.18rem', fontWeight:800, color:'var(--text-primary)', marginTop:'0.2rem' }}>
              {janmaNakshatra.name}
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.15rem' }}>
              {t('common.pada')} {janmaNakshatraPada}
            </div>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP 2-COLUMN WORKSPACE ──────────────────────────────────── */}
      <div className="grid-desktop-2">
        {/* ─── LEFT COLUMN: What stands out in your Kundali? ───────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div>
            <h3 style={{
              fontSize:'1.2rem',
              fontWeight:800,
              color:'var(--text-primary)',
              letterSpacing:'0.02em',
              margin:0,
              display:'flex',
              alignItems:'center',
              gap:'0.5rem',
            }}>
              <span>🌟</span>
              <span>{language === 'mr' ? 'तुमच्या कुंडलीत काय विशेष दिसून येते?' : 'What stands out in your Kundali?'}</span>
            </h3>
            <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.25rem' }}>
              {language === 'mr'
                ? 'महत्त्वाचे ग्रह, भाव आणि योगांवर आधारित सोप्या भाषेतील जीवन पैलू.'
                : 'Key personal themes distilled from planetary combinations and house relationships.'}
            </p>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.15rem' }}>
            {insights.map((insight) => {
              const borderCol = insight.level === 'supportive'
                ? 'var(--semantic-supportive-border)'
                : insight.level === 'mindful'
                ? 'var(--semantic-challenging-border)'
                : 'var(--semantic-neutral-border)';

              const badgeClass = insight.level === 'supportive'
                ? 'badge-supportive'
                : insight.level === 'mindful'
                ? 'badge-challenging'
                : 'badge-neutral';

              const badgeLabel = insight.level === 'supportive'
                ? (language === 'mr' ? 'शुभ / अनुकूल' : 'Supportive')
                : insight.level === 'mindful'
                ? (language === 'mr' ? 'सजगता आवश्यक' : 'Mindful Focus')
                : (language === 'mr' ? 'मिश्र प्रभाव' : 'Mixed Influences');

              const isTraceOpen = expandedTrace[insight.category] ?? false;

              return (
                <div
                  key={insight.category}
                  className="card-insight"
                  style={{ borderLeftColor: borderCol }}
                >
                  {/* Card Header: Icon, Domain Title, Level Badge */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.55rem' }}>
                      <span style={{ fontSize:'1.25rem' }}>{insight.icon}</span>
                      <span style={{ fontWeight:800, fontSize:'0.96rem', color:'var(--text-primary)', letterSpacing:'0.01em' }}>
                        {insight.title[language]}
                      </span>
                    </div>
                    <span className={`badge ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                  </div>

                  {/* Main Theme Headline */}
                  <div className="insight-title" style={{ marginTop:'0.2rem', fontSize:'1.04rem', fontWeight:800, lineHeight:1.35 }}>
                    {insight.headline[language]}
                  </div>

                  {/* Why this appears (Concrete Chart Evidence) */}
                  <div style={{ marginTop:'0.4rem' }}>
                    <div style={{ fontSize:'0.73rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-text-accent)', marginBottom:'0.25rem' }}>
                      {language === 'mr' ? 'हे का दिसते (कुंडलीतील पुरावा):' : 'Why this appears in your chart:'}
                    </div>
                    <ul style={{ margin:0, paddingLeft:'1.15rem', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                      {insight.evidence.map((ev, i) => (
                        <li key={i} style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.55 }}>
                          {ev[language]}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What this can mean (Practical Interpretations) */}
                  {insight.interpretations.length > 0 && (
                    <div style={{ marginTop:'0.35rem' }}>
                      <div style={{ fontSize:'0.73rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', marginBottom:'0.2rem' }}>
                        {language === 'mr' ? 'याचा व्यावहारिक अर्थ:' : 'What this can mean:'}
                      </div>
                      <ul style={{ margin:0, paddingLeft:'1.15rem', display:'flex', flexDirection:'column', gap:'0.2rem' }}>
                        {insight.interpretations.map((interp, i) => (
                          <li key={i} style={{ fontSize:'0.84rem', color:'var(--text-primary)', lineHeight:1.55 }}>
                            {interp[language]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Considerations & Cautions */}
                  {insight.cautions.length > 0 && (
                    <div style={{
                      marginTop:'0.45rem', padding:'0.5rem 0.75rem', borderRadius:'var(--radius-sm)',
                      background:'var(--surface-overlay)', border:'1px solid var(--border-subtle)'
                    }}>
                      <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--danger-fg)', marginBottom:'0.2rem' }}>
                        ⚠️ {language === 'mr' ? 'दक्षता व विचारपूर्वक पावले:' : 'Considerations & Watchout:'}
                      </div>
                      <ul style={{ margin:0, paddingLeft:'1.15rem', display:'flex', flexDirection:'column', gap:'0.15rem' }}>
                        {insight.cautions.map((c, i) => (
                          <li key={i} style={{ fontSize:'0.81rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
                            {c[language]}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technical Traceability & Deep-link Action Row */}
                  <div style={{ marginTop:'0.6rem', paddingTop:'0.5rem', borderTop:'1px dashed var(--border-subtle)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', color:'var(--color-text-accent)' }}
                        onClick={(e) => toggleTrace(insight.category, e)}
                        aria-expanded={isTraceOpen}
                      >
                        🔍 {language === 'mr' ? (isTraceOpen ? 'कुंडली तपशील लपवा' : 'हे का दिसते? (तांत्रिक पुरावा)') : (isTraceOpen ? 'Hide technical factors' : 'Why am I seeing this? (Chart Evidence)')}
                      </button>

                      {insight.targetTab && onNavigate && (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ fontSize:'0.75rem', padding:'0.2rem 0.5rem', color:'var(--brand-400)' }}
                          onClick={(e) => { e.stopPropagation(); onNavigate(insight.targetTab); }}
                        >
                          {language === 'mr' ? 'सविस्तर विश्लेषण पहा →' : 'Explore details →'}
                        </button>
                      )}
                    </div>

                    {/* Expandable Astrological Details */}
                    {isTraceOpen && (
                      <div style={{
                        marginTop:'0.45rem', padding:'0.6rem 0.85rem', borderRadius:'var(--radius-sm)',
                        background:'var(--surface-raised)', border:'1px solid var(--border-subtle)',
                        fontSize:'0.76rem', color:'var(--text-secondary)'
                      }}>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem 1.15rem' }}>
                          <div>
                            <b>{language === 'mr' ? 'संबंधित ग्रह:' : 'Relevant Grahas:'}</b>{' '}
                            {insight.traceability.planets.map(p => formatPlanet(p)).join(', ')}
                          </div>
                          <div>
                            <b>{language === 'mr' ? 'संबंधित भाव:' : 'Bhavas:'}</b>{' '}
                            {insight.traceability.houses.map(h => `${h}th`).join(', ')}
                          </div>
                          <div>
                            <b>{language === 'mr' ? 'राशी:' : 'Signs:'}</b>{' '}
                            {insight.traceability.signs.map(s => formatSign(s)).join(', ')}
                          </div>
                          {insight.traceability.yogas && insight.traceability.yogas.length > 0 && (
                            <div>
                              <b>{language === 'mr' ? 'सक्रिय योग:' : 'Active Yogas:'}</b>{' '}
                              {insight.traceability.yogas.join(', ')}
                            </div>
                          )}
                          {insight.traceability.aspects && insight.traceability.aspects.length > 0 && (
                            <div>
                              <b>{language === 'mr' ? 'दृष्टी प्रभाव:' : 'Drishti Aspects:'}</b>{' '}
                              {insight.traceability.aspects.join(', ')}
                            </div>
                          )}
                          {insight.traceability.dashaLink && (
                            <div>
                              <b>{language === 'mr' ? 'दशा संबंध:' : 'Dasha Link:'}</b>{' '}
                              {insight.traceability.dashaLink}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Context Panels ────────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {/* Running Dasha Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🕐 {language === 'mr' ? 'चालू महादशा व वेळ' : 'Running Dasha Period'}</span>
              {onNavigate && (
                <button className="btn btn-ghost" style={{ fontSize:'0.74rem', padding:'0.2rem 0.55rem' }} onClick={() => onNavigate('dasha')}>
                  {language === 'mr' ? 'दशा टाइमलाइन →' : 'Timeline →'}
                </button>
              )}
            </div>

            {curMaha ? (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
                  <div style={{
                    width:42, height:42, borderRadius:'50%',
                    background: withAlpha(PC[curMaha.planet] || 'var(--color-planet-sun)', 14),
                    border:`2px solid ${PC[curMaha.planet] || 'var(--color-border-accent)'}`,
                    display:'grid', placeItems:'center', fontSize:'1.25rem', color:PC[curMaha.planet] || 'var(--color-text-accent)',
                  }}>
                    {PLANET_LABELS[curMaha.planet]?.symbol ?? '🕐'}
                  </div>
                  <div>
                    <div style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text-primary)' }}>
                      <span style={{ color:'var(--color-text-accent)' }}>{formatPlanet(curMaha.planet)}</span> {language === 'mr' ? 'महादशा' : 'Mahadasha'}
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                      {formatDate(curMaha.startDate, language)} — {formatDate(curMaha.endDate, language)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                {(() => {
                  const now = Date.now();
                  const start = new Date(curMaha.startDate).getTime();
                  const end = new Date(curMaha.endDate).getTime();
                  const pct = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
                  return (
                    <div className="strength-bar" style={{ height:6, marginBottom:'0.85rem' }}>
                      <div
                        className="strength-fill"
                        style={{
                          width:`${pct}%`,
                          background:'linear-gradient(90deg, var(--brand-500), var(--brand-300))',
                        }}
                      />
                    </div>
                  );
                })()}

                <div className="grid-2" style={{ gap:'0.6rem', fontSize:'0.8rem' }}>
                  {curAntar && (
                    <div style={{ background:'var(--surface-overlay)', border:'1px solid var(--border-subtle)', padding:'0.55rem 0.75rem', borderRadius:'var(--radius-sm)' }}>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{language === 'mr' ? 'अंतर्दशा' : 'Antardasha'}</div>
                      <div style={{ fontWeight:700, color:'var(--text-primary)', marginTop:'0.1rem' }}>
                        <span style={{ color:'var(--color-text-accent)' }}>{formatPlanet(curAntar.planet)}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ background:'var(--surface-overlay)', border:'1px solid var(--border-subtle)', padding:'0.55rem 0.75rem', borderRadius:'var(--radius-sm)' }}>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{language === 'mr' ? 'जन्मावेळची शिल्लक' : 'Balance at birth'}</div>
                    <div style={{ fontWeight:700, color:'var(--text-primary)', marginTop:'0.1rem' }}>
                      {dasha.birthBalance.balanceYears}{language === 'mr' ? ' वर्षे ' : 'y '}{dasha.birthBalance.balanceMonths}{language === 'mr' ? ' महिने' : 'm'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">
                {language === 'mr' ? 'सध्याची दशा निश्चित करता आली नाही.' : 'Unable to determine current dasha period.'}
              </p>
            )}
          </div>

          {/* Top Raj Yogas Card */}
          {topYogas.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">✨ {language === 'mr' ? 'प्रमुख राजयोग' : 'Notable Raj Yogas'}</span>
                <span className="badge badge-gold">
                  {rajaYogas.length} {language === 'mr' ? 'योग' : 'detected'}
                </span>
              </div>
              <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginBottom:'0.85rem', lineHeight:1.6 }}>
                {language === 'mr'
                  ? 'हे कुंडलीतील विशेष शुभ ग्रह योग आहेत — जे जीवनात प्रगती आणि यश दर्शवतात.'
                  : 'Special planetary combinations indicating areas where your chart has notable potential.'}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.55rem' }}>
                {topYogas.map(y => (
                  <div
                    key={y.id}
                    className="card-interactive"
                    style={{
                      padding:'0.45rem 0.85rem', borderRadius:'var(--radius-sm)',
                      background:'var(--surface-overlay)', border:'1px solid var(--border-subtle)',
                      fontSize:'0.8rem', color:'var(--text-primary)', fontWeight:600,
                    }}
                    onClick={() => onNavigate && onNavigate('yogas')}
                  >
                    <span style={{ color:'var(--brand-400)', marginRight:'0.3rem' }}>✨</span>
                    <span>{y.name}</span>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginLeft:'0.45rem', fontWeight:400 }}>
                      ({y.strength})
                    </span>
                  </div>
                ))}
              </div>
              {onNavigate && (
                <button
                  className="btn btn-ghost mt-3"
                  style={{ width:'100%', fontSize:'0.78rem', justifyContent:'center' }}
                  onClick={() => onNavigate('yogas')}
                >
                  {language === 'mr' ? 'सर्व राजयोग व नियम पहा →' : 'View all Raj Yogas & rules →'}
                </button>
              )}
            </div>
          )}

          {/* Doshas Status Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⚠ {language === 'mr' ? 'दोष स्थिती' : 'Dosha Status'}</span>
              {onNavigate && (
                <button className="btn btn-ghost" style={{ fontSize:'0.74rem', padding:'0.2rem 0.55rem' }} onClick={() => onNavigate('doshas')}>
                  {language === 'mr' ? 'तपशील →' : 'Details →'}
                </button>
              )}
            </div>
            {[
              { label: language === 'mr' ? 'मांगलिक दोष' : 'Manglik Dosha', dosha: manglik },
              { label: language === 'mr' ? 'कालसर्प दोष' : 'Kaal Sarp Dosha', dosha: kaalSarp },
              { label: language === 'mr' ? 'साडेसाती' : 'Sade Sati', dosha: sadeSati },
            ].map(({ label, dosha }) => {
              if (!dosha) return null;
              const isNot = !dosha.isPresent;
              const isCanc = dosha.isCancelled;
              const statusLabel = isNot
                ? (language === 'mr' ? 'नाही' : 'Not Present')
                : isCanc
                ? (language === 'mr' ? 'दोष निवारण' : 'Cancelled')
                : (language === 'mr' ? (dosha.severity === 'High' ? 'तीव्र' : dosha.severity === 'Medium' ? 'मध्यम' : 'सौम्य') : dosha.severity);
              const cls = (isNot || isCanc) ? 'badge-teal' : dosha.severity === 'High' ? 'badge-crimson' : 'badge-gold';
              return (
                <div key={label} className="info-row" style={{ padding:'0.45rem 0' }}>
                  <span className="label" style={{ fontWeight:500 }}>{label}</span>
                  <span className={`badge ${cls}`}>{statusLabel}</span>
                </div>
              );
            })}
          </div>

          {/* Key Planet Snapshot Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📊 {language === 'mr' ? 'मुख्य ग्रह स्थिती' : 'Key Planetary Placements'}</span>
              {onNavigate && (
                <button className="btn btn-ghost" style={{ fontSize:'0.74rem', padding:'0.2rem 0.55rem' }} onClick={() => onNavigate('chart')}>
                  {language === 'mr' ? 'कुंडली पहा →' : 'View Kundali →'}
                </button>
              )}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'0.6rem' }}>
              {(['Sun','Moon','Ascendant'] as Planet[]).map(p => {
                const pos = p === 'Ascendant' ? chart.ascendant : chart.planets[p];
                const name = p === 'Ascendant'
                  ? (language === 'mr' ? 'लग्न' : 'Lagna')
                  : formatPlanet(p);
                const sym  = p === 'Ascendant' ? '⬆' : PLANET_LABELS[p]?.symbol ?? '?';
                const col  = p === 'Ascendant' ? 'var(--color-text-accent)' : PC[p];
                return (
                  <div key={p} style={{ background:'var(--surface-overlay)', padding:'0.65rem 0.8rem', borderRadius:'var(--radius-sm)' }}>
                    <div style={{ fontSize:'0.82rem', fontWeight:700, color:col, marginBottom:'0.2rem' }}>
                      {sym} {name}
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-primary)', fontWeight:600 }}>
                      {formatSign(pos.sign)}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                      H{pos.house} · {pos.dmsString}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
