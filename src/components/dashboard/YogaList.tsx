import React, { useState } from 'react';
import type { KundaliChart, YogaResult } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';
import { useLanguage } from '../../context/LanguageContext';

interface Props { chart: KundaliChart; }

const CATEGORY_COLORS: Record<string, string> = {
  Mahapurusha: 'var(--brand-400)',
  RajaYoga: 'var(--brand-300)',
  DhanaYoga: 'var(--teal-300)',
  AuspiciousYoga: 'var(--teal-400)',
  InauspiciousYoga: 'var(--danger-fg)',
  VipareetsRajaYoga: 'var(--violet-300)',
};

const STRENGTH_COLORS: Record<string, string> = {
  Exceptional: 'var(--brand-300)',
  Strong: 'var(--success-fg)',
  Moderate: 'var(--text-secondary)',
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
  const { language, formatPlanet, formatSign } = useLanguage();
  const [filter, setFilter] = useState<string>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { yogas } = chart;
  const categories = ['All', ...Array.from(new Set(yogas.map(y => y.category)))];

  const filtered = filter === 'All' ? yogas : yogas.filter(y => y.category === filter);
  const auspicious  = yogas.filter(y => !['InauspiciousYoga'].includes(y.category));
  const challenging = yogas.filter(y => y.category === 'InauspiciousYoga');
  const strongYogas = yogas.filter(y => ['Exceptional', 'Strong'].includes(y.strength));
  const moderateYogas = yogas.filter(y => y.strength === 'Moderate');

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
                ? 'शुभ ग्रह स्थाने व परस्पर संबंधातून निर्माण झालेले विशेष प्रभाव आणि संधी.'
                : 'Special planetary alliances indicating personal potentials, career heights, and supportive karmic combinations.'}
            </p>
          </div>
          <span className="badge badge-gold" style={{ fontSize:'0.8rem', padding:'0.35rem 0.85rem' }}>
            {yogas.length} {language === 'mr' ? 'योग उपस्थित' : 'Total Detected'}
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'0.85rem' }}>
          <div style={{ background:'var(--surface-raised)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', borderLeft:'3.5px solid var(--brand-400)' }}>
            <div style={{ fontSize:'0.7rem', textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.06em', fontWeight:600 }}>
              {language === 'mr' ? 'एकूण उपस्थित योग' : 'Detected Yogas'}
            </div>
            <div style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--brand-400)', marginTop:'0.15rem' }}>
              {yogas.length}
            </div>
          </div>

          <div style={{ background:'var(--surface-raised)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', borderLeft:'3.5px solid var(--success-fg)' }}>
            <div style={{ fontSize:'0.7rem', textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.06em', fontWeight:600 }}>
              🌟 {language === 'mr' ? 'अतिउत्कृष्ट व बलवान' : 'Strong & Exceptional'}
            </div>
            <div style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--success-fg)', marginTop:'0.15rem' }}>
              {strongYogas.length}
            </div>
          </div>

          <div style={{ background:'var(--surface-raised)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', borderLeft:'3.5px solid var(--text-secondary)' }}>
            <div style={{ fontSize:'0.7rem', textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.06em', fontWeight:600 }}>
              ⚖ {language === 'mr' ? 'मध्यम प्रभाव' : 'Moderate Strength'}
            </div>
            <div style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--text-primary)', marginTop:'0.15rem' }}>
              {moderateYogas.length}
            </div>
          </div>

          <div style={{ background:'var(--surface-raised)', padding:'0.85rem 1rem', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', borderLeft:'3.5px solid var(--danger-fg)' }}>
            <div style={{ fontSize:'0.7rem', textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.06em', fontWeight:600 }}>
              ⚠ {language === 'mr' ? 'आव्हानात्मक योग' : 'Challenging Yogas'}
            </div>
            <div style={{ fontSize:'1.35rem', fontWeight:800, color:'var(--danger-fg)', marginTop:'0.15rem' }}>
              {challenging.length}
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
              isExpanded={expanded === yoga.id}
              onToggle={() => setExpanded(expanded === yoga.id ? null : yoga.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function YogaCard({ yoga, isExpanded, onToggle }: {
  yoga: YogaResult;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { language, formatPlanet, formatSign } = useLanguage();
  const isChallenge = yoga.category === 'InauspiciousYoga';
  const borderColor = CATEGORY_COLORS[yoga.category] || 'var(--border-subtle)';

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
            <div style={{ display:'flex', gap:'0.4rem', marginTop:'0.35rem', flexWrap:'wrap' }}>
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

      {/* Brief meaning */}
      <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'0.75rem', marginBottom:0, lineHeight:1.6 }}>
        {yoga.description}
      </p>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="fade-in" style={{ marginTop:'1rem', paddingTop:'0.85rem', borderTop:'1px solid var(--border-subtle)' }}>
          {/* Planets, Houses, Signs */}
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
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--success-fg)', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                <span>✅</span>
                <span>{language === 'mr' ? 'शुभ फळ व प्रभाव' : 'Positive Influence'}</span>
              </div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginLeft:'0.85rem', lineHeight:1.6 }}>
                {yoga.positiveEffects}
              </div>
            </div>
          )}

          {/* Cautionary Guidance */}
          {yoga.cautionaryEffects && (
            <div>
              <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--warn-fg)', marginBottom:'0.25rem', display:'flex', alignItems:'center', gap:'0.3rem' }}>
                <span>⚡</span>
                <span>{language === 'mr' ? 'सजगता व मर्यादा' : 'Cautionary Guidance'}</span>
              </div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginLeft:'0.85rem', lineHeight:1.6 }}>
                {yoga.cautionaryEffects}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
