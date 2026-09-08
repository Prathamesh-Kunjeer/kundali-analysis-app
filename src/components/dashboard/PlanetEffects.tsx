import React, { useState } from 'react';
import type { KundaliChart, Planet, PlanetAnalysis } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';
import { useLanguage } from '../../context/LanguageContext';

interface Props { chart: KundaliChart }

const PC: Record<string, string> = {
  Sun:'#e07b39', Moon:'#7b9fd4', Mars:'#d94f4f', Mercury:'#4aad78',
  Jupiter:'#c9a227', Venus:'#c060a0', Saturn:'#5577b8', Rahu:'#8f5baa', Ketu:'#7d8a94',
};

// Plain English / Marathi for what each planet rules in life
const PLANET_LIFE_AREAS: Record<string, string> = {
  Sun:     'Confidence, identity, leadership, relationship with father, career recognition, and authority.',
  Moon:    'Mind, emotions, memory, relationship with mother, comfort needs, and public reputation.',
  Mars:    'Energy levels, courage, drive, siblings, property ownership, and ability to take action.',
  Mercury: 'Intelligence, communication, business sense, learning, analytical skills, and relationships with friends.',
  Jupiter: 'Wisdom, opportunities, luck, children, spirituality, teachers, and financial growth.',
  Venus:   'Love life, relationships, beauty, creativity, material comforts, and artistic expression.',
  Saturn:  'Discipline, hard work, karma, delays, longevity, service to others, and life lessons.',
  Rahu:    'Worldly ambitions, obsessive desires, foreign connections, technology, and unconventional paths.',
  Ketu:    'Spiritual detachment, past-life skills, intuition, liberation, and letting go of the material.',
};

const PLANET_LIFE_AREAS_MR: Record<string, string> = {
  Sun:     'आत्मविश्वास, व्यक्तिमत्त्व, नेतृत्व, वडिलांशी नातेसंबंध, करिअरमधील सन्मान व अधिकार.',
  Moon:    'मन, भावना, स्मरणशक्ती, आईशी नातेसंबंध, मानसिक सुख आणि जनमानसातील प्रतिष्ठा.',
  Mars:    'ऊर्जा, धैर्य, महत्त्वाकांक्षा, भावंडं, जमीन-जुमला/मालमत्ता आणि निर्णयक्षमता.',
  Mercury: 'बुद्धिमत्ता, संवाद कौशल्य, व्यापार, शिक्षण, तर्कशुद्ध विचार आणि मित्रमंडळी.',
  Jupiter: 'ज्ञान, संधी, भाग्य, संतती, अध्यात्म, गुरू आणि आर्थिक प्रगती.',
  Venus:   'प्रेम, नातेसंबंध, सौंदर्य, कला, भौतिक सुखसोयी आणि वैवाहिक सौख्य.',
  Saturn:  'शिस्त, कठीण परिश्रम, कर्म, संयम, दीर्घायुष्य आणि जीवनातील महत्त्वाचे धडे.',
  Rahu:    'जागतिक महत्त्वाकांक्षा, गूढ इच्छा, परदेश संबंध, तंत्रज्ञान आणि अनोखी वाट.',
  Ketu:    'अध्यात्म, विरक्ती, पूर्वजन्मीचे संस्कार, अंतर्ज्ञान आणि मोक्ष मार्ग.',
};

