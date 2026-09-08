import React, { useState } from 'react';
import type { KundaliChart, Planet, AspectRelation } from '../../core/models';
import { PLANET_LABELS } from '../../core/constants';
import { aspectsGivenBy, aspectsReceivedBy } from '../../core/aspects';
import { useLanguage } from '../../context/LanguageContext';

interface Props { chart: KundaliChart }

const PLANETS: Planet[] = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu'];

const PC: Record<string, string> = {
  Sun:'#e07b39', Moon:'#7b9fd4', Mars:'#d94f4f', Mercury:'#4aad78',
  Jupiter:'#c9a227', Venus:'#c060a0', Saturn:'#5577b8', Rahu:'#8f5baa', Ketu:'#7d8a94',
};

// Natural malefics / benefics for quick influence assessment
const NATURAL_MALEFICS = new Set(['Saturn','Mars','Rahu','Ketu','Sun']);
const NATURAL_BENEFICS = new Set(['Jupiter','Venus','Mercury','Moon']);

// ─── Influence badge ──────────────────────────────────────────────────────────

function influenceOf(
  fromPlanet: Planet,
  chart: KundaliChart,
  lang: string = 'en'
): { label: string; color: string; bg: string; border: string; why: string } {
  const analysis = chart.planetAnalysis[fromPlanet];
  const isNatBenefic = NATURAL_BENEFICS.has(fromPlanet);
  const isNatMalefic = NATURAL_MALEFICS.has(fromPlanet);
  const fnRole = analysis?.functionalNature;
  const strength = analysis?.strengthLevel;

  const isMr = lang === 'mr';
  const pName = isMr
    ? (PLANET_LABELS[fromPlanet]?.english ? `${PLANET_LABELS[fromPlanet].english}` : fromPlanet)
    : PLANET_LABELS[fromPlanet].english;

  // Yogakaraka = highly supportive
  if (fnRole === 'Yogakaraka') return {
    label: isMr ? 'अनुकूल' : 'Supportive',
    color: 'var(--semantic-supportive-fg)',
    bg: 'var(--semantic-supportive-bg)',
    border: 'var(--semantic-supportive-border)',
    why: isMr
      ? `${pName} हा तुमच्या लग्नासाठी विशेष शुभ (योगकारक) ग्रह असल्याने त्याची दृष्टी पोषक व लाभदायक ठरते.`
      : `${pName} is a special activating planet (Yogakaraka) for your rising sign and is naturally supportive here.`,
  };
  // Strong natural benefic
  if (isNatBenefic && fnRole === 'Benefic' && strength !== 'Weak') return {
    label: isMr ? 'अनुकूल' : 'Supportive',
    color: 'var(--semantic-supportive-fg)',
    bg: 'var(--semantic-supportive-bg)',
    border: 'var(--semantic-supportive-border)',
    why: isMr
      ? `${pName} हा नैसर्गिक शुभ ग्रह असून लग्नाला अनुकूल असल्याने त्याची दृष्टी रचनात्मक व शुभ मानली जाते.`
      : `${pName} is a natural benefic with a supportive role for your Lagna. Its influence tends to be constructive.`,
  };
  // Weak natural benefic
  if (isNatBenefic && strength === 'Weak') return {
    label: isMr ? 'मिश्र' : 'Mixed',
    color: 'var(--semantic-neutral-fg)',
    bg: 'var(--semantic-neutral-bg)',
    border: 'var(--semantic-neutral-border)',
    why: isMr
      ? `${pName} हा नैसर्गिक शुभ ग्रह असला तरी कुंडलीत काहीसा कमजोर असल्याने दृष्टीचा प्रभाव मध्यम राहतो.`
      : `${pName} is naturally supportive but is somewhat weakened in this chart, making its influence inconsistent.`,
  };
  // Natural malefic, functional benefic
  if (isNatMalefic && fnRole === 'Benefic' && strength === 'Strong') return {
    label: isMr ? 'मिश्र' : 'Mixed',
    color: 'var(--semantic-neutral-fg)',
    bg: 'var(--semantic-neutral-bg)',
    border: 'var(--semantic-neutral-border)',
    why: isMr
      ? `${pName} नैसर्गिक क्रूर ग्रह असला तरी लग्नासाठी शुभकारक असल्याने शिस्त व परिश्रमातून उत्तम फळ देतो.`
      : `${pName} is naturally a challenging planet, but its functional role here is positive. Results are mixed — discipline and pressure can ultimately be productive.`,
  };
  // Functional malefic, afflicted
  if (fnRole === 'Malefic' && analysis?.isAfflicted) return {
    label: isMr ? 'आव्हानात्मक' : 'Challenging',
    color: 'var(--semantic-challenging-fg)',
    bg: 'var(--semantic-challenging-bg)',
    border: 'var(--semantic-challenging-border)',
    why: isMr
      ? `${pName} लग्नासाठी आव्हानात्मक भूमिकेत असून अडचणीत असल्याने संबंधित भावावर ताण निर्माण करू शकतो.`
      : `${pName} plays a challenging functional role for your Lagna and is itself under difficult influences, amplifying its pressure on whatever it aspects.`,
  };
  // Natural malefic, functional malefic
  if (isNatMalefic && fnRole === 'Malefic') return {
    label: isMr ? 'आव्हानात्मक' : 'Challenging',
    color: 'var(--semantic-challenging-fg)',
    bg: 'var(--semantic-challenging-bg)',
    border: 'var(--semantic-challenging-border)',
    why: isMr
      ? `${pName} या पत्रिकेत क्रूर भूमिकेत असल्याने संबंधित भावात विलंब, परीक्षा किंवा कठोर परिश्रम आणू शकतो.`
      : `${pName} is both a natural and functional malefic here. Its aspects tend to create pressure, delays, or tests in the areas it touches.`,
  };
  // Default: mixed
  return {
    label: isMr ? 'मिश्र' : 'Mixed',
    color: 'var(--semantic-neutral-fg)',
    bg: 'var(--semantic-neutral-bg)',
    border: 'var(--semantic-neutral-border)',
    why: isMr
      ? `${pName} ग्रहाचा प्रभाव मिश्र स्वरूपाचा असून इतर ग्रह स्थितीवर अवलंबून राहील.`
      : `${pName}'s influence is mixed — it brings both constructive and challenging qualities depending on how the rest of the chart supports it.`,
  };
}

