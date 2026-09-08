import React from 'react';
import { FullKundaliAnalysis } from '../../types/astrology';
import { Briefcase, Coins, Heart, Activity, Sparkles, Feather } from 'lucide-react';

interface PredictionsTabProps {
  data: FullKundaliAnalysis;
}

export const PredictionsTab: React.FC<PredictionsTabProps> = ({ data }) => {
  const sections = [
    {
      id: 'career',
      title: 'Career & Professional Karma',
      sanskritTitle: 'कर्म एवं व्यवसाय',
      icon: <Briefcase size={22} color="#f59e0b" />,
      content: data.predictions.career,
      housesInvolved: 'House 10 (Career), House 6 (Service), House 1 (Identity)'
    },
    {
      id: 'wealth',
      title: 'Wealth & Financial Growth',
      sanskritTitle: 'धन एवं समृद्धि',
      icon: <Coins size={22} color="#10b981" />,
      content: data.predictions.wealth,
      housesInvolved: 'House 2 (Treasury), House 11 (Gains), House 9 (Fortune)'
    },
    {
      id: 'marriage',
      title: 'Love, Marriage & Relationships',
      sanskritTitle: 'विवाह एवं दाम्पत्य जीवन',
      icon: <Heart size={22} color="#ec4899" />,
      content: data.predictions.loveAndMarriage,
      housesInvolved: 'House 7 (Spouse), House 5 (Romance), D9 Navamsha Chart'
    },
    {
      id: 'health',
      title: 'Health, Constitution & Vitality',
      sanskritTitle: 'स्वास्थ्य एवं दीर्घायु',
      icon: <Activity size={22} color="#3b82f6" />,
      content: data.predictions.health,
      housesInvolved: 'House 1 (Physical Body), House 6 (Immunity), House 8 (Longevity)'
    },
    {
      id: 'spirituality',
      title: 'Spiritual Path & Higher Wisdom',
      sanskritTitle: 'धर्म एवं आध्यात्मिक उन्नति',
      icon: <Sparkles size={22} color="#8b5cf6" />,
      content: data.predictions.spirituality,
      housesInvolved: 'House 9 (Dharma), House 12 (Moksha), Ketu & Jupiter'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card-gold" style={{ padding: '24px' }}>
        <h2 className="text-gold-gradient" style={{ fontSize: '1.45rem', marginBottom: '6px' }}>
          Vedic Horoscope Predictions & Life Forecast
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
          Comprehensive synthesis of Bhava Lords, planetary aspects, sign modalities, and Divisional D9 alignments
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {sections.map((sec) => (
          <div key={sec.id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {sec.icon}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.18rem', color: '#ffffff', fontWeight: '800' }}>
                    {sec.title}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#d4af37', fontWeight: '600' }}>
                    {sec.sanskritTitle}
                  </span>
                </div>
              </div>

              <span className="badge-gold" style={{ fontSize: '0.72rem' }}>
                {sec.housesInvolved}
              </span>
            </div>

            <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: '1.8', background: 'rgba(9, 14, 33, 0.5)', padding: '16px 20px', borderRadius: '12px', borderLeft: '3px solid var(--gold-primary)' }}>
              {sec.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