// Plain effects per house
function housePlainMeaning(house: number, lang: string = 'en'): string {
  if (lang === 'mr') {
    const m: Record<number, string> = {
      1:'व्यक्तिमत्त्व व आरोग्य', 2:'कुटुंब, संपत्ती व वाणी',
      3:'धैर्य, पराक्रम व भावंडं', 4:'घर, आई व मानसिक शांती',
      5:'बुद्धिमत्ता, संतती व शिक्षण', 6:'आरोग्य, नोकरी व आव्हाने',
      7:'भागीदारी, विवाह व वैवाहिक जीवन', 8:'परिवर्तन, गूढ ज्ञान व आयुष्य',
      9:'भाग्य, उच्च शिक्षण व धर्म', 10:'करिअर, प्रतिष्ठा व कार्यक्षेत्र',
      11:'उत्पन्न, लाभ व मित्रपरिवार', 12:'अध्यात्म, परदेश व विरक्ती',
    };
    return m[house] || `${house}वा भाव`;
  }
  const m: Record<number, string> = {
    1:'identity and overall wellbeing', 2:'family, finances, and speech',
    3:'courage, siblings, and short travel', 4:'home, mother, and inner peace',
    5:'creativity, children, and intelligence', 6:'health, work environment, and overcoming obstacles',
    7:'partnerships and marriage', 8:'transformation, hidden matters, and longevity',
    9:'higher learning, luck, and father', 10:'career, reputation, and public life',
    11:'income, social networks, and long-term gains', 12:'spiritual growth, foreign lands, and letting go',
  };
  return m[house] || `house ${house}`;
}

function dignityPlainText(dignity: string, lang: string = 'en'): string {
  if (lang === 'mr') {
    const d: Record<string, string> = {
      Exalted:'उच्च राशीत अत्यंत प्रभावी स्थितीत आहे',
      Moolatrikona:'मूलत्रिकोण राशीत अतिशय बलवान स्थितीत आहे',
      OwnSign:'स्वराशीत अत्यंत अनुकूल व सुरक्षित आहे',
      GreatFriend:'अधिमित्र राशीत उत्तम सहकार्याने कार्य करतो',
      Friend:'मित्र राशीत अनुकूल स्थितीत आहे',
      Neutral:'सम राशीत मध्यम परिणाम देतो',
      Enemy:'शत्रू राशीत काहीशा संघर्षाने कार्य करतो',
      GreatEnemy:'अधिशत्रू राशीत प्रतिकूल स्थितीत आहे',
      Debilitated:'नीच राशीत असल्याने अधिक प्रयत्नांची आवश्यकता आहे',
    };
    return d[dignity] || dignity;
  }
  const d: Record<string, string> = {
    Exalted:'at peak power — expressing its best qualities',
    Moolatrikona:'in a very comfortable, strong position',
    OwnSign:'very comfortable — in its home territory',
    GreatFriend:'in a highly friendly environment — working well',
    Friend:'in a friendly sign — cooperating smoothly',
    Neutral:'in a neutral sign — neither particularly strong nor weak',
    Enemy:'in an unfriendly sign — some difficulty expressing naturally',
    GreatEnemy:'in a very unfriendly sign — expressing with some struggle',
    Debilitated:'in its weakest sign — facing challenges in expression',
  };
  return d[dignity] || dignity;
}