// ─── House summary line ───────────────────────────────────────────────────────

const HOUSE_THEMES_EN: Record<number, string> = {
  1:'Health & personality', 2:'Wealth & family speech',
  3:'Courage, siblings & short journeys', 4:'Home, mother & emotional security',
  5:'Creativity, children & intelligence', 6:'Health challenges, work & service',
  7:'Relationships & marriage', 8:'Transformation, longevity & hidden matters',
  9:'Luck, higher wisdom & father', 10:'Career & public reputation',
  11:'Income & social gains', 12:'Spiritual growth & foreign connections',
};

const HOUSE_THEMES_MR: Record<number, string> = {
  1:'आरोग्य व व्यक्तिमत्त्व', 2:'संपत्ती, कुटुंब व वाणी',
  3:'धैर्य, भावंडं व पराक्रम', 4:'घर, आई व मानसिक सुख',
  5:'बुद्धिमत्ता, संतती व शिक्षण', 6:'आरोग्य, नोकरी व सेवा',
  7:'विवाह, भागीदारी व नातेसंबंध', 8:'परिवर्तन, गूढ ज्ञान व आयुष्य',
  9:'भाग्य, धर्म व उच्च शिक्षण', 10:'करिअर, प्रतिष्ठा व कार्यक्षेत्र',
  11:'उत्पन्न, लाभ व मित्रपरिवार', 12:'अध्यात्म, खर्च व परदेश गमन',
};

// ─── Single aspect card ───────────────────────────────────────────────────────

