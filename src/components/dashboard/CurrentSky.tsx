import React, { useState, useCallback, useMemo } from 'react';
import { calculateCurrentSky, type TransitPosition } from '../../core/calculator';
import type { KundaliChart } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';
import { useLanguage } from '../../context/LanguageContext';

interface Props { chart: KundaliChart }

const PC: Record<string, string> = {
  Sun:'#e07b39', Moon:'#7b9fd4', Mars:'#d94f4f', Mercury:'#4aad78',
  Jupiter:'#c9a227', Venus:'#c060a0', Saturn:'#5577b8', Rahu:'#8f5baa', Ketu:'#7d8a94',
};

const DIGNITY_BADGE: Record<string, string> = {
  Exalted:'badge-gold', Moolatrikona:'badge-teal', OwnSign:'badge-teal',
  GreatFriend:'badge-teal', Friend:'badge-teal', Neutral:'',
  Enemy:'badge-crimson', GreatEnemy:'badge-crimson', Debilitated:'badge-crimson',
};

const PLANET_KEYWORDS: Record<string, string> = {
  Sun:     'Self, authority, father, career recognition',
  Moon:    'Mind, emotions, mother, public life, comfort',
  Mars:    'Energy, courage, drive, property, siblings',
  Mercury: 'Intellect, communication, trade, analysis',
  Jupiter: 'Wisdom, luck, growth, children, spirituality',
  Venus:   'Love, beauty, wealth, relationships, creativity',
  Saturn:  'Discipline, karma, delays, longevity, service',
  Rahu:    'Worldly desires, ambition, foreign, technology',
  Ketu:    'Detachment, spirituality, past karma, liberation',
};

const PLANET_KEYWORDS_MR: Record<string, string> = {
  Sun:     'आत्मविश्वास, अधिकार, वडील, कार्यक्षेत्रातील सन्मान',
  Moon:    'मन, भावना, आई, मानसिक शांती, जनसंपर्क',
  Mars:    'ऊर्जा, धैर्य, धाडस, जमीन-जुमला, भावंडे',
  Mercury: 'बुद्धिमत्ता, संभाषण, व्यापार, तर्कशक्ती',
  Jupiter: 'ज्ञान, भाग्य, समृद्धी, संतती, अध्यात्म',
  Venus:   'प्रेम, सौंदर्य, धन, कला, वैवाहिक सुख',
  Saturn:  'शिस्त, कर्म, संयम, सातत्य, सेवा',
  Rahu:    'महत्वाकांक्षा, नवीन शोध, परदेशी संधी, तंत्रज्ञान',
  Ketu:    'अध्यात्म, वैराग्य, मोक्ष, आंतरिक जागृती',
};

// Brief plain note about how a transit planet affects the birth chart house
function transitNote(planet: string, transitHouse: number, birthHouse: number, lang: 'en' | 'mr'): string {
  const same = transitHouse === birthHouse;
  const opp  = Math.abs(transitHouse - birthHouse) === 6;
  const t11  = transitHouse === 11;
  const t10  = transitHouse === 10;
  const t1   = transitHouse === 1;

  if (lang === 'mr') {
    const pKeywordsMr: Record<string, string> = {
      Sun:     'आत्मविश्वास व प्रतिष्ठा',
      Moon:    'मनःशांती व कौटुंबिक सौख्य',
      Mars:    'ऊर्जा, धैर्य व पराक्रम',
      Mercury: 'बुद्धिमत्ता व संभाषण',
      Jupiter: 'भाग्य, ज्ञान व प्रगती',
      Venus:   'सुखसमृद्धी व नातेसंबंध',
      Saturn:  'शिस्त, कर्म व सातत्य',
      Rahu:    'संधी व महत्वाकांक्षा',
      Ketu:    'अध्यात्म व आत्मचिंतन',
    };
    const kw = pKeywordsMr[planet] || 'महत्त्वाचे क्षेत्र';
    if (same) return `सध्या जन्म स्थानावरूनच गोचर चालू आहे — ${kw} या क्षेत्रांवर थेट प्रभाव राहील.`;
    if (opp)  return `जन्म स्थानावर दृष्टी किंवा समसप्तक प्रभाव — ${kw} या विषयात सजगता व संतुलन आवश्यक.`;
    if (t11)  return '११ व्या भावातून गोचर: लाभ, आर्थिक प्रगती आणि सामाजिक संबंधांसाठी अनुकूल.';
    if (t10)  return '१० व्या भावातून गोचर: करिअर, कार्यक्षेत्र आणि सामाजिक सन्मानावर विशेष लक्ष राहील.';
    if (t1)   return '१ ल्या भावातून गोचर: आरोग्य, उत्साह आणि व्यक्तिमत्त्वावर थेट परिणाम.';
    return `तुमच्या कुंडलीतील ${transitHouse} व्या भावाचे कारकत्व सक्रिय करत आहे.`;
  }

  if (same) return `Currently transiting your natal house — direct activation of ${PLANET_KEYWORDS[planet]?.split(',')[0]} themes.`;
  if (opp)  return `Opposing your natal position — culmination and awareness around ${PLANET_KEYWORDS[planet]?.split(',')[0]} themes.`;
  if (t11)  return 'House 11 transit: supportive for network gains, social reach, and fulfillment of desires.';
  if (t10)  return 'House 10 transit: heightened focus on career authority, profession, and status.';
  if (t1)   return 'House 1 transit: directly energizes vitality, personal identity, and new initiatives.';
  return `Activating house ${transitHouse} themes relative to your birth Lagna.`;
}

