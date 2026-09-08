import React from 'react';
import { FullKundaliAnalysis } from '../../types/astrology';
import { GocharTransitChart } from '../charts/GocharTransitChart';
import { Sun, Moon, Calendar, Clock, Compass, ShieldAlert, Sparkles } from 'lucide-react';

interface PanchangTabProps {
  data: FullKundaliAnalysis;
}

export const PanchangTab: React.FC<PanchangTabProps> = ({ data }) => {
  const { panchang } = data;

  const panchangItems = [
    { label: 'Tithi (Lunar Day)', value: panchang.tithi.name, sub: `Number ${panchang.tithi.number} (${panchang.tithi.paksha} Paksha)`, icon: <Moon size={18} color="#cbd5e1" /> },
    { label: 'Vaar (Day of Week)', value: panchang.vaar.name, sub: `Ruling Lord: ${panchang.vaar.lord}`, icon: <Calendar size={18} color="#d4af37" /> },
    { label: 'Nakshatra (Lunar Mansion)', value: panchang.nakshatra.name, sub: `Lord: ${panchang.nakshatra.lord} (Pada ${panchang.nakshatra.pada})`, icon: <Sparkles size={18} color="#f59e0b" /> },
    { label: 'Yoga (Solar-Lunar Angular sum)', value: panchang.yoga.name, sub: panchang.yoga.isAuspicious ? 'Auspicious Yoga' : 'Inauspicious Period', icon: <Compass size={18} color="#10b981" /> },
    { label: 'Karana (Half Tithi)', value: panchang.karana.name, sub: `Karana #${panchang.karana.number}`, icon: <Clock size={18} color="#3b82f6" /> },
    { label: 'Sun Sign / Moon Sign', value: `${panchang.sunSign} / ${panchang.moonSign}`, sub: 'Sidereal Zodiac', icon: <Sun size={18} color="#ef4444" /> }
  ];

  const muhuratItems = [
    { label: 'Abhijit Muhurat (Most Auspicious)', value: panchang.abhijitMuhurat, isGood: true },
    { label: 'Rahu Kaalam (Inauspicious Window)', value: panchang.rahuKaal, isGood: false },
    { label: 'Gulika Kaalam', value: panchang.gulikaKaal, isGood: true },
    { label: 'Yamaganda Kaalam', value: panchang.yamaganda, isGood: false }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Panchang Overview Card */}
      <div className="glass-card-gold" style={{ padding: '26px' }}>
        <h2 className="text-gold-gradient" style={{ fontSize: '1.45rem', marginBottom: '6px' }}>
          Vedic Panchang & Muhurat (पञ्चाङ्ग एवं मुहूर्त)
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
          Calculated under Sidereal Lahiri Ayanamsha ({panchang.ayanamsha}) for {data.birthDetails.cityName}
        </p>

        {/* 6 Panchang Limbs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '20px' }}>
          {panchangItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(9, 14, 33, 0.75)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{ marginTop: '2px' }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: '2px 0' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#f3e5ab' }}>
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Muhurats & Kaalam Windows */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#f3e5ab', marginBottom: '16px' }}>
          Auspicious & Inauspicious Muhurat Windows (शुभ-अशुभ समय)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {muhuratItems.map((m, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(9, 14, 33, 0.65)',
                border: `1px solid ${m.isGood ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '12px',
                padding: '14px 18px'
              }}
            >
              <span className={m.isGood ? 'badge-emerald' : 'badge-ruby'} style={{ fontSize: '0.72rem', marginBottom: '6px' }}>
                {m.isGood ? 'Auspicious' : 'Avoid Major Ventures'}
              </span>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '600', marginTop: '4px' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Gochar (Transit) Chart */}
      <GocharTransitChart
        natalPlanets={data.planets}
        natalAscendant={data.ascendant}
      />
    </div>
  );
};