function AspectCard({
  aspect, chart, direction,
}: { aspect: AspectRelation; chart: KundaliChart; direction: 'cast' | 'received' }) {
  const { language, t, formatPlanet, formatSign } = useLanguage();
  const [open, setOpen] = useState(false);

  const target = aspect.toHouse;
  const targetPlanet = aspect.toPlanet;
  const targetHouse  = chart.houses[target - 1];
  const targetSign   = targetHouse?.sign ?? '—';
  const inf = influenceOf(aspect.fromPlanet, chart, language);

  // Readable offset label
  const offsetLabels: Record<number,string> = {
    7: language === 'mr' ? '७ वी (समोरासमोर)' : '7th (opposite)',
    4: language === 'mr' ? '४ थी' : '4th',
    8: language === 'mr' ? '८ वी' : '8th',
    5: language === 'mr' ? '५ वी' : '5th',
    9: language === 'mr' ? '९ वी' : '9th',
    3: language === 'mr' ? '३ री' : '3rd',
    10: language === 'mr' ? '१० वी' : '10th',
  };

  const fromLabel  = formatPlanet(aspect.fromPlanet);
  const fromHouse  = aspect.fromHouse;
  const fromSign   = chart.planets[aspect.fromPlanet]?.sign ?? '—';
  const houseTheme = language === 'mr' ? HOUSE_THEMES_MR[target] : HOUSE_THEMES_EN[target];

  return (
    <div className="card card-interactive" style={{
      padding:'1.1rem 1.25rem',
      marginBottom:'0.75rem',
      borderLeft:`4px solid ${inf.color}`,
      background:'var(--surface-raised)',
    }}>
      {/* Visual Relationship Flow */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem', flexWrap:'wrap', marginBottom:'0.65rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' }}>
          {/* From Planet Pill */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.4rem',
            padding:'0.3rem 0.65rem', borderRadius:'var(--radius-sm)',
            background:`${PC[aspect.fromPlanet]}18`, border:`1px solid ${PC[aspect.fromPlanet]}`,
            color:PC[aspect.fromPlanet], fontWeight:700, fontSize:'0.85rem',
          }}>
            <span>{PLANET_LABELS[aspect.fromPlanet]?.symbol}</span>
            <span>{fromLabel}</span>
          </div>

          <span style={{ color:'var(--text-muted)', fontSize:'0.9rem', fontWeight:800 }}>──►</span>

          {/* Target House & Sign Pill */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.4rem',
            padding:'0.3rem 0.65rem', borderRadius:'var(--radius-sm)',
            background:'var(--surface-overlay)', border:'1px solid var(--border-subtle)',
            color:'var(--text-primary)', fontWeight:600, fontSize:'0.85rem',
          }}>
            <span>📍 H{target}</span>
            <span style={{ color:'var(--text-muted)' }}>({formatSign(targetSign)})</span>
          </div>

          {targetPlanet && (
            <>
              <span style={{ color:'var(--text-muted)', fontSize:'0.9rem', fontWeight:800 }}>──►</span>
              {/* Target Planet Pill */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:'0.4rem',
                padding:'0.3rem 0.65rem', borderRadius:'var(--radius-sm)',
                background:`${PC[targetPlanet]}18`, border:`1px solid ${PC[targetPlanet]}`,
                color:PC[targetPlanet], fontWeight:700, fontSize:'0.85rem',
              }}>
                <span>{PLANET_LABELS[targetPlanet]?.symbol}</span>
                <span>{formatPlanet(targetPlanet)}</span>
              </div>
            </>
          )}
        </div>

        {/* Influence badge */}
        <span style={{
          padding:'0.25rem 0.75rem', borderRadius:'var(--radius-xs)', fontSize:'0.75rem', fontWeight:700,
          background: inf.bg, color: inf.color, border:`1px solid ${inf.border}`, flexShrink:0,
        }}>
          {inf.label}
        </span>
      </div>

      {/* House Theme */}
      <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'0.45rem' }}>
        🏛 <b>{language === 'mr' ? 'प्रभावित क्षेत्र: ' : 'Governs: '}</b>{houseTheme ?? `house ${target} themes`}
      </div>

      {/* Why the influence is what it is */}
      <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', lineHeight:1.6, marginTop:'0.25rem' }}>
        {targetPlanet && direction === 'cast'
          ? (language === 'mr'
              ? `${fromLabel} ग्रह या दृष्टीद्वारे ${formatPlanet(targetPlanet)} ग्रहावर थेट प्रभाव टाकतो. `
              : `${fromLabel} directly influences ${formatPlanet(targetPlanet)} through this aspect. `)
          : ''}
        {inf.why}
      </div>

      {/* Technical expandable */}
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-ghost"
        style={{ marginTop:'0.4rem', fontSize:'0.72rem', padding:'0.15rem 0.5rem' }}
      >
        {open ? `▲ ${t('common.hideTechnical')}` : `▼ ${t('common.technicalDetails')}`}
      </button>
      {open && (
        <div style={{
          marginTop:'0.45rem', padding:'0.55rem 0.75rem',
          background:'var(--surface-overlay)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-xs)', fontSize:'0.76rem',
        }}>
          <div className="info-row"><span className="label">{language === 'mr' ? 'दृष्टी नियम' : 'Aspect rule'}</span><span className="value">{aspect.rule}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'दृष्टी टाकणारा ग्रह' : 'From planet'}</span><span className="value">{fromLabel} ({formatSign(fromSign)}, {language === 'mr' ? 'भाव' : 'House'} {fromHouse})</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'दृष्टी अंतर' : 'House offset'}</span><span className="value">{offsetLabels[aspect.houseOffset] ?? aspect.houseOffset + 'th'}</span></div>
          <div className="info-row"><span className="label">{t('common.strength')}</span><span className="value">{aspect.strength}</span></div>
          <div className="info-row"><span className="label">{language === 'mr' ? 'कार्यात्मक स्वभाव' : 'Functional role'}</span><span className="value">{chart.planetAnalysis[aspect.fromPlanet]?.functionalNature ?? '—'}</span></div>
        </div>
      )}
    </div>
  );
}