function PlanetCard({ p, pos, birthChart }: { p: string; pos: TransitPosition; birthChart: KundaliChart }) {
  const [open, setOpen] = useState(false);
  const { lang, t, formatPlanet, formatSign, formatDignity } = useLanguage();
  const meta = PLANET_LABELS[p as keyof typeof PLANET_LABELS];
  const birthPos = birthChart.planets[p as keyof typeof birthChart.planets];
  const transitH = pos.house;
  const birthH   = birthPos?.house;
  const transitNak = pos.nakshatra.name;
  const birthNak   = birthPos?.nakshatra?.name;
  const sameSign = pos.sign === birthPos?.sign;

  const planetDisplayName = formatPlanet(p);
  const transitSignName = formatSign(pos.sign);
  const birthSignName = birthPos?.sign ? formatSign(birthPos.sign) : '—';
  const dignityLabel = formatDignity(pos.dignity);

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: sameSign ? '1.5px solid var(--border-gold)' : undefined,
        background: sameSign ? 'linear-gradient(180deg, var(--brand-glow) 0%, var(--surface-raised) 100%)' : undefined,
      }}
    >
      {/* Card Header & Core Metrics */}
      <div>
        <div
          style={{ display:'flex', alignItems:'center', gap:'0.85rem', cursor:'pointer' }}
          onClick={() => setOpen(o => !o)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); } }}
          aria-expanded={open}
        >
          {/* Glowing Planetary Orb */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: `${PC[p]}18`, border: `2px solid ${PC[p]}`,
            boxShadow: `0 0 14px ${PC[p]}33`,
            display: 'grid', placeItems: 'center', fontSize: '1.4rem',
          }}>
            {meta?.symbol ?? '?'}
          </div>

          {/* Planet Identity + Badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
                {planetDisplayName}
              </span>
              <span className={`badge ${DIGNITY_BADGE[pos.dignity] || ''}`} style={{ fontSize: '0.7rem' }}>
                {dignityLabel}
              </span>
              {pos.isRetrograde && (
                <span className="badge badge-violet" style={{ fontSize: '0.7rem' }}>
                  {t('sky.retro')}
                </span>
              )}
              {sameSign && (
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                  {t('sky.sameSign')}
                </span>
              )}
            </div>

            {/* Sub-label */}
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              <b style={{ color: PC[p] }}>{transitSignName}</b> · {pos.dmsString} · {transitNak} P{pos.nakshatraPosition.pada}
            </div>
          </div>
        </div>

        {/* Quick Comparison Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginTop: '0.85rem',
          padding: '0.5rem 0.65rem',
          background: 'var(--surface-overlay)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.78rem',
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('sky.transitHouse')}
            </span>
            <div style={{ fontWeight: 700, color: 'var(--brand-400)' }}>
              {transitH != null ? `${lang === 'mr' ? 'भाव' : 'House'} ${transitH}` : '—'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('sky.birthHouse')}
            </span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {birthH != null ? `${birthSignName} · H${birthH}` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      {open && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }} className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
            {/* Current Transit Column */}
            <div style={{ background: 'var(--surface-overlay)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                {t('sky.currentPosition')}
              </div>
              <div className="info-row"><span className="label">{t('sky.sign')}</span><span className="value">{transitSignName}</span></div>
              <div className="info-row"><span className="label">{t('sky.degree')}</span><span className="value">{pos.dmsString}</span></div>
              <div className="info-row"><span className="label">{t('sky.nakshatra')}</span><span className="value">{transitNak} P{pos.nakshatraPosition.pada}</span></div>
              <div className="info-row">
                <span className="label">{t('sky.motion')}</span>
                <span className="value">{pos.isRetrograde ? t('sky.retrograde') : t('sky.direct')}</span>
              </div>
            </div>

            {/* Birth Chart Column */}
            <div style={{ background: 'var(--surface-overlay)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                {t('sky.birthPosition')}
              </div>
              <div className="info-row"><span className="label">{t('sky.sign')}</span><span className="value">{birthSignName}</span></div>
              <div className="info-row"><span className="label">{t('sky.degree')}</span><span className="value">{birthPos?.dmsString ?? '—'}</span></div>
              <div className="info-row"><span className="label">{t('sky.nakshatra')}</span><span className="value">{birthNak ?? '—'} P{birthPos?.nakshatraPosition?.pada ?? '—'}</span></div>
              <div className="info-row"><span className="label">{t('sky.dignity')}</span><span className="value">{birthPos?.dignity ? formatDignity(birthPos.dignity) : '—'}</span></div>
            </div>
          </div>

          {/* Transit Effect Note */}
          {transitH && birthH && (
            <div style={{
              marginTop: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-overlay)', borderLeft: '3px solid ' + PC[p],
              fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45,
            }}>
              💡 {transitNote(p, transitH, birthH, lang)}
            </div>
          )}

          {/* Planetary Governance */}
          <div style={{ marginTop: '0.55rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <b>{planetDisplayName}</b> {t('sky.governs')} {lang === 'mr' ? PLANET_KEYWORDS_MR[p] : PLANET_KEYWORDS[p]}
          </div>
        </div>
      )}

      {/* Card Toggle Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          marginTop: '0.75rem',
          paddingTop: '0.4rem',
          borderTop: '1px dashed var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.72rem',
          color: 'var(--brand-400)',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {open ? t('sky.less') : t('sky.more')}
      </div>
    </div>
  );
}

const PLANETS_ORDER = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

export default function CurrentSky({ chart }: Props) {
  const { lang, t, formatSign } = useLanguage();
  const [sky, setSky] = useState(() =>
    calculateCurrentSky(chart.birthData.latitude, chart.birthData.longitude, chart.birthData.timezone, chart)
  );

  const refresh = useCallback(() => {
    setSky(calculateCurrentSky(chart.birthData.latitude, chart.birthData.longitude, chart.birthData.timezone, chart));
  }, [chart]);

  const ts = sky.calculatedAt;
  const timeStr = ts.toLocaleTimeString(lang === 'mr' ? 'mr-IN' : 'en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  const dateStr = ts.toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { day:'numeric', month:'long', year:'numeric' });

  // Quick summary counts
  const retroPlanets = useMemo(() => {
    return PLANETS_ORDER.filter(p => sky.positions[p]?.isRetrograde);
  }, [sky]);

  const sameSignPlanets = useMemo(() => {
    return PLANETS_ORDER.filter(p => {
      const pos = sky.positions[p];
      const bPos = chart.planets[p as keyof typeof chart.planets];
      return pos && bPos && pos.sign === bPos.sign;
    });
  }, [sky, chart]);

  return (
    <div className="fade-in">
      {/* ─── Hero Celestial Header ────────────────────────────────────────── */}
      <div className="card card-gold" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🌍</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {t('sky.title')}
              </h2>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
              {t('sky.subtitle')}
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {t('sky.liveAsOf')} <b>{dateStr}</b> {t('sky.at')} <b>{timeStr}</b> · Lahiri Ayanamsha <b>{sky.ayanamsha.toFixed(3)}°</b>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-400)', marginTop: '0.15rem' }}>
              {t('sky.housesRelative')} ({formatSign(chart.lagnaSign)})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={refresh} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              {t('sky.refresh')}
            </button>
          </div>
        </div>

        {/* Quick Celestial Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{ background: 'var(--surface-overlay)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'mr' ? 'वक्री ग्रह' : 'Retrograde Planets'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: retroPlanets.length > 0 ? '#b580ff' : 'var(--text-primary)', marginTop: '0.1rem' }}>
              {retroPlanets.length > 0 ? `${retroPlanets.length} (${retroPlanets.join(', ')})` : (lang === 'mr' ? 'कोणताही नाही' : 'None')}
            </div>
          </div>

          <div style={{ background: 'var(--surface-overlay)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'mr' ? 'जन्म राशीत गोचर' : 'Transiting Natal Sign'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-400)', marginTop: '0.1rem' }}>
              {sameSignPlanets.length > 0 ? `${sameSignPlanets.length} (${sameSignPlanets.join(', ')})` : (lang === 'mr' ? 'कोणताही नाही' : 'None')}
            </div>
          </div>

          <div style={{ background: 'var(--surface-overlay)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'mr' ? 'एकूण निरीक्षण' : 'Total Tracked'}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              9 {lang === 'mr' ? 'नवग्रह' : 'Navagrahas'}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Legend Strip ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>{t('sky.legendCurrent')}</span>
        <span>{t('sky.legendBirth')}</span>
        <span>💡 {t('sky.legendClick')}</span>
      </div>

      {/* ─── Responsive Constellation Grid ─────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
        gap: '1rem',
      }}>
        {PLANETS_ORDER.map(p => (
          sky.positions[p] && (
            <PlanetCard key={p} p={p} pos={sky.positions[p]} birthChart={chart} />
          )
        ))}
      </div>

      <p className="text-xs text-muted mt-4" style={{ lineHeight: 1.6, textAlign: 'center', maxWidth: 800, marginInline: 'auto' }}>
        {t('sky.footerNote')}
      </p>
    </div>
  );
}
