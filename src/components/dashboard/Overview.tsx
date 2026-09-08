import React from 'react';
import type { KundaliChart, Planet } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  chart: KundaliChart;
  onNavigate?: (tab: string) => void;
}

const PC: Record<string, string> = {
  Sun:'#e07b39', Moon:'#7b9fd4', Mars:'#d94f4f', Mercury:'#4aad78',
  Jupiter:'#c9a227', Venus:'#c060a0', Saturn:'#5577b8', Rahu:'#8f5baa', Ketu:'#7d8a94',
};

function formatDate(d: Date, lang: string = 'en') {
  return new Date(d).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', { month:'short', year:'numeric' });
}

export default function Overview({ chart, onNavigate }: Props) {
  const { language, t, formatPlanet, formatSign } = useLanguage();
  const {
    birthData, lagnaSign, lagnaLord, moonSign, sunSign,
    janmaNakshatra, janmaNakshatraPada, dasha, doshas, yogas,
    planetAnalysis,
  } = chart;

  const curMaha = dasha.currentMahadasha;
  const curAntar = dasha.currentAntardasha;
  const manglik  = doshas.find(d => d.id === 'manglik');
  const kaalSarp = doshas.find(d => d.id === 'kaal_sarp');
  const sadeSati = doshas.find(d => d.id === 'sade_sati');

  const rajaYogas  = yogas.filter(y => ['RajaYoga','Mahapurusha','DhanaYoga'].includes(y.category));
  const topYogas   = rajaYogas.slice(0, 4);

  // Identify planet strength themes
  const PLANETS_BODY: Planet[] = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];
  const strong  = PLANETS_BODY.filter(p => planetAnalysis[p]?.strengthLevel === 'Strong');
  const weak    = PLANETS_BODY.filter(p => planetAnalysis[p]?.strengthLevel === 'Weak');

  // Build life-area themes from strongest/most impactful planets
  interface LifeTheme {
    icon: string;
    title: string;
    headline: string;
    body: string;
    level: 'positive' | 'caution' | 'neutral';
    targetTab?: string;
  }

  const themes: LifeTheme[] = [];

  // Career: look at 10th lord and planets in 10th
  const h10 = chart.houses[9];
  const h10Planets = h10.planets.filter(p => p !== 'Ascendant');
  const h10Lord = h10.lord;
  const h10LordAnalysis = planetAnalysis[h10Lord];
  if (h10LordAnalysis?.strengthLevel === 'Strong') {
    themes.push({
      icon:'💼',
      title: language === 'mr' ? 'करिअर व प्रतिष्ठा' : 'Career & Status',
      headline: language === 'mr' ? 'कामात प्रगती व अधिकाराचे पाठबळ' : 'Professional Growth & Leadership Potential',
      body: language === 'mr'
        ? `तुमच्या करिअर भावाचा स्वामी (${formatPlanet(h10Lord)}) बलवान आहे — यामुळे कामात प्रगती, सन्मान आणि नवीन संधी मिळण्यास उत्तम पाठबळ मिळते.`
        : `The planet governing your career house (${PLANET_LABELS[h10Lord].english}) is strong — this supports professional recognition, leadership drive, and opportunities for advancement.`,
      level:'positive',
      targetTab: 'effects',
    });
  } else if (h10LordAnalysis?.strengthLevel === 'Weak') {
    themes.push({
      icon:'💼',
      title: language === 'mr' ? 'करिअर व प्रतिष्ठा' : 'Career & Status',
      headline: language === 'mr' ? 'सातत्यपूर्ण परिश्रमाची गरज' : 'Sustained Effort & Patience Required',
      body: language === 'mr'
        ? `करिअर भावाचा स्वामी (${formatPlanet(h10Lord)}) काहीसा कमजोर आहे. घाईगडबडीत निर्णय घेणे टाळा आणि सातत्यपूर्ण परिश्रमावर भर द्या.`
        : `The career house lord (${PLANET_LABELS[h10Lord].english}) is somewhat weakened. Consistent effort matters more than shortcuts. Avoid impulsive career shifts.`,
      level:'caution',
      targetTab: 'effects',
    });
  } else {
    themes.push({
      icon:'💼',
      title: language === 'mr' ? 'करिअर व प्रतिष्ठा' : 'Career & Status',
      headline: language === 'mr' ? 'नियोजनाने उत्तम प्रगती शक्य' : 'Balanced Career Trajectory',
      body: language === 'mr'
        ? `करिअरमध्ये मध्यम अनुकूलता आहे. ${h10Planets.length > 0 ? `दहाव्या भावातील ${h10Planets.map(p => formatPlanet(p)).join(', ')} ग्रह विशिष्ट कौशल्ये देतात.` : 'सातत्य आणि नियोजनाने चांगली प्रगती शक्य आहे.'}`
        : `Career is moderately supported. ${h10Planets.length > 0 ? `${h10Planets.map(p => PLANET_LABELS[p]?.english).join(' and ')} in the career house add specialized capabilities.` : 'Focus on sustained effort.'}`,
      level:'neutral',
      targetTab: 'houses',
    });
  }

  // Wealth: 2nd and 11th lords
  const h2Lord = chart.houses[1].lord;
  const h11Lord = chart.houses[10].lord;
  const wealthStrong = [h2Lord, h11Lord].filter(p => planetAnalysis[p]?.strengthLevel === 'Strong').length;
  if (wealthStrong >= 1) {
    themes.push({
      icon:'💰',
      title: language === 'mr' ? 'धनसंपत्ती व आर्थिक स्थिती' : 'Wealth & Resources',
      headline: language === 'mr' ? 'धनवृद्धीसाठी अनुकूल ग्रह योग' : 'Favorable Combinations for Financial Stability',
      body: language === 'mr'
        ? 'धनवृद्धीसाठी अनुकूल ग्रह योग आहेत. प्रामाणिक प्रयत्नांना चांगली आर्थिक साथ मिळू शकते.'
        : 'Positive combinations exist for wealth building. The planets linked to income and savings are well placed, supporting financial growth when paired with practical effort.',
      level:'positive',
      targetTab: 'yogas',
    });
  } else {
    themes.push({
      icon:'💰',
      title: language === 'mr' ? 'धनसंपत्ती व आर्थिक स्थिती' : 'Wealth & Resources',
      headline: language === 'mr' ? 'शिस्तबद्ध आर्थिक नियोजनाची गरज' : 'Steady Budgeting & Long-Term Building',
      body: language === 'mr'
        ? 'आर्थिक स्थैर्यासाठी नियमित बचत व योग्य नियोजनाची गरज आहे. जोखमीच्या गुंतवणुकीत सावधगिरी बाळगा.'
        : 'Wealth accumulation benefits from steady discipline rather than windfalls. Consistent savings and avoiding speculative risks is the practical path.',
      level:'neutral',
      targetTab: 'houses',
    });
  }

  // Relationships: 7th lord
  const h7Lord = chart.houses[6].lord;
  const h7LordAnalysis = planetAnalysis[h7Lord];
  if (h7LordAnalysis?.isExalted || h7LordAnalysis?.strengthLevel === 'Strong') {
    themes.push({
      icon:'💖',
      title: language === 'mr' ? 'नातेसंबंध व वैवाहिक जीवन' : 'Relationships & Partnerships',
      headline: language === 'mr' ? 'समजूतदारपणा आणि सुसंवाद' : 'Supportive Partnerships & Harmony',
      body: language === 'mr'
        ? `नातेसंबंधाचा स्वामी ग्रह (${formatPlanet(h7Lord)}) चांगल्या स्थितीत आहे — यामुळे परस्पर समजूतदारपणा आणि सुसंवाद राखण्यास मदत होते.`
        : `The planet governing relationships (${PLANET_LABELS[h7Lord].english}) is in good condition — indicating supportive partnerships and collaborative harmony.`,
      level:'positive',
      targetTab: 'effects',
    });
  } else if (h7LordAnalysis?.isDebilitated || h7LordAnalysis?.isAfflicted) {
    themes.push({
      icon:'💖',
      title: language === 'mr' ? 'नातेसंबंध व वैवाहिक जीवन' : 'Relationships & Partnerships',
      headline: language === 'mr' ? 'स्पष्ट संवाद व संयम आवश्यक' : 'Conscious Communication & Patience Needed',
      body: language === 'mr'
        ? `नातेसंबंधात संयम आणि स्पष्ट संवाद ठेवणे आवश्यक आहे. गैरसमज टाळण्याचा प्रयत्न करा.`
        : `Relationships benefit from conscious communication and patience. ${PLANET_LABELS[h7Lord].english}'s placement suggests navigating some complexity in partnerships.`,
      level:'caution',
      targetTab: 'effects',
    });
  } else {
    themes.push({
      icon:'💖',
      title: language === 'mr' ? 'नातेसंबंध व वैवाहिक जीवन' : 'Relationships & Partnerships',
      headline: language === 'mr' ? 'परस्पर आदर व सहकार्य' : 'Mutual Respect & Balance',
      body: language === 'mr'
        ? 'नातेसंबंधांमध्ये परस्पर आदर व पारदर्शकता ठेवल्यास सौख्य लाभेल.'
        : 'Relationships carry meaningful weight in this chart. Mutual respect and clear communication are key themes to focus on.',
      level:'neutral',
      targetTab: 'effects',
    });
  }

  // Major Strength
  if (strong.length > 0) {
    const topPlanet = strong[0];
    themes.push({
      icon:'⚡',
      title: language === 'mr' ? 'कुंडलीतील प्रमुख शक्तीस्थान' : 'Major Chart Strength',
      headline: `${formatPlanet(topPlanet)} — ${language === 'mr' ? 'अत्यंत प्रभावी ग्रह' : 'Key Supportive Power'}`,
      body: language === 'mr'
        ? `${formatPlanet(topPlanet)} हा ग्रह तुमच्या पत्रिकेत बलवान असून त्याच्याशी संबंधित गुणधर्म तुमच्या प्रगतीत मुख्य भूमिका बजावतात.`
        : `${PLANET_LABELS[topPlanet].english} is among the strongest placements in your chart, naturally reinforcing its life themes and functional nature.`,
      level:'positive',
      targetTab: 'effects',
    });
  }

  // Key Challenge / Watchout
  if (weak.length > 0) {
    const weakPlanet = weak[0];
    themes.push({
      icon:'🛡',
      title: language === 'mr' ? 'दक्षता व लक्ष देण्याची जागा' : 'Key Growth Focus',
      headline: `${formatPlanet(weakPlanet)} — ${language === 'mr' ? 'सजगतेची आवश्यकता' : 'Conscious Development Area'}`,
      body: language === 'mr'
        ? `${formatPlanet(weakPlanet)} हा ग्रह काहीसा कमजोर असल्याने त्याच्या कार्यात घाई न करता नियोजनबद्ध पावले टाकावीत.`
        : `${PLANET_LABELS[weakPlanet].english} requires extra mindfulness. Conscious habit-building helps balance its weaker expression over time.`,
      level:'caution',
      targetTab: 'effects',
    });
  }

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
      {/* ─── HERO IDENTITY BANNER ────────────────────────────────────────── */}
      <div className="card card-hero">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
              <span style={{ fontSize:'1.75rem' }}>🔮</span>
              <div>
                <h2 style={{ fontSize:'1.45rem', fontWeight:800, margin:0, color:'var(--text-primary)', letterSpacing:'0.02em' }}>
                  {birthData.name || (language === 'mr' ? 'जन्मकुंडली विश्लेषण' : 'Natal Chart')}
                </h2>
                <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'0.2rem' }}>
                  {birthData.dob} · {birthData.tob} · <b>{birthData.cityName}</b>{birthData.country ? `, ${birthData.country}` : ''}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <span className="badge badge-gold" style={{ fontSize:'0.75rem', padding:'0.3rem 0.75rem' }}>
              Lahiri {chart.ayanamsha.toFixed(3)}°
            </span>
            <span className="badge badge-subtle" style={{ fontSize:'0.75rem', padding:'0.3rem 0.75rem' }}>
              {chart.birthData.latitude.toFixed(2)}°N, {chart.birthData.longitude.toFixed(2)}°E
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
            borderLeft:'3.5px solid var(--brand-400)',
          }}>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
              🌅 {t('overview.natalLagna')}
            </div>
            <div style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)', marginTop:'0.2rem' }}>
              {formatSign(lagnaSign)}
            </div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'0.15rem' }}>
              {t('common.lord')}: <b style={{ color:'var(--brand-400)' }}>{formatPlanet(lagnaLord)}</b>
            </div>
          </div>

          {/* Moon Sign */}
          <div style={{
            background:'var(--surface-overlay)',
            padding:'0.9rem 1.1rem',
            borderRadius:'var(--radius-md)',
            border:'1px solid var(--border-subtle)',
            borderLeft:'3.5px solid #7b9fd4',
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
            borderLeft:'3.5px solid #e07b39',
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
            borderLeft:'3.5px solid #c060a0',
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

          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {themes.map((th, idx) => {
              const borderCol = th.level === 'positive'
                ? 'var(--semantic-supportive-border)'
                : th.level === 'caution'
                ? 'var(--semantic-challenging-border)'
                : 'var(--semantic-neutral-border)';
              return (
                <div
                  key={idx}
                  className="card-insight card-interactive"
                  style={{ borderLeftColor: borderCol }}
                  onClick={() => th.targetTab && onNavigate && onNavigate(th.targetTab)}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      <span style={{ fontSize:'1.2rem' }}>{th.icon}</span>
                      <span style={{ fontWeight:700, fontSize:'0.94rem', color:'var(--text-primary)' }}>{th.title}</span>
                    </div>
                    <span className={`badge ${th.level === 'positive' ? 'badge-supportive' : th.level === 'caution' ? 'badge-challenging' : 'badge-neutral'}`}>
                      {th.level === 'positive' ? (language === 'mr' ? 'शुभ / अनुकूल' : 'Supportive') : th.level === 'caution' ? (language === 'mr' ? 'सजगता आवश्यक' : 'Mindful') : (language === 'mr' ? 'मध्यम' : 'Neutral')}
                    </span>
                  </div>

                  <div className="insight-title" style={{ marginTop:'0.15rem' }}>
                    {th.headline}
                  </div>

                  <p style={{ fontSize:'0.86rem', color:'var(--text-secondary)', lineHeight:1.65, margin:0 }}>
                    {th.body}
                  </p>

                  {th.targetTab && (
                    <div style={{ fontSize:'0.76rem', fontWeight:600, color:'var(--text-muted)', marginTop:'0.35rem', display:'flex', alignItems:'center', gap:'0.35rem' }}>
                      <span>{language === 'mr' ? 'सविस्तर विश्लेषण पहा' : 'Explore details'}</span>
                      <span style={{ color:'var(--brand-400)' }}>→</span>
                    </div>
                  )}
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
                    background:`${PC[curMaha.planet]}18`, border:`2px solid ${PC[curMaha.planet]}`,
                    display:'grid', placeItems:'center', fontSize:'1.25rem', color:PC[curMaha.planet],
                  }}>
                    {PLANET_LABELS[curMaha.planet]?.symbol ?? '🕐'}
                  </div>
                  <div>
                    <div style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text-primary)' }}>
                      <span style={{ color:'var(--brand-400)' }}>{formatPlanet(curMaha.planet)}</span> {language === 'mr' ? 'महादशा' : 'Mahadasha'}
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
                        <span style={{ color:'var(--brand-400)' }}>{formatPlanet(curAntar.planet)}</span>
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
                const col  = p === 'Ascendant' ? 'var(--brand-400)' : PC[p];
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