function overallVerdict(analysis: PlanetAnalysis, lang: string = 'en'): { label: string; color: string; summary: string } {
  const { strengthLevel, functionalNature, isAfflicted, isExalted, isDebilitated, isCombust } = analysis;

  if ((isExalted || functionalNature === 'Yogakaraka') && strengthLevel === 'Strong') {
    return {
      label: lang === 'mr' ? 'अतिशय अनुकूल' : 'Highly Supportive',
      color: '#4aad78',
      summary: lang === 'mr'
        ? 'हा ग्रह अतिशय उत्तम स्थितीत असून संबंधित जीवनक्षेत्रात शुभ फळ देण्याची मोठी शक्यता आहे.'
        : 'This planet is in excellent condition and likely to bring positive results in its areas of life.'
    };
  }
  if (isDebilitated || (isAfflicted && strengthLevel === 'Weak') || isCombust) {
    return {
      label: lang === 'mr' ? 'आव्हानात्मक' : 'Challenging',
      color: '#d94f4f',
      summary: lang === 'mr'
        ? 'हा ग्रह अडचणीत असून संबंधित विषयांमध्ये विशेष सावधगिरी व अतिरिक्त प्रयत्नांची गरज आहे.'
        : 'This planet faces difficulties. Its themes may require extra effort or show up as areas of challenge.'
    };
  }
  if (strengthLevel === 'Strong' && !isAfflicted) {
    return {
      label: lang === 'mr' ? 'अनुकूल' : 'Supportive',
      color: '#4aad78',
      summary: lang === 'mr'
        ? 'हा ग्रह चांगल्या स्थितीत असून संबंधित जीवनक्षेत्रात चांगले सहकार्य देईल.'
        : 'This planet is in good condition and generally supports its associated life areas.'
    };
  }
  if (functionalNature === 'Malefic') {
    return {
      label: lang === 'mr' ? 'मिश्र — काळजीपूर्वक हाताळा' : 'Mixed — Watch Carefully',
      color: '#c9a227',
      summary: lang === 'mr'
        ? 'हा ग्रह काही आव्हाने निर्माण करू शकतो, परंतु योग्य शिस्तीने चांगले फळ मिळू शकते.'
        : 'This planet has a challenging functional role but may still produce results through discipline and effort.'
    };
  }
  if (strengthLevel === 'Weak') {
    return {
      label: lang === 'mr' ? 'लक्ष देण्याची गरज' : 'Needs Attention',
      color: '#e07b39',
      summary: lang === 'mr'
        ? 'हा ग्रह काहीसा कमजोर आहे. संबंधित क्षेत्रात सजग राहून प्रयत्न करावेत.'
        : 'This planet is somewhat weakened. Conscious effort in its life areas may be needed.'
    };
  }
  return {
    label: lang === 'mr' ? 'मिश्र' : 'Mixed',
    color: '#c9a227',
    summary: lang === 'mr'
      ? 'या ग्रहाचे अनुकूल व आव्हानात्मक दोन्ही पैलू दिसून येतात.'
      : 'This planet shows both positive and challenging qualities — results depend on other chart factors.'
  };
}

function strengthBar(score: number) {
  const pct = Math.min(100, score);
  const col = score >= 60 ? '#4aad78' : score >= 35 ? '#c9a227' : '#d94f4f';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
      <div style={{ flex:1, height:6, borderRadius:3, background:'var(--surface-overlay)' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:3, background:col, transition:'width 0.4s' }} />
      </div>
      <span style={{ fontSize:'0.75rem', color:col, fontWeight:600, minWidth:28 }}>{score}/100</span>
    </div>
  );
}

