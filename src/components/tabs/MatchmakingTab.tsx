import React, { useState } from 'react';
import { FullKundaliAnalysis, BirthDetails, KundaliMilanResult } from '../../types/astrology';
import { calculateKundaliMilan } from '../../engine/matchmaking';
import { calculateFullKundali } from '../../engine/calculator';
import { Heart, Users, CheckCircle2, AlertTriangle, Sparkles, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchmakingTabProps {
  currentKundali: FullKundaliAnalysis;
}

export const MatchmakingTab: React.FC<MatchmakingTabProps> = ({ currentKundali }) => {
  // Default Partner birth details
  const [partnerDetails, setPartnerDetails] = useState<BirthDetails>({
    name: 'Priya Verma',
    gender: 'female',
    dob: '1999-04-20',
    tob: '14:30',
    cityName: 'Mumbai',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 5.5
  });

  const [partnerKundali, setPartnerKundali] = useState<FullKundaliAnalysis | null>(() => {
    try {
      return calculateFullKundali({
        name: 'Priya Verma',
        gender: 'female',
        dob: '1999-04-20',
        tob: '14:30',
        cityName: 'Mumbai',
        country: 'India',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 5.5
      });
    } catch (e) {
      return null;
    }
  });

  // Calculate Matchmaking Result
  const boyKundali = currentKundali.birthDetails.gender === 'male' ? currentKundali : (partnerKundali || currentKundali);
  const girlKundali = currentKundali.birthDetails.gender === 'female' ? currentKundali : (partnerKundali || currentKundali);

  const matchResult: KundaliMilanResult = calculateKundaliMilan(
    boyKundali.planets,
    girlKundali.planets
  );

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const computed = calculateFullKundali(partnerDetails);
    setPartnerKundali(computed);
    if (matchResult.totalScore >= 24) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header & Verdict Banner */}
      <div className="glass-card-gold" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div>
            <span className="badge-gold">Ashtakoota 36 Guna Milan</span>
            <h2 className="text-gold-gradient" style={{ fontSize: '1.8rem', marginTop: '6px', marginBottom: '4px' }}>
              {boyKundali.birthDetails.name} & {girlKundali.birthDetails.name}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
              Vedic Horoscope Compatibility & Marital Harmony Analysis
            </p>
          </div>

          {/* Big Score Circle */}
          <div
            style={{
              padding: '16px 28px',
              borderRadius: '20px',
              background: 'rgba(9, 14, 33, 0.85)',
              border: '2px solid var(--border-gold-bright)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-gold)'
            }}
          >
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: matchResult.totalScore >= 18 ? '#d4af37' : '#ef4444', lineHeight: 1 }}>
              {matchResult.totalScore} <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/ 36</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: matchResult.totalScore >= 24 ? '#10b981' : matchResult.totalScore >= 18 ? '#f59e0b' : '#ef4444', marginTop: '4px' }}>
              {matchResult.compatibilityVerdict} ({matchResult.percentage}%)
            </div>
          </div>
        </div>

        {/* Verdict Callout */}
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--border-gold)', borderRadius: '12px', padding: '14px 18px' }}>
          <strong style={{ color: '#f3e5ab' }}>Astrological Recommendation: </strong>
          <span style={{ color: '#ffffff', fontSize: '0.92rem' }}>{matchResult.recommendation}</span>
        </div>
      </div>

      {/* Partner Birth Details Drawer/Form */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#f3e5ab', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} /> Partner (2nd Chart) Birth Details
        </h3>

        <form onSubmit={handleRecalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Partner Name</label>
              <input
                type="text"
                required
                className="input-cosmic"
                value={partnerDetails.name}
                onChange={(e) => setPartnerDetails({ ...partnerDetails, name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
              <input
                type="date"
                required
                className="input-cosmic"
                value={partnerDetails.dob}
                onChange={(e) => setPartnerDetails({ ...partnerDetails, dob: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Time of Birth (24h)</label>
              <input
                type="time"
                required
                className="input-cosmic"
                value={partnerDetails.tob}
                onChange={(e) => setPartnerDetails({ ...partnerDetails, tob: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Birth Place (City)</label>
              <input
                type="text"
                required
                className="input-cosmic"
                value={partnerDetails.cityName}
                onChange={(e) => setPartnerDetails({ ...partnerDetails, cityName: e.target.value })}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <button type="submit" className="btn-gold" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              <Scale size={16} /> Recalculate 36 Guna Milan
            </button>
          </div>
        </form>
      </div>

      {/* Detailed Ashtakoota 8-Guna Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#f3e5ab', marginBottom: '16px' }}>
          Ashtakoota 8 Gunas Point Breakdown
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(212, 175, 55, 0.4)', color: '#d4af37' }}>
                <th style={{ padding: '12px' }}>Koota Name</th>
                <th style={{ padding: '12px' }}>Max Pts</th>
                <th style={{ padding: '12px' }}>Obtained</th>
                <th style={{ padding: '12px' }}>Boy's Attribute</th>
                <th style={{ padding: '12px' }}>Girl's Attribute</th>
                <th style={{ padding: '12px' }}>Significance</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {matchResult.gunas.map((g) => (
                <tr key={g.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#ffffff' }}>
                    {g.name} ({g.sanskritName})
                  </td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>
                    {g.maxPoints}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '800', color: g.obtainedPoints === g.maxPoints ? '#10b981' : g.obtainedPoints === 0 ? '#ef4444' : '#f59e0b' }}>
                    {g.obtainedPoints}
                  </td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>
                    {g.boyAttribute}
                  </td>
                  <td style={{ padding: '12px', color: '#cbd5e1' }}>
                    {g.girlAttribute}
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.82rem', color: '#94a3b8' }}>
                    {g.description}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      className={
                        g.status === 'Excellent'
                          ? 'badge-emerald'
                          : g.status === 'Good'
                          ? 'badge-gold'
                          : g.status === 'Dosha'
                          ? 'badge-ruby'
                          : 'badge-sapphire'
                      }
                    >
                      {g.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Dosha Checks: Nadi, Bhakoot, Manglik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Nadi Dosha */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700' }}>Nadi Dosha Check</h4>
            <span className={!matchResult.nadiDosha || matchResult.nadiDoshaCancelled ? 'badge-emerald' : 'badge-ruby'}>
              {!matchResult.nadiDosha ? 'Clear (No Dosha)' : matchResult.nadiDoshaCancelled ? 'Cancelled' : 'Dosha Present'}
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {matchResult.nadiDoshaCancelled
              ? 'Nadi Dosha is cancelled because Nakshatras / Padas are distinct between partners.'
              : !matchResult.nadiDosha
              ? 'Both partners belong to different Nadis, ensuring supreme physiological and progeny vitality.'
              : 'Same Nadi detected. Classical Nadi Shanti ritual or Mahamrityunjaya Puja recommended.'}
          </p>
        </div>

        {/* Bhakoot Dosha */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700' }}>Bhakoot Dosha Check</h4>
            <span className={!matchResult.bhakootDosha || matchResult.bhakootDoshaCancelled ? 'badge-emerald' : 'badge-ruby'}>
              {!matchResult.bhakootDosha ? 'Clear' : matchResult.bhakootDoshaCancelled ? 'Cancelled' : 'Dosha Present'}
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {matchResult.bhakootDoshaCancelled
              ? 'Bhakoot Dosha is neutralized due to friendly relationship between Moon sign rulers.'
              : !matchResult.bhakootDosha
              ? 'Moon sign placements are in harmonious mutual angles.'
              : 'Bhakoot distance requires conscious financial budgeting and shared patience.'}
          </p>
        </div>

        {/* Manglik Comparison */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700' }}>Manglik Matching</h4>
            <span className="badge-gold">Mars Status</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            Boy: <strong>{matchResult.boyManglik.isCancelled ? 'Cancelled Manglik' : matchResult.boyManglik.isManglik ? 'Manglik' : 'Non-Manglik'}</strong> (H{matchResult.boyManglik.marsHouseFromLagna})
            <br />
            Girl: <strong>{matchResult.girlManglik.isCancelled ? 'Cancelled Manglik' : matchResult.girlManglik.isManglik ? 'Manglik' : 'Non-Manglik'}</strong> (H{matchResult.girlManglik.marsHouseFromLagna})
          </p>
        </div>
      </div>
    </div>
  );
};
