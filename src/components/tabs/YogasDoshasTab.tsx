import React, { useState } from 'react';
import { FullKundaliAnalysis } from '../../types/astrology';
import { Award, Flame, AlertTriangle, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface YogasDoshasTabProps {
  data: FullKundaliAnalysis;
}

export const YogasDoshasTab: React.FC<YogasDoshasTabProps> = ({ data }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'Raja Yoga', 'Dhana Yoga', 'Mahapurusha Yoga', 'Auspicious Yoga', 'Inauspicious Yoga'];

  const filteredYogas = filterCategory === 'all'
    ? data.yogas
    : data.yogas.filter(y => y.category === filterCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Three Major Doshas Status Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Manglik Dosha Card */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color={data.manglik.isManglik ? '#ef4444' : '#10b981'} />
              <h3 style={{ fontSize: '1.15rem', color: '#f3e5ab' }}>Manglik (Kuja) Dosha</h3>
            </div>
            <span className={data.manglik.isCancelled ? 'badge-gold' : data.manglik.isManglik ? 'badge-ruby' : 'badge-emerald'}>
              {data.manglik.isCancelled ? 'Cancelled' : data.manglik.isManglik ? `${data.manglik.level} (${data.manglik.percentage}%)` : 'Non-Manglik'}
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '14px' }}>
            {data.manglik.description}
          </p>

          {data.manglik.cancellations.length > 0 && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6ee7b7', marginBottom: '4px' }}>
                ✓ Vedic Cancellations Detected:
              </div>
              <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                {data.manglik.cancellations.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {data.manglik.remedies.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              <strong style={{ color: '#d4af37' }}>Key Remedy: </strong>
              {data.manglik.remedies[0]}
            </div>
          )}
        </div>

        {/* Kaal Sarp Dosha Card */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color={data.kaalSarp.hasKaalSarp ? '#f59e0b' : '#10b981'} />
              <h3 style={{ fontSize: '1.15rem', color: '#f3e5ab' }}>Kaal Sarp Dosha</h3>
            </div>
            <span className={data.kaalSarp.hasKaalSarp ? 'badge-gold' : 'badge-emerald'}>
              {data.kaalSarp.hasKaalSarp ? 'Present' : 'Not Present'}
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '14px' }}>
            {data.kaalSarp.description}
          </p>

          {data.kaalSarp.hasKaalSarp && data.kaalSarp.remedies.length > 0 && (
            <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--border-gold)', borderRadius: '10px', padding: '10px 14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f3e5ab', marginBottom: '4px' }}>
                Recommended Upay:
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                {data.kaalSarp.remedies[0]}
              </p>
            </div>
          )}
        </div>

        {/* Shani Sade Sati Tracker */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.15rem', color: '#f3e5ab' }}>Shani Sade Sati / Dhaiya</h3>
            </div>
            <span className={data.sadeSati.isInSadeSati ? 'badge-ruby' : 'badge-sapphire'}>
              {data.sadeSati.phase}
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '14px' }}>
            {data.sadeSati.effects}
          </p>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            <strong style={{ color: '#d4af37' }}>Saturn Remedy: </strong>
            {data.sadeSati.remedies[0]}
          </div>
        </div>
      </div>

      {/* Vedic Yogas Directory */}
      <div className="glass-card-gold" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
          <div>
            <h2 className="text-gold-gradient" style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
              Active Vedic Yogas ({filteredYogas.length} Formations)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Special planetary combinations from classical Brihat Parashara Hora Shastra
            </p>
          </div>

          {/* Category Filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={filterCategory === cat ? 'btn-gold' : 'btn-outline-gold'}
                style={{ fontSize: '0.78rem', padding: '5px 12px', textTransform: 'capitalize' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredYogas.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
            No yogas found for the selected category.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredYogas.map((yoga) => (
              <div
                key={yoga.id}
                style={{
                  background: 'rgba(9, 14, 33, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                        {yoga.name}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: '#d4af37', fontWeight: '600' }}>
                        {yoga.sanskritName}
                      </div>
                    </div>

                    <span
                      className={
                        yoga.strength === 'Exceptional'
                          ? 'badge-gold'
                          : yoga.isAuspicious
                          ? 'badge-emerald'
                          : 'badge-ruby'
                      }
                    >
                      {yoga.strength}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px' }}>
                    {yoga.description}
                  </p>

                  <div style={{ background: 'rgba(212, 175, 55, 0.08)', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#f3e5ab', marginBottom: '2px' }}>
                      Manifestation & Effects:
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                      {yoga.effects}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                  <span>Grahas: <strong>{yoga.planetsInvolved.join(', ')}</strong></span>
                  <span>Category: <strong>{yoga.category}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