function PlanetCard({ p, analysis, chart }: { p: Planet; analysis: PlanetAnalysis; chart: KundaliChart }) {
  const { language, t, formatPlanet, formatSign } = useLanguage();
  const [showTech, setShowTech] = useState(false);
  const meta   = PLANET_LABELS[p];
  const pos    = analysis.position;
  const verdict= overallVerdict(analysis, language);
  const interp = analysis.interpretation;
  const lifeArea = language === 'mr' ? (PLANET_LIFE_AREAS_MR[p] ?? '') : (PLANET_LIFE_AREAS[p] ?? '');

  // Build plain-English / Marathi situation summary
  const situation = language === 'mr'
    ? [
        `${formatPlanet(p)} सध्या तुमच्या <b>${housePlainMeaning(pos.house, language)}</b> (भाव ${pos.house}) मध्ये,`,
        `<b>${formatSign(pos.sign)}</b> राशीत,`,
        `${dignityPlainText(pos.dignity, language)}.`,
        analysis.strengthLevel === 'Strong' ? 'हा ग्रह तुमच्या कुंडलीत पूर्ण ताकदीने प्रभाव टाकत आहे.' :
        analysis.strengthLevel === 'Weak'   ? 'या ग्रहाचा प्रभाव काहीसा संघर्षमय आहे.' :
                                              'याचा प्रभाव संतुलित व मध्यम आहे.',
        pos.isRetrograde ? 'हा ग्रह वक्री असून याचे परिणाम अधिक अंतर्मुख किंवा कर्माधारित असू शकतात.' : '',
        pos.isCombust    ? 'हा ग्रह सूर्याजवळ असल्याने अस्त झाला आहे, त्यामुळे त्याचे स्वतंत्र बळ काहीसे कमी होते.' : '',
      ].filter(Boolean).join(' ')
    : [
        `${meta.english} is currently in your <b>${housePlainMeaning(pos.house)}</b> area (House ${pos.house}),`,
        `in the sign of <b>${pos.sign}</b>,`,
        `${dignityPlainText(pos.dignity)}.`,
        analysis.strengthLevel === 'Strong' ? 'It is expressing itself strongly in your chart.' :
        analysis.strengthLevel === 'Weak'   ? 'It is expressing itself with some difficulty.' :
                                              'It is expressing itself at a moderate level.',
        pos.isRetrograde ? 'It is currently retrograde — this can internalize its energy, making it more introspective or karmic.' : '',
        pos.isCombust    ? 'It is combust (very close to the Sun) — this can reduce its independent expression.' : '',
      ].filter(Boolean).join(' ');

  // Positive effects (plain language)
  const positives: string[] = [];
  const challenges: string[] = [];

  if (language === 'mr') {
    if (analysis.isExalted)            positives.push(`${formatPlanet(p)} उच्च राशीत असल्याने त्याचे शुभ परिणाम ठळकपणे दिसून येतील.`);
    if (analysis.isInOwnSign)          positives.push(`स्वराशीत (${formatSign(pos.sign)}) असल्याने हा ग्रह सहजपणे अनुकूल फळ देतो.`);
    if (analysis.isVargottama)         positives.push(`वर्गोत्तम (लग्न व नवांश दोन्हीत समान रास) — अतिरिक्त स्थैर्य व बळ.`);
    if (analysis.functionalNature === 'Yogakaraka') positives.push('तुमच्या लग्नासाठी हा विशेष योगकारक ग्रह आहे — अत्यंत शुभदायी.');
    if (analysis.functionalNature === 'Benefic')   positives.push(`${formatSign(chart.lagnaSign)} लग्नासाठी शुभकारक भूमिका.`);

    if (analysis.isDebilitated)        challenges.push('नीच राशीत असल्याने पूर्ण फळ मिळण्यात अडचणी येऊ शकतात.');
    if (analysis.isCombust)            challenges.push('सूर्याच्या प्रभावामुळे अस्त झाला आहे — जाणीवपूर्वक प्रयत्न आवश्यक.');
    if (analysis.isAfflicted)          challenges.push('पाप ग्रहांची दृष्टी किंवा युती असल्याने काही तणाव जाणवू शकतो.');
    if (analysis.functionalNature === 'Malefic') challenges.push(`${formatSign(chart.lagnaSign)} लग्नासाठी आव्हानात्मक भूमिका — काळजीपूर्वक निर्णय घ्या.`);
    if (pos.isRetrograde)              challenges.push('वक्री स्थिती — अपेक्षित फळे उशिरा किंवा अप्रत्यक्ष मार्गाने मिळू शकतात.');
  } else {
    if (analysis.isExalted)            positives.push(`${meta.english} at peak strength — expect its themes to shine.`);
    if (analysis.isInOwnSign)          positives.push(`Very comfortable in ${pos.sign} — expresses naturally.`);
    if (analysis.isVargottama)         positives.push(`Vargottama (same sign in birth and divisional chart) — additional stability.`);
    if (analysis.functionalNature === 'Yogakaraka') positives.push('Acts as a special activating planet (Yogakaraka) for your rising sign — particularly powerful.');
    if (analysis.functionalNature === 'Benefic')   positives.push(`Functionally supportive role for your ${chart.lagnaSign} Lagna.`);

    if (analysis.isDebilitated)        challenges.push(`In its weakest sign — may face difficulty expressing itself clearly.`);
    if (analysis.isCombust)            challenges.push(`Combust by the Sun — somewhat overshadowed, needs conscious effort.`);
    if (analysis.isAfflicted)          challenges.push(`Receiving difficult aspects without benefic relief — some tension in its life areas.`);
    if (analysis.functionalNature === 'Malefic') challenges.push(`Has a challenging functional role for ${chart.lagnaSign} Lagna — exercise care with its themes.`);
    if (pos.isRetrograde)              challenges.push(`Retrograde — energy turns inward; may manifest in indirect or unexpected ways.`);
  }

  // Career and wealth plain notes
  const careerNote = interp.career.replace(/\. .+$/, '.'); // first sentence
  const wealthNote = interp.wealth.replace(/\. .+$/, '.');
  const relNote    = interp.relationships.replace(/\. .+$/, '.');
  const healthNote = interp.health.replace(/\. .+$/, '.');

  return (
    <div className="card" style={{ marginBottom:'1.1rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
        <div style={{
          width:52, height:52, borderRadius:'50%', flexShrink:0,
          background:`${PC[p]}18`, border:`2.5px solid ${PC[p]}`,
          display:'grid', placeItems:'center', fontSize:'1.5rem',
        }}>
          {meta.symbol}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
            <h3 style={{ margin:0, fontSize:'1.05rem' }}>{formatPlanet(p)}</h3>
            <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>({meta.english} / {meta.sanskrit})</span>
            <span className={`badge ${analysis.strengthLevel === 'Strong' ? 'badge-teal' : analysis.strengthLevel === 'Weak' ? 'badge-crimson' : 'badge-gold'}`}>
              {analysis.strengthLevel === 'Strong' ? (language === 'mr' ? 'बलवान' : 'Strong') : analysis.strengthLevel === 'Weak' ? (language === 'mr' ? 'कमजोर' : 'Weak') : (language === 'mr' ? 'मध्यम' : 'Moderate')}
            </span>
            <span style={{ background:`${verdict.color}22`, color:verdict.color, border:`1px solid ${verdict.color}55`, borderRadius:'var(--radius-xs)', padding:'0.15rem 0.55rem', fontSize:'0.72rem', fontWeight:600 }}>
              {verdict.label}
            </span>
          </div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.25rem' }}>
            {language === 'mr' ? 'भाव' : 'House'} {pos.house} · {formatSign(pos.sign)} · {pos.dmsString} · {pos.nakshatra.name} {t('common.pada')} {pos.nakshatraPosition.pada}
          </div>
          {strengthBar(analysis.strengthScore)}
        </div>
      </div>

      {/* What it governs */}
      <div style={{ fontSize:'0.83rem', color:'var(--text-muted)', marginBottom:'0.75rem', fontStyle:'italic' }}>
        {lifeArea}
      </div>

      {/* Situation paragraph */}
      <div style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:1.7, marginBottom:'0.85rem' }}
        dangerouslySetInnerHTML={{ __html: situation }} />

      {/* What it means for key areas */}
      <div className="grid-2" style={{ gap:'0.65rem', marginBottom:'0.85rem' }}>
        {[
          { icon:'💼', label: language === 'mr' ? 'करिअर व कार्यक्षेत्र' : 'Career & Work', text:careerNote },
          { icon:'💰', label: language === 'mr' ? 'धनसंपत्ती व प्राप्ती' : 'Wealth & Resources', text:wealthNote },
          { icon:'❤', label: language === 'mr' ? 'नातेसंबंध' : 'Relationships', text:relNote },
          { icon:'🏥', label: language === 'mr' ? 'आरोग्य संकेत' : 'Health Signals', text:healthNote },
        ].map(({ icon, label, text }) => (
          <div key={label} style={{ padding:'0.6rem 0.8rem', background:'var(--surface-overlay)', borderRadius:'var(--radius-sm)', fontSize:'0.8rem' }}>
            <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:'0.25rem' }}>{icon} {label}</div>
            <div style={{ color:'var(--text-secondary)', lineHeight:1.55 }}>{text}</div>
          </div>
        ))}
      </div>

      {/* Positive effects */}
      {positives.length > 0 && (
        <div style={{ marginBottom:'0.65rem' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#4aad78', marginBottom:'0.3rem' }}>
            {language === 'mr' ? '✅ सकारात्मक पैलू' : '✅ Positive qualities'}
          </div>
          {positives.map((pt, i) => (
            <div key={i} style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginLeft:'0.75rem', marginBottom:'0.15rem' }}>· {pt}</div>
          ))}
        </div>
      )}

      {/* Challenges */}
      {challenges.length > 0 && (
        <div style={{ marginBottom:'0.65rem' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#e07b39', marginBottom:'0.3rem' }}>
            {language === 'mr' ? '⚡ संभाव्य आव्हाने' : '⚡ Potential challenges'}
          </div>
          {challenges.map((ch, i) => (
            <div key={i} style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginLeft:'0.75rem', marginBottom:'0.15rem' }}>· {ch}</div>
          ))}
        </div>
      )}

      {/* Overall verdict */}
      <div style={{
        borderTop:'1px solid var(--border-subtle)', paddingTop:'0.65rem', marginTop:'0.5rem',
        display:'flex', alignItems:'flex-start', gap:'0.6rem',
      }}>
        <div style={{ width:10, height:10, borderRadius:'50%', background:verdict.color, marginTop:4, flexShrink:0 }} />
        <div style={{ fontSize:'0.83rem', color:'var(--text-secondary)', lineHeight:1.6 }}>
          <b style={{ color:verdict.color }}>{verdict.label}:</b> {verdict.summary}
        </div>
      </div>

      {/* Technical details (collapsed) */}
      <button
        className="btn btn-ghost" onClick={() => setShowTech(t => !t)}
        style={{ marginTop:'0.65rem', fontSize:'0.75rem', padding:'0.25rem 0.6rem' }}
      >
        {showTech ? `▲ ${t('common.hideTechnical')}` : `▼ ${t('common.technicalDetails')}`}
      </button>
      {showTech && (
        <div style={{ marginTop:'0.6rem', padding:'0.75rem', background:'var(--surface-overlay)', borderRadius:'var(--radius-sm)', fontSize:'0.78rem' }}>
          <div className="info-row"><span className="label">{language === 'mr' ? 'रेखांश (Longitude)' : 'Longitude'}</span><span className="value">{pos.longitude.toFixed(4)}°</span></div>
          <div className="info-row"><span className="label">{t('common.dignity')}</span><span className="value">{pos.dignity}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'अवस्था (Avastha)' : 'Avastha'}</span><span className="value">{pos.avastha}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'कार्यात्मक स्वभाव' : 'Functional role'}</span><span className="value">{analysis.functionalNature}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'भावांचे अधिपत्य' : 'House ownership'}</span><span className="value">H{analysis.houseOwnership.join(', H') || '—'}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'वर्गोत्तम' : 'Vargottama'}</span><span className="value">{analysis.isVargottama ? (language === 'mr' ? 'होय' : 'Yes') : (language === 'mr' ? 'नाही' : 'No')}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'गती' : 'Speed'}</span><span className="value">{pos.speed.toFixed(4)}°/day {pos.isRetrograde ? '(℞)' : ''}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'दिलेली दृष्टी' : 'Aspects given to'}</span><span className="value">{analysis.aspectsGiven.map(a => `H${a.toHouse}`).join(', ') || 'none'}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'मिळालेली दृष्टी' : 'Aspects received from'}</span><span className="value">{analysis.aspectsReceived.map(a => formatPlanet(a.fromPlanet)).join(', ') || 'none'}</span></div>
          <div style={{ marginTop:'0.5rem', fontStyle:'italic', color:'var(--text-muted)' }}>
            {language === 'mr' ? 'अध्यात्मिक उपाय / मार्गदर्शन: ' : 'Spiritual practice: '}{interp.spirituality}
          </div>
        </div>
      )}
    </div>
  );
}

