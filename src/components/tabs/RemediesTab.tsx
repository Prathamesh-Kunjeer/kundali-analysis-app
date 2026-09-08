import React from 'react';
import { FullKundaliAnalysis } from '../../types/astrology';
import { Gem, ShieldCheck, Sparkles, HeartHandshake, BookOpen, AlertCircle } from 'lucide-react';

interface RemediesTabProps {
  data: FullKundaliAnalysis;
}

export const RemediesTab: React.FC<RemediesTabProps> = ({ data }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div className="glass-card-gold" style={{ padding: '24px' }}>
        <h2 className="text-gold-gradient" style={{ fontSize: '1.45rem', marginBottom: '6px' }}>
          Vedic Remedies, Gemstones & Upays (ज्योतिषीय उपाय एवं रत्न)
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
          Classical remedial measures based on your Lagna Lord (Life Stone), 5th Lord (Lucky Stone), and 9th Lord (Fortune Stone)
        </p>
      </div>

      {/* Gemstone Recommendations Cards */}
      <div>
        <h3 style={{ fontSize: '1.2rem', color: '#f3e5ab', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gem size={20} color="#d4af37" /> Personalized Gemstone Prescription (रत्न परामर्श)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {data.gemstones.map((gem) => (
            <div
              key={gem.type}
              className="glass-card"
              style={{
                padding: '24px',
                borderTop: `4px solid ${gem.colorHex}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <span className="badge-gold" style={{ fontSize: '0.74rem', marginBottom: '4px' }}>
                      {gem.type}
                    </span>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>
                      {gem.name}
                    </h4>
                    <span style={{ fontSize: '0.9rem', color: '#d4af37', fontWeight: '700' }}>
                      {gem.hindiName} ({gem.planet} Lord)
                    </span>
                  </div>

                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: `${gem.colorHex}22`,
                      border: `2px solid ${gem.colorHex}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: gem.colorHex
                    }}
                  >
                    <Gem size={20} />
                  </div>
                </div>

                {/* Specs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '14px 0', background: 'rgba(9, 14, 33, 0.6)', padding: '12px', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Auspicious Metal</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#f8fafc' }}>{gem.metal}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Finger to Wear</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#f8fafc' }}>{gem.finger}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Auspicious Day</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#f8fafc' }}>{gem.auspiciousDay}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Purification Time</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#f8fafc' }}>Shukla Paksha Dawn</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '12px' }}>
                  <strong style={{ color: '#f3e5ab' }}>Benefits: </strong>
                  {gem.benefits}
                </div>

                <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: '700', marginBottom: '2px' }}>
                    Consecration Beej Mantra:
                  </div>
                  <div style={{ fontSize: '0.82rem', fontFamily: 'serif', color: '#ffffff', fontStyle: 'italic' }}>
                    "{gem.mantra}" (108 times)
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.76rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                ⚠️ <em>{gem.cautions}</em>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rudraksha, Mantras & Lifestyle Remedies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {data.remedies.map((rem, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className={rem.category === 'Rudraksha' ? 'badge-ruby' : rem.category === 'Mantra' ? 'badge-gold' : 'badge-emerald'}>
                {rem.category}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: '600' }}>
                For {rem.targetPlanet}
              </span>
            </div>

            <h4 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: '700', marginBottom: '8px' }}>
              {rem.title}
            </h4>

            <div style={{ background: 'rgba(9, 14, 33, 0.6)', padding: '12px', borderRadius: '10px', marginBottom: '10px', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              <strong style={{ color: '#f3e5ab' }}>Method: </strong>
              {rem.instructions}
            </div>

            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              <strong style={{ color: '#10b981' }}>Benefits: </strong>
              {rem.benefits}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
