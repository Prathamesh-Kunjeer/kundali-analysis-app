import React from 'react';
import { FullKundaliAnalysis } from '../../types/astrology';
import { NorthIndianChart } from '../charts/NorthIndianChart';
import { PLANETS_DATA } from '../../data/constants';
import { 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Compass, 
  Gem, 
  Calendar, 
  Sun, 
  Moon, 
  Flame,
  Award
} from 'lucide-react';

interface OverviewTabProps {
  data: FullKundaliAnalysis;
  onNavigateTab: (tabId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, onNavigateTab }) => {
  const moon = data.planets.find(p => p.name === 'Moon') || data.planets[0];
  const sun = data.planets.find(p => p.name === 'Sun') || data.planets[0];
  const currentMaha = data.dasha.currentMahadasha;
  const currentAntar = data.dasha.currentAntardasha;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Cosmic Summary Card */}
      <div
        className="glass-card-gold"
        style={{
          padding: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-gold">Vedic Birth Chart</span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Lahiri Ayanamsha: {data.formattedAyanamsa}
            </span>
          </div>

          <h1 className="text-gold-gradient" style={{ fontSize: '2.1rem', marginBottom: '6px' }}>
            {data.birthDetails.name}
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '16px' }}>
            Born on <strong>{data.birthDetails.dob}</strong> at <strong>{data.birthDetails.tob}</strong> in <strong>{data.birthDetails.cityName}, {data.birthDetails.country}</strong>
          </p>

          {/* Core Trinity: Lagna, Moon, Sun */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: 'rgba(9, 14, 33, 0.8)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
              <div style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase' }}>
                Ascendant (Lagna)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
                {data.ascendant.rashi}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Lord: {data.ascendant.rashiLord}
              </div>
            </div>

            <div style={{ background: 'rgba(9, 14, 33, 0.8)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
              <div style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase' }}>
                Moon Sign (Rashi)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
                {moon.rashi}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Nak: {moon.nakshatra} (P{moon.pada})
              </div>
            </div>

            <div style={{ background: 'rgba(9, 14, 33, 0.8)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.25)' }}>
              <div style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: '700', textTransform: 'uppercase' }}>
                Sun Sign (Surya)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
                {sun.rashi}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                House {sun.house}
              </div>
            </div>
          </div>
        </div>

        {/* Quick North Indian Chart Visualizer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <NorthIndianChart chart={data.divisionalCharts.D1} />
          <button
            onClick={() => onNavigateTab('charts')}
            className="btn-ghost"
            style={{ fontSize: '0.82rem', marginTop: '8px', color: '#d4af37' }}
          >
            Open Interactive Divisional Charts (D1-D12) →
          </button>
        </div>
      </div>

      {/* Key Astrological Pillars Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Active Dasha */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Clock size={18} color="#d4af37" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f3e5ab' }}>Running Dasha</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
            {currentMaha?.planet} - {currentAntar?.planet}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
            Mahadasha active until {currentMaha?.endDate}
          </div>
        </div>

        {/* Manglik Status */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Flame size={18} color={data.manglik.isManglik ? '#ef4444' : '#10b981'} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f3e5ab' }}>Manglik Dosha</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: data.manglik.isManglik ? '#fca5a5' : '#6ee7b7' }}>
            {data.manglik.isCancelled ? 'Neutralized (Cancelled)' : data.manglik.isManglik ? `${data.manglik.level} (${data.manglik.percentage}%)` : 'Non-Manglik'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
            Mars located in House {data.manglik.marsHouseFromLagna}
          </div>
        </div>

        {/* Sade Sati Status */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Activity size={18} color="#8b5cf6" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f3e5ab' }}>Shani Sade Sati</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
            {data.sadeSati.isInSadeSati ? data.sadeSati.phase : 'Not in Sade Sati'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
            Saturn in {data.sadeSati.saturnCurrentRashi} (Moon in {data.sadeSati.moonRashi})
          </div>
        </div>

        {/* Active Yogas Count */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Award size={18} color="#f59e0b" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f3e5ab' }}>Vedic Yogas</span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff' }}>
            {data.yogas.length} Yogas Detected
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
            {data.yogas.slice(0, 2).map(y => y.name).join(', ')}...
          </div>
        </div>
      </div>

      {/* Personality & Auspicious Factors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Core Personality Profile */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="text-gold-gradient" style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} /> Vedic Personality Profile
          </h3>

          <p style={{ fontSize: '0.9rem', lineHeight: '1.7', color: '#cbd5e1', marginBottom: '16px' }}>
            {data.personalityProfile.coreTraits}
          </p>

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#10b981', marginBottom: '6px' }}>
              Key Strengths:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.personalityProfile.strengths.map((s, idx) => (
                <span key={idx} className="badge-emerald">{s}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f59e0b', marginBottom: '6px' }}>
              Growth Opportunities:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.personalityProfile.weaknesses.map((w, idx) => (
                <span key={idx} className="badge-gold">{w}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Auspicious Factors */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 className="text-gold-gradient" style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gem size={18} /> Auspicious & Lucky Factors
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(9, 14, 33, 0.6)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Lucky Numbers</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
                {data.luckyFactors.luckyNumbers.join(', ')}
              </div>
            </div>

            <div style={{ background: 'rgba(9, 14, 33, 0.6)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Lucky Days</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
                {data.luckyFactors.luckyDays.join(', ')}
              </div>
            </div>

            <div style={{ background: 'rgba(9, 14, 33, 0.6)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Lucky Colors</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
                {data.luckyFactors.luckyColors.join(', ')}
              </div>
            </div>

            <div style={{ background: 'rgba(9, 14, 33, 0.6)', padding: '10px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Lucky Directions</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc' }}>
                {data.luckyFactors.luckyDirections.join(', ')}
              </div>
            </div>
          </div>

          {/* Primary Gemstone Recommendation Shortcut */}
          {data.gemstones[0] && (
            <div
              onClick={() => onNavigateTab('remedies')}
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(15, 22, 45, 0.8) 100%)',
                border: '1px solid var(--border-gold)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: '700' }}>
                  Recommended Life Stone ({data.gemstones[0].type})
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                  {data.gemstones[0].name} ({data.gemstones[0].hindiName})
                </div>
              </div>
              <span className="btn-outline-gold" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                View All Remedies →
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