const PLANETS_ORDER: Planet[] = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

export default function PlanetEffects({ chart }: Props) {
  const { language, formatPlanet, formatSign } = useLanguage();
  const [selected, setSelected] = useState<Planet>('Sun');

  const strongPlanets = PLANETS_ORDER.filter(p => chart.planetAnalysis[p]?.strengthLevel === 'Strong');
  const weakPlanets   = PLANETS_ORDER.filter(p => chart.planetAnalysis[p]?.strengthLevel === 'Weak');
  const activeAnalysis = chart.planetAnalysis[selected];

  return (
    <div className="fade-in">
      {/* Top Banner Summary */}
      <div className="card card-hero" style={{ marginBottom:'1.5rem', padding:'1.4rem 1.6rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2 style={{ fontSize:'1.25rem', fontWeight:800, margin:0, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <span>🪐</span>
              <span>{language === 'mr' ? 'ग्रहांचे परिणाम व प्रभाव' : 'Planet Effects & Planetary Influences'}</span>
            </h2>
            <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'0.25rem', marginBottom:0, lineHeight:1.5 }}>
              {language === 'mr'
                ? 'तुमच्या जन्मकुंडलीत प्रत्येक ग्रह कशा प्रकारे कार्य करत आहे याचे सोप्या भाषेतील वैयक्तिक विश्लेषण.'
                : 'Understand how each of the 9 Grahas expresses its unique energy across your life path.'}
            </p>
          </div>

          <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', alignItems:'center' }}>
            {strongPlanets.length > 0 && (
              <span className="badge badge-teal" style={{ padding:'0.3rem 0.75rem', fontSize:'0.75rem' }}>
                💪 {language === 'mr' ? 'बलवान: ' : 'Strong: '} {strongPlanets.map(p => formatPlanet(p)).join(', ')}
              </span>
            )}
            {weakPlanets.length > 0 && (
              <span className="badge badge-crimson" style={{ padding:'0.3rem 0.75rem', fontSize:'0.75rem' }}>
                ⚡ {language === 'mr' ? 'लक्ष द्या: ' : 'Focus: '} {weakPlanets.map(p => formatPlanet(p)).join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Master-Detail Split Workspace */}
      <div className="grid-desktop-split">
        {/* ─── LEFT COLUMN: Planet Selector List ──────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text-muted)', marginBottom:'0.2rem' }}>
            {language === 'mr' ? 'ग्रह निवडा (९ ग्रह)' : 'Select Planet (9 Grahas)'}
          </div>

          <div style={{
            display:'flex',
            flexDirection:'column',
            gap:'0.45rem',
          }}>
            {PLANETS_ORDER.map(p => {
              const analysis = chart.planetAnalysis[p];
              const pos = chart.planets[p];
              const isSel = selected === p;
              const meta = PLANET_LABELS[p];
              const col = PC[p];

              return (
                <button
                  key={p}
                  className="card-interactive"
                  onClick={() => setSelected(p)}
                  style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'space-between',
                    padding:'0.65rem 0.9rem',
                    borderRadius:'var(--radius-md)',
                    background: isSel ? `${col}18` : 'var(--surface-raised)',
                    border: `1.5px solid ${isSel ? col : 'var(--border-subtle)'}`,
                    boxShadow: isSel ? `0 0 16px ${col}33` : 'var(--shadow-card)',
                    textAlign:'left',
                    cursor:'pointer',
                    transition:'all 0.18s ease',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
                    <div style={{
                      width:34, height:34, borderRadius:'50%',
                      background:`${col}22`, border:`1.5px solid ${col}`,
                      display:'grid', placeItems:'center',
                      fontSize:'1.1rem', color:col, flexShrink:0,
                    }}>
                      {meta.symbol}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.88rem', color: isSel ? col : 'var(--text-primary)' }}>
                        {formatPlanet(p)}
                      </div>
                      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>
                        {pos ? `${formatSign(pos.sign)} · H${pos.house}` : '—'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign:'right' }}>
                    <span className={`badge ${analysis?.strengthLevel === 'Strong' ? 'badge-teal' : analysis?.strengthLevel === 'Weak' ? 'badge-crimson' : 'badge-gold'}`} style={{ fontSize:'0.65rem' }}>
                      {analysis?.strengthLevel || '—'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: Selected Planet Details Stage ────────────────── */}
        <div>
          {activeAnalysis ? (
            <PlanetCard key={selected} p={selected} analysis={activeAnalysis} chart={chart} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