// ─── Main Explorer ────────────────────────────────────────────────────────────

export default function DrishtiExplorer({ chart }: Props) {
  const { language, formatPlanet, formatSign } = useLanguage();
  const [selected, setSelected] = useState<Planet>('Sun');
  const [view, setView]         = useState<'cast'|'received'>('cast');

  const { aspects, planets } = chart;
  const pos = planets[selected];

  const given    = aspectsGivenBy(selected, aspects);
  const received = aspectsReceivedBy(selected, aspects);

  const displayed = view === 'cast' ? given : received;

  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="card" style={{ marginBottom:'1rem' }}>
        <div className="card-title mb-2">
          🔍 {language === 'mr' ? 'ग्रह दृष्टी विश्लेषण (Drishti Explorer)' : 'Drishti Explorer'}
        </div>
        <p style={{ fontSize:'0.83rem', color:'var(--text-muted)', lineHeight:1.6, margin:0 }}>
          {language === 'mr'
            ? 'ज्योतिषात दृष्टी म्हणजे ग्रहाचा दुसऱ्या भावावर किंवा ग्रहावर पडणारा प्रभाव. कोणत्याही ग्रहाची दृष्टी पाहण्यासाठी खालील ग्रह निवडा.'
            : 'Drishti means "gaze" or "aspect" — a planet\'s influence on a house or another planet. Select any planet to see what it influences, and what influences it. No astrology knowledge needed.'}
        </p>
      </div>

      {/* View toggle */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:'0.82rem', color:'var(--text-muted)', fontWeight:500 }}>
          {language === 'mr' ? 'पाहण्यासाठी निवडा:' : 'I want to see:'}
        </span>
        <button
          className={`btn ${view === 'cast' ? 'btn-secondary' : 'btn-ghost'}`}
          style={{ fontSize:'0.82rem' }}
          onClick={() => setView('cast')}
        >
          👁 {language === 'mr' ? 'ग्रहाने दिलेली दृष्टी (CAST)' : 'Drishti CAST by a planet'}
        </button>
        <button
          className={`btn ${view === 'received' ? 'btn-secondary' : 'btn-ghost'}`}
          style={{ fontSize:'0.82rem' }}
          onClick={() => setView('received')}
        >
          📥 {language === 'mr' ? 'ग्रहावर पडलेली दृष्टी (RECEIVED)' : 'Drishti RECEIVED by a planet'}
        </button>
      </div>

      {/* Planet selector */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1.25rem' }}>
        {PLANETS.map(p => {
          const meta = PLANET_LABELS[p];
          const pPos = planets[p];
          const isSelected = p === selected;
          return (
            <button
              key={p}
              onClick={() => setSelected(p)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                gap:'0.2rem', padding:'0.55rem 0.85rem', borderRadius:'var(--radius-sm)',
                background: isSelected ? `${PC[p]}22` : 'var(--surface-overlay)',
                border:`2px solid ${isSelected ? PC[p] : 'var(--border-subtle)'}`,
                cursor:'pointer', transition:'all 0.15s', minWidth:72,
              }}
            >
              <span style={{ fontSize:'1.3rem', lineHeight:1 }}>{meta.symbol}</span>
              <span style={{ fontSize:'0.75rem', fontWeight:600, color: isSelected ? PC[p] : 'var(--text-secondary)' }}>
                {formatPlanet(p)}
              </span>
              <span style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>
                {language === 'mr' ? `भा${pPos.house}` : `H${pPos.house}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected planet summary */}
      <div style={{
        padding:'0.9rem 1.1rem', borderRadius:'var(--radius-md)',
        background:`${PC[selected]}11`, border:`1.5px solid ${PC[selected]}44`,
        marginBottom:'1.1rem',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
          <span style={{ fontSize:'1.8rem' }}>{PLANET_LABELS[selected].symbol}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:'1rem', color: PC[selected] }}>
              {formatPlanet(selected)} <span style={{ fontSize:'0.82rem', fontWeight:500, color:'var(--text-muted)' }}>({PLANET_LABELS[selected].english})</span>
            </div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'0.15rem' }}>
              {language === 'mr'
                ? `भाव ${pos.house} (${formatSign(pos.sign)}) मध्ये स्थित · ${pos.nakshatra.name} चरण ${pos.nakshatraPosition.pada}`
                : `Sitting in House ${pos.house} (${pos.sign}) · ${pos.nakshatra.name} Pada ${pos.nakshatraPosition.pada}`}
              {pos.isRetrograde && <span className="badge badge-violet" style={{ marginLeft:'0.5rem', fontSize:'0.7rem' }}>℞ {language === 'mr' ? 'वक्री' : 'Retro'}</span>}
              {pos.isCombust    && <span className="badge badge-crimson" style={{ marginLeft:'0.4rem', fontSize:'0.7rem' }}>☄ {language === 'mr' ? 'अस्त' : 'Combust'}</span>}
            </div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:'0.5rem' }}>
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
              {language === 'mr' ? 'दृष्टी टाकतो: ' : 'Casts '}
              <b style={{ color:'var(--text-primary)' }}>{given.length}</b>
              {language === 'mr' ? ' भावांवर' : ' aspects'}
            </span>
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
              {language === 'mr' ? 'दृष्टी घेतो: ' : 'Receives '}
              <b style={{ color:'var(--text-primary)' }}>{received.length}</b>
              {language === 'mr' ? ' ग्रहांची' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div style={{
          fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)',
          marginBottom:'0.75rem', paddingBottom:'0.5rem',
          borderBottom:'1px solid var(--border-subtle)',
          display:'flex', alignItems:'center', gap:'0.5rem',
        }}>
          {view === 'cast'
            ? (language === 'mr'
                ? <>👁 {formatPlanet(selected)} ची दृष्टी कुठे पडते? ({given.length} दृष्टी)</>
                : <>👁 Where is {formatPlanet(selected)} looking? ({given.length} aspect{given.length !== 1 ? 's' : ''})</>)
            : (language === 'mr'
                ? <>📥 {formatPlanet(selected)} वर कोणाची दृष्टी पडते? ({received.length} ग्रह)</>
                : <>📥 Who aspects {formatPlanet(selected)}? ({received.length} planet{received.length !== 1 ? 's' : ''})</>)
          }
        </div>

        {displayed.length === 0 && (
          <div className="card" style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'0.88rem' }}>
            {view === 'cast'
              ? (language === 'mr'
                  ? `${formatPlanet(selected)} ची कोणतीही विशेष दृष्टी नाही.`
                  : `${formatPlanet(selected)} casts no tracked aspects in the current configuration.`)
              : (language === 'mr'
                  ? `या पत्रिकेत कोणत्याही ग्रहाची दृष्टी ${formatPlanet(selected)} वर पडत नाही.`
                  : `No planets are aspecting ${formatPlanet(selected)} in this chart.`)
            }
          </div>
        )}

        {displayed.map((asp, i) => (
          <AspectCard key={i} aspect={asp} chart={chart} direction={view} />
        ))}
      </div>

      {/* Advanced: matrix link */}
      <details style={{ marginTop:'1.5rem' }}>
        <summary style={{ cursor:'pointer', fontSize:'0.8rem', color:'var(--text-muted)', padding:'0.4rem 0' }}>
          ▶ {language === 'mr' ? 'प्रगत दृश्य — संपूर्ण दृष्टी तक्ता (Drishti Matrix)' : 'Advanced View — Full Drishti Matrix'}
        </summary>
        <MatrixView chart={chart} />
      </details>
    </div>
  );
}

// ─── Preserved matrix (collapsed under Advanced) ──────────────────────────────

function MatrixView({ chart }: { chart: KundaliChart }) {
  const { language, formatPlanet } = useLanguage();
  const { aspects, planets } = chart;
  const aspectMap: Record<string, Record<number, { strength: string; rule: string }>> = {};
  for (const a of aspects) {
    if (!aspectMap[a.fromPlanet]) aspectMap[a.fromPlanet] = {};
    aspectMap[a.fromPlanet][a.toHouse] = { strength: a.strength, rule: a.rule };
  }

  return (
    <div className="card" style={{ marginTop:'0.75rem', overflowX:'auto' }}>
      <div className="card-title mb-2" style={{ fontSize:'0.85rem' }}>
        {language === 'mr'
          ? 'ग्रह दृष्टी तक्ता — आडवी ओळ: दृष्टी टाकणारा ग्रह, उभी ओळ: ज्या भावावर दृष्टी पडते'
          : 'Graha Drishti Matrix — Row casts, Column receives'}
      </div>
      <table className="data-table" style={{ fontSize:'0.7rem' }}>
        <thead>
          <tr>
            <th>{language === 'mr' ? 'ग्रह' : 'Planet'}</th>
            {Array.from({ length:12 }, (_,i) => <th key={i} style={{ textAlign:'center', padding:'0.3rem' }}>{language === 'mr' ? `भा${i+1}` : `H${i+1}`}</th>)}
          </tr>
        </thead>
        <tbody>
          {PLANETS.map(p => (
            <tr key={p}>
              <td style={{ color: PC[p], fontWeight:700 }}>
                {PLANET_LABELS[p].symbol} {formatPlanet(p).substring(0,4)}
              </td>
              {Array.from({ length:12 }, (_,i) => {
                const h = i+1;
                const isOwn = planets[p].house === h;
                const asp = aspectMap[p]?.[h];
                return (
                  <td key={h} style={{ textAlign:'center', padding:'0.25rem' }}>
                    {isOwn ? <span style={{ color:PC[p] }}>⬤</span>
                    : asp   ? <span className={`aspect-cell ${asp.strength === 'Full' ? 'aspect-full' : 'aspect-partial'}`}>●</span>
                    : <span style={{ opacity:0.1 }}>·</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
