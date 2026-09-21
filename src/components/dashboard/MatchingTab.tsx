import React, { useState, useMemo } from 'react';
import type { KundaliChart, BirthData, Planet } from '../../core/models';
import type { Profile } from '../../utils/profiles';
import { calculateKundali } from '../../core/calculator';
import { computeFullMatching, type MatchingResult, type CompatibilityStatus } from '../../core/matchingEngine';
import BirthForm from '../BirthForm';
import { useLanguage } from '../../context/LanguageContext';

interface MatchingTabProps {
  chart: KundaliChart;
  profiles: Profile[];
  activeProfile: Profile | null;
  onCreateProfile?: (name: string, birth: BirthData) => void;
  onSelectProfile?: (p: Profile) => void;
}

export default function MatchingTab({
  chart,
  profiles,
  activeProfile,
  onCreateProfile
}: MatchingTabProps) {
  const { language, t, formatPlanet } = useLanguage();

  // Partner selection state
  const [partnerMode, setPartnerMode] = useState<'existing' | 'new'>('existing');
  
  // Available other profiles (excluding active)
  const otherProfiles = useMemo(() => {
    return profiles.filter(p => p.id !== activeProfile?.id);
  }, [profiles, activeProfile]);

  // Selected existing partner profile ID
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(() => {
    return otherProfiles.length > 0 ? otherProfiles[0].id : (profiles.length > 0 ? profiles[0].id : null);
  });

  // Ephemeral new partner data (for "Use Once")
  const [ephemeralPartnerBirth, setEphemeralPartnerBirth] = useState<BirthData | null>(null);

  // Save option toggle inside new partner mode
  const [saveAsProfileOnSubmit, setSaveAsProfileOnSubmit] = useState(false);

  // Derived single-source Profile Display Names
  const displayNameA = activeProfile?.name || chart.birthData.name || 'Primary Profile';
  const displayNameB = useMemo(() => {
    if (partnerMode === 'existing') {
      const found = profiles.find(p => p.id === selectedPartnerId);
      return found?.name || 'Partner Profile';
    }
    return ephemeralPartnerBirth?.name || 'Partner Profile';
  }, [partnerMode, selectedPartnerId, ephemeralPartnerBirth, profiles]);

  // Check if user accidentally selected the same profile on both sides
  const isSameProfile = partnerMode === 'existing' && activeProfile && selectedPartnerId === activeProfile.id;

  // Determine partner chart
  const partnerChart = useMemo<KundaliChart | null>(() => {
    if (partnerMode === 'existing') {
      const found = profiles.find(p => p.id === selectedPartnerId);
      if (found) {
        try {
          return calculateKundali(found.birth);
        } catch {
          return null;
        }
      }
      return null;
    } else {
      if (ephemeralPartnerBirth) {
        try {
          return calculateKundali(ephemeralPartnerBirth);
        } catch {
          return null;
        }
      }
      return null;
    }
  }, [partnerMode, selectedPartnerId, ephemeralPartnerBirth, profiles]);

  // Calculate full matching result with active display names
  const matchResult = useMemo<MatchingResult | null>(() => {
    if (!chart || !partnerChart) return null;
    try {
      // Ensure birthData names match display names so interpretations have exact names
      const customChartA = {
        ...chart,
        birthData: { ...chart.birthData, name: displayNameA }
      };
      const customChartB = {
        ...partnerChart,
        birthData: { ...partnerChart.birthData, name: displayNameB }
      };
      return computeFullMatching(customChartA, customChartB);
    } catch (e) {
      console.error('Error computing matching:', e);
      return null;
    }
  }, [chart, partnerChart, displayNameA, displayNameB]);

  // UI state for expandables
  const [showDetailed, setShowDetailed] = useState(false);
  const [activeDetailedLevel, setActiveDetailedLevel] = useState<number>(1);
  const [expandedWhyIds, setExpandedWhyIds] = useState<Record<string, boolean>>({});
  const [planetPairFilter, setPlanetPairFilter] = useState<'all' | 'cross' | 'same'>('all');

  function toggleWhy(id: string) {
    setExpandedWhyIds(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const handleNewPartnerCalculate = (birth: BirthData) => {
    if (saveAsProfileOnSubmit && onCreateProfile) {
      onCreateProfile(birth.name || 'Partner Profile', birth);
    }
    setEphemeralPartnerBirth(birth);
  };

  function getStatusBadge(status: CompatibilityStatus) {
    switch (status) {
      case 'Supportive':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.14)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            ✓ {t('matching.supportive')}
          </span>
        );
      case 'Mixed':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 600,
            background: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            ⚖ {t('matching.mixed')}
          </span>
        );
      case 'Needs Attention':
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 600,
            background: 'rgba(239, 68, 68, 0.14)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            ⚠ {t('matching.needsAttention')}
          </span>
        );
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1120, margin: '0 auto' }}>
      
      {/* ─── 1. TOP MATCHED PROFILES HEADER BANNER ──────────────────────── */}
      {partnerChart && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.10) 0%, rgba(236, 72, 153, 0.08) 100%)',
          border: '1.5px solid var(--border-gold)',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap'
        }}>
          {/* Profile A Compact Header Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-raised)',
            border: '1.5px solid var(--border-gold)',
            maxWidth: '320px',
            minWidth: '220px',
            flex: 1
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-glow)',
              border: '1.5px solid var(--border-gold)', display: 'grid', placeItems: 'center',
              fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-400)', flexShrink: 0
            }}>
              {displayNameA.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }} title={displayNameA}>
                {displayNameA}
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                {chart.lagnaSign} · {chart.moonSign} Moon
              </div>
            </div>
          </div>

          {/* Heart Emblem */}
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(212, 175, 55, 0.18) 100%)',
            border: '1.5px solid rgba(236, 72, 153, 0.5)',
            display: 'grid', placeItems: 'center', fontSize: '1.15rem',
            boxShadow: '0 0 14px rgba(236, 72, 153, 0.35)',
            flexShrink: 0
          }}>
            ❤️
          </div>

          {/* Profile B Compact Header Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-raised)',
            border: '1.5px solid #ec4899',
            maxWidth: '320px',
            minWidth: '220px',
            flex: 1
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)',
              border: '1.5px solid #ec4899', display: 'grid', placeItems: 'center',
              fontWeight: 700, fontSize: '0.95rem', color: '#ec4899', flexShrink: 0
            }}>
              {displayNameB.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }} title={displayNameB}>
                {displayNameB}
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                {partnerChart.lagnaSign} · {partnerChart.moonSign} Moon
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Same Profile Graceful Notice ───────────────────────────────── */}
      {isSameProfile && (
        <div style={{
          padding: '0.75rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          color: '#f59e0b',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span>
            {language === 'mr'
              ? `दोन्ही बाजूंना समान प्रोफाईल (${displayNameA}) निवडले आहे. योग्य वैवाहिक तुलना पाहण्यासाठी कृपया वेगळा जोडीदार निवडा.`
              : `You are comparing "${displayNameA}" with the same profile. For relationship matching, select a different partner profile or enter new partner details.`}
          </span>
        </div>
      )}

      {/* ─── Profile Selector Card ──────────────────────────────────────── */}
      <div style={{
        background: 'var(--surface-raised)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>💞</span>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('matching.title')}
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {t('matching.subtitle')}
            </p>
          </div>

          {/* Partner mode selector pills */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--surface-overlay)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setPartnerMode('existing')}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: partnerMode === 'existing' ? 'var(--surface-raised)' : 'transparent',
                color: partnerMode === 'existing' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: partnerMode === 'existing' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              👤 {t('matching.optExisting')}
            </button>
            <button
              onClick={() => setPartnerMode('new')}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: partnerMode === 'new' ? 'var(--surface-raised)' : 'transparent',
                color: partnerMode === 'new' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: partnerMode === 'new' ? 'var(--shadow-xs)' : 'none'
              }}
            >
              ✨ {t('matching.optNew')}
            </button>
          </div>
        </div>

        {/* Comparison Header Cards (Primary Profile vs Partner Profile) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          alignItems: 'stretch'
        }}>
          {/* Primary Profile Card */}
          <div style={{
            background: 'var(--surface-overlay)',
            padding: '1rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-gold)',
            position: 'relative'
          }}>
            <span style={{
              position: 'absolute', top: 10, right: 12, fontSize: '0.68rem', fontWeight: 700,
              textTransform: 'uppercase', color: 'var(--brand-400)', letterSpacing: '0.04em',
              maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }} title={displayNameA}>
              {displayNameA}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', background: 'var(--brand-glow)',
                border: '1.5px solid var(--border-gold)', display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: '1rem', color: 'var(--brand-400)', flexShrink: 0
              }}>
                {displayNameA.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{
                  fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }} title={displayNameA}>
                  {displayNameA}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {chart.birthData.dob} · {chart.birthData.cityName}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
              <span className="badge badge-gold">
                Lagna: <strong>{chart.lagnaSign}</strong>
              </span>
              <span className="badge badge-gold">
                Moon: <strong>{chart.moonSign}</strong>
              </span>
              <span className="badge badge-gold">
                {chart.janmaNakshatra.name} (P{chart.janmaNakshatraPada})
              </span>
            </div>
          </div>

          {/* Partner Profile Card / Selection */}
          <div style={{
            background: 'var(--surface-overlay)',
            padding: '1rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            border: partnerChart ? '1.5px solid #ec4899' : '1.5px dashed var(--border-subtle)',
            position: 'relative'
          }}>
            <span style={{
              position: 'absolute', top: 10, right: 12, fontSize: '0.68rem', fontWeight: 700,
              textTransform: 'uppercase', color: '#ec4899', letterSpacing: '0.04em',
              maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }} title={displayNameB}>
              {displayNameB}
            </span>

            {partnerMode === 'existing' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  {t('matching.selectPartner')}
                </label>
                {profiles.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '6px 0' }}>
                    No other profiles saved. Please choose <strong>{t('matching.optNew')}</strong> above to enter partner details.
                  </div>
                ) : (
                  <select
                    className="form-input"
                    value={selectedPartnerId || ''}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    style={{ fontSize: '0.88rem', padding: '0.45rem 0.75rem', marginBottom: '8px' }}
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.birth.dob} · {p.birth.cityName})
                      </option>
                    ))}
                  </select>
                )}

                {partnerChart && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', marginTop: '6px' }}>
                    <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      Lagna: <strong>{partnerChart.lagnaSign}</strong>
                    </span>
                    <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      Moon: <strong>{partnerChart.moonSign}</strong>
                    </span>
                    <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      {partnerChart.janmaNakshatra.name} (P{partnerChart.janmaNakshatraPada})
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{
                  fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }} title={displayNameB}>
                  {ephemeralPartnerBirth ? displayNameB : t('matching.optNew')}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {ephemeralPartnerBirth
                    ? `${ephemeralPartnerBirth.dob} · ${ephemeralPartnerBirth.cityName}`
                    : 'Fill details below to calculate matching.'}
                </div>
                {partnerChart && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.78rem', marginTop: '8px' }}>
                    <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      Lagna: <strong>{partnerChart.lagnaSign}</strong>
                    </span>
                    <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      Moon: <strong>{partnerChart.moonSign}</strong>
                    </span>
                    <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                      {partnerChart.janmaNakshatra.name} (P{partnerChart.janmaNakshatraPada})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── New Partner Birth Details Form (Only when mode === 'new' and no partner calculated) ─── */}
      {partnerMode === 'new' && (!partnerChart || !ephemeralPartnerBirth) && (
        <div style={{
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
              {language === 'mr' ? `${displayNameB} चे जन्म तपशील भरा` : `Enter Partner (${displayNameB}) Birth Details`}
            </h3>
            
            {/* Save as profile checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={saveAsProfileOnSubmit}
                onChange={e => setSaveAsProfileOnSubmit(e.target.checked)}
                style={{ accentColor: 'var(--brand-400)' }}
              />
              💾 {t('matching.saveProfile')}
            </label>
          </div>

          <BirthForm
            hideTitle={true}
            submitLabel={saveAsProfileOnSubmit ? t('matching.saveProfile') : t('matching.useOnce')}
            onCalculate={handleNewPartnerCalculate}
            isLoading={false}
          />
        </div>
      )}

      {/* When no partner chart is available, show polite placeholder */}
      {!partnerChart && (
        <div style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'var(--surface-raised)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-subtle)'
        }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>🔮</div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>{t('matching.noPartnerSelected')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 460, margin: '0 auto' }}>
            Select an existing profile from the dropdown or click &quot;New Partner Details&quot; to calculate comprehensive 8-level compatibility.
          </p>
        </div>
      )}

      {/* ─── WHEN MATCH RESULT IS READY ──────────────────────────────────── */}
      {matchResult && (
        <>
          {/* 1. TOP SUMMARY: 6 Core Dimensions Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('matching.summary')}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Comparing {displayNameA} & {displayNameB}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem'
            }}>
              {matchResult.summaryDimensions.map(dim => {
                const whyOpen = !!expandedWhyIds[`dim-${dim.dimension}`];
                return (
                  <div
                    key={dim.dimension}
                    style={{
                      background: 'var(--surface-raised)',
                      padding: '1.1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {dim.title}
                      </span>
                      {getStatusBadge(dim.status)}
                    </div>

                    <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {dim.summary}
                    </p>

                    <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                      <button
                        onClick={() => toggleWhy(`dim-${dim.dimension}`)}
                        style={{
                          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                          fontSize: '0.74rem', color: 'var(--brand-400)', fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: '3px'
                        }}
                      >
                        {whyOpen ? '▲ Hide evidence' : `▼ ${t('matching.whySeeing')}`}
                      </button>

                      {whyOpen && (
                        <div style={{
                          marginTop: '6px',
                          padding: '6px 10px',
                          background: 'var(--surface-overlay)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          borderLeft: '2px solid var(--border-gold)'
                        }}>
                          <strong>Chart Factors:</strong> {dim.evidence}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. TOP PRIORITIZED INSIGHTS (5–8 High-Impact Findings) */}
          <div style={{
            background: 'var(--surface-raised)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t('matching.topInsights')}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Most influential relationship dynamics between {displayNameA} and {displayNameB}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {matchResult.topInsights.map((insight, idx) => {
                const whyOpen = !!expandedWhyIds[`insight-${insight.id}`];
                return (
                  <div
                    key={insight.id}
                    style={{
                      background: 'var(--surface-overlay)',
                      padding: '0.9rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%', background: 'var(--brand-glow)',
                          display: 'grid', placeItems: 'center', fontSize: '0.72rem', fontWeight: 700,
                          color: 'var(--brand-400)', border: '1px solid var(--border-gold)'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {insight.category}
                        </span>
                      </div>
                      {getStatusBadge(insight.status)}
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginTop: '2px', wordBreak: 'break-word' }}>
                      {insight.title}
                    </div>

                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {insight.description}
                    </p>

                    <div>
                      <button
                        onClick={() => toggleWhy(`insight-${insight.id}`)}
                        style={{
                          background: 'none', border: 'none', padding: '2px 0 0', cursor: 'pointer',
                          fontSize: '0.73rem', color: 'var(--brand-400)', fontWeight: 600
                        }}
                      >
                        {whyOpen ? '▲ Hide technical facts' : `▼ ${t('matching.technicalDetails')}`}
                      </button>

                      {whyOpen && (
                        <div style={{
                          marginTop: '6px',
                          padding: '6px 10px',
                          background: 'var(--surface-raised)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          borderLeft: '2px solid var(--border-gold)'
                        }}>
                          <div>{insight.why}</div>
                          {insight.technicalDetails.rule && (
                            <div style={{ marginTop: '2px', fontStyle: 'italic' }}>
                              Rule: {insight.technicalDetails.rule}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── 3. EXPANDABLE: DETAILED 8-LEVEL ASTROLOGICAL ANALYSIS ─────── */}
          <div style={{
            background: 'var(--surface-raised)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Deep Astrological Compatibility (8 Levels)
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Detailed comparison between {displayNameA} and {displayNameB} across all classical layers
                </p>
              </div>

              <button
                className={showDetailed ? 'btn btn-secondary' : 'btn btn-primary'}
                onClick={() => setShowDetailed(!showDetailed)}
                style={{ fontSize: '0.84rem', padding: '0.5rem 1rem' }}
              >
                {showDetailed ? t('matching.hideDetailed') : t('matching.viewDetailed')}
              </button>
            </div>

            {showDetailed && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                
                {/* Level Navigation Tabs */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  marginBottom: '1.25rem'
                }}>
                  {[
                    { lvl: 1, label: '1. Guna Milan', icon: '🌕' },
                    { lvl: 2, label: '2. Planet Pairs', icon: '🪐' },
                    { lvl: 3, label: '3. House Overlays', icon: '🏠' },
                    { lvl: 4, label: '4. 7th / Marriage', icon: '💍' },
                    { lvl: 5, label: '5. Manglik / Mars', icon: '🔥' },
                    { lvl: 6, label: '6. D9 Navamsha', icon: '☸' },
                    { lvl: 7, label: '7. Dasha Overlap', icon: '⏳' },
                    { lvl: 8, label: '8. Drishti / Aspects', icon: '👁' }
                  ].map(tabItem => (
                    <button
                      key={tabItem.lvl}
                      onClick={() => setActiveDetailedLevel(tabItem.lvl)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: activeDetailedLevel === tabItem.lvl ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                        background: activeDetailedLevel === tabItem.lvl ? 'var(--brand-glow)' : 'var(--surface-overlay)',
                        color: activeDetailedLevel === tabItem.lvl ? 'var(--brand-400)' : 'var(--text-secondary)'
                      }}
                    >
                      <span>{tabItem.icon}</span>
                      <span>{tabItem.label}</span>
                    </button>
                  ))}
                </div>

                {/* LEVEL 1: ASHTAKOOTA 36 GUNA MILAN */}
                {activeDetailedLevel === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Score Callout */}
                    <div style={{
                      background: 'var(--surface-overlay)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      border: '1.5px solid var(--border-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                          Ashtakoota 36 Guna Milan ({displayNameA} + {displayNameB})
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                          {matchResult.gunaMilan.verdict}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: 520 }}>
                          {matchResult.gunaMilan.recommendation}
                        </div>
                      </div>

                      <div style={{
                        textAlign: 'center', padding: '10px 24px', borderRadius: 'var(--radius-md)',
                        background: 'var(--surface-raised)', border: '1px solid var(--border-gold)'
                      }}>
                        <div style={{
                          fontSize: '2rem', fontWeight: 900,
                          color: matchResult.gunaMilan.totalScore >= 18 ? 'var(--brand-400)' : '#ef4444'
                        }}>
                          {matchResult.gunaMilan.totalScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 36</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {matchResult.gunaMilan.percentage}% Obtained
                        </div>
                      </div>
                    </div>

                    {/* Dosha Badges */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`badge ${matchResult.gunaMilan.nadiDosha ? (matchResult.gunaMilan.nadiDoshaCancelled ? 'badge-gold' : 'badge-crimson') : 'badge-gold'}`}>
                        Nadi: {matchResult.gunaMilan.nadiDosha ? (matchResult.gunaMilan.nadiDoshaCancelled ? 'Dosha Cancelled ✓' : 'Dosha Present ⚠') : 'Clear ✓'}
                      </span>
                      <span className={`badge ${matchResult.gunaMilan.bhakootDosha ? (matchResult.gunaMilan.bhakootDoshaCancelled ? 'badge-gold' : 'badge-crimson') : 'badge-gold'}`}>
                        Bhakoot: {matchResult.gunaMilan.bhakootDosha ? (matchResult.gunaMilan.bhakootDoshaCancelled ? 'Dosha Cancelled ✓' : 'Dosha Present ⚠') : 'Clear ✓'}
                      </span>
                    </div>

                    {/* 8 Kootas Table / Cards */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '0.75rem'
                    }}>
                      {matchResult.gunaMilan.gunas.map((g, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'var(--surface-overlay)',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                              {g.name}
                            </span>
                            <span style={{
                              fontSize: '0.8rem', fontWeight: 800,
                              color: g.obtainedPoints === g.maxPoints ? '#10b981' : g.obtainedPoints > 0 ? '#f59e0b' : '#ef4444'
                            }}>
                              {g.obtainedPoints} / {g.maxPoints} pts
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>
                            {g.sanskritName} · {displayNameA}: <em>{g.personAAttribute}</em> | {displayNameB}: <em>{g.personBAttribute}</em>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                            {g.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LEVEL 2: PLANET-TO-PLANET COMPATIBILITY */}
                {activeDetailedLevel === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setPlanetPairFilter('all')}
                        className={`btn ${planetPairFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                      >
                        {t('matching.filterAll')} ({matchResult.planetaryCompatibility.length})
                      </button>
                      <button
                        onClick={() => setPlanetPairFilter('cross')}
                        className={`btn ${planetPairFilter === 'cross' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                      >
                        {t('matching.filterCross')}
                      </button>
                      <button
                        onClick={() => setPlanetPairFilter('same')}
                        className={`btn ${planetPairFilter === 'same' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                      >
                        {t('matching.filterSame')}
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem' }}>
                      {matchResult.planetaryCompatibility
                        .filter(p => {
                          if (planetPairFilter === 'cross') return p.relationshipType === 'CrossChart';
                          if (planetPairFilter === 'same') return p.relationshipType === 'SamePlanet';
                          return true;
                        })
                        .map(p => (
                          <div
                            key={p.id}
                            style={{
                              background: 'var(--surface-overlay)',
                              padding: '1rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                                {p.headline}
                              </span>
                              {getStatusBadge(p.status)}
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--brand-400)', fontWeight: 600 }}>
                              {p.signDistanceLabel}
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              <strong>{t('matching.whatItMeans')}:</strong> {p.whatItMeans}
                            </div>

                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              <strong>Chart Placements:</strong> {p.why}
                            </div>

                            <div style={{
                              background: 'var(--surface-raised)',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '0.74rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              marginTop: '2px'
                            }}>
                              <div style={{ color: '#10b981' }}>
                                <strong>+ {t('matching.positiveSide')}:</strong> {p.positiveSide}
                              </div>
                              <div style={{ color: 'var(--text-muted)' }}>
                                <strong>• {t('matching.possibleChallenge')}:</strong> {p.possibleChallenge}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* LEVEL 3: CROSS-CHART HOUSE OVERLAYS */}
                {activeDetailedLevel === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Planetary overlays between {displayNameA} and {displayNameB}:
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '0.85rem' }}>
                      {matchResult.houseOverlays.map(o => (
                        <div
                          key={o.id}
                          style={{
                            background: 'var(--surface-overlay)',
                            padding: '0.9rem 1.1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                              {language === 'mr'
                                ? `${o.fromPerson} यांच्या ${formatPlanet(o.planet as Planet)}चा → ${o.toPerson} यांच्या ${o.houseInTarget}व्या भावावर प्रभाव`
                                : `${o.fromPerson}'s ${o.planet} → ${o.toPerson}'s House ${o.houseInTarget}`}
                            </span>
                            {getStatusBadge(o.status)}
                          </div>

                          <div style={{ fontSize: '0.76rem', color: 'var(--brand-400)', fontWeight: 600 }}>
                            Theme: {o.theme} ({o.targetSign})
                          </div>

                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {o.whatItMeans}
                          </p>

                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            <strong>Positive:</strong> {o.positiveSide}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LEVEL 4: 7TH HOUSE & MARRIAGE ANALYSIS */}
                {activeDetailedLevel === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      background: 'var(--surface-overlay)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                          {matchResult.marriageAnalysis.headline}
                        </span>
                        {getStatusBadge(matchResult.marriageAnalysis.status)}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {matchResult.marriageAnalysis.synthesis}
                      </p>
                    </div>

                    {/* Comparison Cards: 7th House */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-400)', marginBottom: '8px', wordBreak: 'break-word' }}>
                          {language === 'mr' ? `${displayNameA} यांचा ७वा भाव` : `${displayNameA}'s 7th House`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>Sign: <strong>{matchResult.marriageAnalysis.personA.sign7}</strong></div>
                          <div>Lord: <strong>{matchResult.marriageAnalysis.personA.lord7}</strong> (House {matchResult.marriageAnalysis.personA.lord7House}, {matchResult.marriageAnalysis.personA.lord7Dignity})</div>
                          <div>Occupants: {matchResult.marriageAnalysis.personA.occupants7.length ? matchResult.marriageAnalysis.personA.occupants7.join(', ') : 'None'}</div>
                          <div>Aspects: {matchResult.marriageAnalysis.personA.aspects7.length ? matchResult.marriageAnalysis.personA.aspects7.join(', ') : 'None'}</div>
                          <div>Venus: {matchResult.marriageAnalysis.personA.venusSign} (H{matchResult.marriageAnalysis.personA.venusHouse}, {matchResult.marriageAnalysis.personA.venusDignity})</div>
                        </div>
                      </div>

                      <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ec4899', marginBottom: '8px', wordBreak: 'break-word' }}>
                          {language === 'mr' ? `${displayNameB} यांचा ७वा भाव` : `${displayNameB}'s 7th House`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>Sign: <strong>{matchResult.marriageAnalysis.personB.sign7}</strong></div>
                          <div>Lord: <strong>{matchResult.marriageAnalysis.personB.lord7}</strong> (House {matchResult.marriageAnalysis.personB.lord7House}, {matchResult.marriageAnalysis.personB.lord7Dignity})</div>
                          <div>Occupants: {matchResult.marriageAnalysis.personB.occupants7.length ? matchResult.marriageAnalysis.personB.occupants7.join(', ') : 'None'}</div>
                          <div>Aspects: {matchResult.marriageAnalysis.personB.aspects7.length ? matchResult.marriageAnalysis.personB.aspects7.join(', ') : 'None'}</div>
                          <div>Venus: {matchResult.marriageAnalysis.personB.venusSign} (H{matchResult.marriageAnalysis.personB.venusHouse}, {matchResult.marriageAnalysis.personB.venusDignity})</div>
                        </div>
                      </div>
                    </div>

                    {/* Supportive Similarities & Complementary Patterns */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'var(--surface-raised)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#10b981', marginBottom: '6px' }}>
                          ✓ Supportive Similarities & Strengths
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {matchResult.marriageAnalysis.supportiveSimilarities.map((s, i) => <li key={i}>{s}</li>)}
                          {matchResult.marriageAnalysis.complementaryPatterns.map((c, i) => <li key={`c-${i}`}>{c}</li>)}
                        </ul>
                      </div>

                      {matchResult.marriageAnalysis.potentialFriction.length > 0 && (
                        <div style={{ background: 'var(--surface-raised)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#ef4444', marginBottom: '6px' }}>
                            ⚠ Points for Conscious Communication
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {matchResult.marriageAnalysis.potentialFriction.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LEVEL 5: MANGLIK / MARS FACTORS */}
                {activeDetailedLevel === 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      background: 'var(--surface-overlay)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                          {matchResult.manglikAnalysis.headline}
                        </span>
                        {getStatusBadge(matchResult.manglikAnalysis.matchingImpact)}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {matchResult.manglikAnalysis.explanation}
                      </p>
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--brand-400)', fontStyle: 'italic' }}>
                        <strong>Advice:</strong> {matchResult.manglikAnalysis.mitigationAdvice}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '6px', wordBreak: 'break-word' }}>
                          {language === 'mr' ? `${displayNameA} यांची मंगळ स्थिती` : `${displayNameA}'s Mars Placement`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>Status: <strong>{matchResult.manglikAnalysis.personA.isManglik ? `${matchResult.manglikAnalysis.personA.level} Manglik` : 'Non-Manglik'}</strong></div>
                          <div>Mars Sign: {matchResult.manglikAnalysis.personA.marsSign} (House {matchResult.manglikAnalysis.personA.marsHouse})</div>
                          {matchResult.manglikAnalysis.personA.isCancelled && (
                            <div style={{ color: '#10b981' }}>✓ Neutralized by classical cancellations</div>
                          )}
                        </div>
                      </div>

                      <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '6px', wordBreak: 'break-word' }}>
                          {language === 'mr' ? `${displayNameB} यांची मंगळ स्थिती` : `${displayNameB}'s Mars Placement`}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>Status: <strong>{matchResult.manglikAnalysis.personB.isManglik ? `${matchResult.manglikAnalysis.personB.level} Manglik` : 'Non-Manglik'}</strong></div>
                          <div>Mars Sign: {matchResult.manglikAnalysis.personB.marsSign} (House {matchResult.manglikAnalysis.personB.marsHouse})</div>
                          {matchResult.manglikAnalysis.personB.isCancelled && (
                            <div style={{ color: '#10b981' }}>✓ Neutralized by classical cancellations</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LEVEL 6: D9 NAVAMSHA */}
                {activeDetailedLevel === 6 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      background: 'var(--surface-overlay)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                          {matchResult.navamsaAnalysis.headline}
                        </span>
                        {getStatusBadge(matchResult.navamsaAnalysis.status)}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {matchResult.navamsaAnalysis.whatItMeans}
                      </p>
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong>Deeper Soul Evolution:</strong> {matchResult.navamsaAnalysis.deeperSoulDynamics}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-400)', marginBottom: '6px', wordBreak: 'break-word' }}>
                          {displayNameA} (D9 Navamsha)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>D9 Lagna: <strong>{matchResult.navamsaAnalysis.personA.d9Lagna}</strong></div>
                          <div>D9 7th House: {matchResult.navamsaAnalysis.personA.d9Sign7} (Lord: {matchResult.navamsaAnalysis.personA.d9Lord7})</div>
                          <div>D9 Venus Sign: {matchResult.navamsaAnalysis.personA.d9VenusSign}</div>
                          <div>Vargottama Planets: {matchResult.navamsaAnalysis.personA.vargottamaPlanets.length ? matchResult.navamsaAnalysis.personA.vargottamaPlanets.join(', ') : 'None'}</div>
                        </div>
                      </div>

                      <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ec4899', marginBottom: '6px', wordBreak: 'break-word' }}>
                          {displayNameB} (D9 Navamsha)
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>D9 Lagna: <strong>{matchResult.navamsaAnalysis.personB.d9Lagna}</strong></div>
                          <div>D9 7th House: {matchResult.navamsaAnalysis.personB.d9Sign7} (Lord: {matchResult.navamsaAnalysis.personB.d9Lord7})</div>
                          <div>D9 Venus Sign: {matchResult.navamsaAnalysis.personB.d9VenusSign}</div>
                          <div>Vargottama Planets: {matchResult.navamsaAnalysis.personB.vargottamaPlanets.length ? matchResult.navamsaAnalysis.personB.vargottamaPlanets.join(', ') : 'None'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LEVEL 7: DASHA OVERLAP */}
                {activeDetailedLevel === 7 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                      background: 'var(--surface-overlay)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                          {matchResult.dashaAnalysis.headline}
                        </span>
                        {getStatusBadge(matchResult.dashaAnalysis.status)}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {matchResult.dashaAnalysis.interactionNarrative}
                      </p>
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <strong>Technical Cycles:</strong> {matchResult.dashaAnalysis.why}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--brand-400)', marginBottom: '6px', wordBreak: 'break-word' }}>
                          {language === 'mr' ? `${displayNameA} यांची चालू दशा` : `${displayNameA}'s Current Dasha`}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div>Mahadasha: <strong>{matchResult.dashaAnalysis.personA.mahadasha}</strong></div>
                          <div>Antardasha: <strong>{matchResult.dashaAnalysis.personA.antardasha}</strong></div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Timeline: {matchResult.dashaAnalysis.personA.startDate} – {matchResult.dashaAnalysis.personA.endDate}
                          </div>
                        </div>
                      </div>

                      <div style={{ background: 'var(--surface-overlay)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ec4899', marginBottom: '6px', wordBreak: 'break-word' }}>
                          {language === 'mr' ? `${displayNameB} यांची चालू दशा` : `${displayNameB}'s Current Dasha`}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div>Mahadasha: <strong>{matchResult.dashaAnalysis.personB.mahadasha}</strong></div>
                          <div>Antardasha: <strong>{matchResult.dashaAnalysis.personB.antardasha}</strong></div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Timeline: {matchResult.dashaAnalysis.personB.startDate} – {matchResult.dashaAnalysis.personB.endDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LEVEL 8: CROSS DRISHTI / ASPECTS */}
                {activeDetailedLevel === 8 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Cross-chart Drishti (astrological aspects) casting mutual protection, energy, or structure:
                    </div>

                    {matchResult.drishtiAnalysis.length === 0 ? (
                      <div style={{ padding: '1rem', background: 'var(--surface-overlay)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        No direct cross-chart planetary aspects (such as Jupiter or Saturn special aspects) fall on key personal points between these two charts.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '0.85rem' }}>
                        {matchResult.drishtiAnalysis.map(d => (
                          <div
                            key={d.id}
                            style={{
                              background: 'var(--surface-overlay)',
                              padding: '0.95rem 1.1rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                                {d.headline}
                              </span>
                              {getStatusBadge(d.status)}
                            </div>

                            <p style={{ margin: 0, fontSize: '0.81rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              {d.whatItMeans}
                            </p>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <strong>Chart Aspect:</strong> {d.why}
                            </div>

                            <div style={{
                              background: 'var(--surface-raised)',
                              padding: '5px 8px',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '0.73rem',
                              color: '#10b981',
                              marginTop: '2px'
                            }}>
                              + {d.positiveSide}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
