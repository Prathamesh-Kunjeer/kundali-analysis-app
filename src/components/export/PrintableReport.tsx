import React from 'react';
import { FullKundaliAnalysis } from '../../types/astrology';
import { NorthIndianChart } from '../charts/NorthIndianChart';
import { PLANETS_DATA } from '../../data/constants';
import { Printer, Download, Sparkles } from 'lucide-react';

interface PrintableReportProps {
  data: FullKundaliAnalysis;
  onClose?: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ data, onClose }) => {
  const moon = data.planets.find(p => p.name === 'Moon') || data.planets[0];
  const sun = data.planets.find(p => p.name === 'Sun') || data.planets[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Control Bar (Hidden in Print) */}
      <div className="glass-card-gold no-print" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="text-gold-gradient" style={{ fontSize: '1.2rem', marginBottom: '2px' }}>
            Comprehensive Janam Kundali Report
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Ready for high-resolution printing or PDF export
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-gold" style={{ fontSize: '0.9rem', padding: '8px 20px' }}>
            <Printer size={16} /> Print / Save as PDF
          </button>
          {onClose && (
            <button onClick={onClose} className="btn-outline-gold" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
              Back to App
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet */}
      <div
        className="glass-card"
        style={{
          padding: '40px',
          maxWidth: '900px',
          margin: '0 auto',
          background: 'rgba(11, 16, 36, 0.95)',
          border: '2px solid var(--border-gold)'
        }}
      >
        {/* Document Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid var(--gold-primary)', paddingBottom: '20px', marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.2rem', color: '#d4af37', letterSpacing: '2px', marginBottom: '4px' }}>
            ॥ वैदिक जन्म कुण्डली ॥
          </h1>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>
            VEDIC HOROSCOPE & ASTRONOMICAL BIRTH CHART
          </div>
          <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: '4px' }}>
            Calculated under Sidereal Zodiac (Chitra Paksha / Lahiri Ayanamsha: {data.formattedAyanamsa})
          </div>
        </div>

        {/* Person & Birth Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px', background: 'rgba(9, 14, 33, 0.7)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Native's Name</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>{data.birthDetails.name}</div>
            <div style={{ fontSize: '0.82rem', color: '#d4af37', textTransform: 'capitalize' }}>Gender: {data.birthDetails.gender}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Date & Exact Time of Birth</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{data.birthDetails.dob} at {data.birthDetails.tob}</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{data.birthDetails.cityName}, {data.birthDetails.country} ({data.birthDetails.latitude}°N, {data.birthDetails.longitude}°E)</div>
          </div>
        </div>

        {/* Core Astrological Highlights Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          <div style={{ padding: '14px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: '700' }}>ASCENDANT (LAGNA)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>{data.ascendant.rashi}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{data.ascendant.formattedDegree} • {data.ascendant.nakshatra}</div>
          </div>

          <div style={{ padding: '14px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: '700' }}>MOON SIGN (CHANDRA)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>{moon.rashi}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{moon.nakshatra} (Pada {moon.pada})</div>
          </div>

          <div style={{ padding: '14px', background: 'rgba(212, 175, 55, 0.08)', borderRadius: '10px', border: '1px solid var(--border-gold)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#d4af37', fontWeight: '700' }}>SUN SIGN (SURYA)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', margin: '4px 0' }}>{sun.rashi}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>House {sun.house} • {sun.formattedDegree}</div>
          </div>
        </div>

        {/* Charts Section: D1 Lagna & D9 Navamsha side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#f3e5ab', textAlign: 'center', marginBottom: '10px' }}>
              Lagna Chart (लग्न कुण्डली - D1)
            </h3>
            <NorthIndianChart chart={data.divisionalCharts.D1} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#f3e5ab', textAlign: 'center', marginBottom: '10px' }}>
              Navamsha Chart (नवांश कुण्डली - D9)
            </h3>
            <NorthIndianChart chart={data.divisionalCharts.D9} />
          </div>
        </div>

        {/* Planetary Positions Table */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#f3e5ab', marginBottom: '12px' }}>
            Planetary Ephemeris & Dignities (ग्रह स्पष्ट)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gold-primary)', color: '#d4af37' }}>
                <th style={{ padding: '8px' }}>Graha</th>
                <th style={{ padding: '8px' }}>Rashi</th>
                <th style={{ padding: '8px' }}>House</th>
                <th style={{ padding: '8px' }}>Degree</th>
                <th style={{ padding: '8px' }}>Nakshatra</th>
                <th style={{ padding: '8px' }}>Pada</th>
                <th style={{ padding: '8px' }}>Dignity</th>
              </tr>
            </thead>
            <tbody>
              {[data.ascendant, ...data.planets].map(p => (
                <tr key={p.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '8px', fontWeight: '700', color: PLANETS_DATA[p.name].color }}>
                    {p.sanskritName} ({p.name}) {p.isRetrograde ? '[R]' : ''}
                  </td>
                  <td style={{ padding: '8px', color: '#ffffff' }}>{p.rashi}</td>
                  <td style={{ padding: '8px', color: '#d4af37', fontWeight: '700' }}>H{p.house}</td>
                  <td style={{ padding: '8px', color: '#cbd5e1' }}>{p.formattedDegree}</td>
                  <td style={{ padding: '8px', color: '#ffffff' }}>{p.nakshatra}</td>
                  <td style={{ padding: '8px', color: '#f3e5ab' }}>Pada {p.pada}</td>
                  <td style={{ padding: '8px', color: '#10b981', fontWeight: '600' }}>{p.dignity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Yogas, Dasha & Gemstones Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(9, 14, 33, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h4 style={{ color: '#d4af37', fontSize: '0.95rem', marginBottom: '8px' }}>Active Vedic Yogas</h4>
            <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              {data.yogas.slice(0, 5).map((y, i) => (
                <li key={i}><strong>{y.name}:</strong> {y.effects.slice(0, 80)}...</li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'rgba(9, 14, 33, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <h4 style={{ color: '#d4af37', fontSize: '0.95rem', marginBottom: '8px' }}>Prescribed Gemstones</h4>
            <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              {data.gemstones.map((g, i) => (
                <li key={i}><strong>{g.type}:</strong> {g.name} ({g.hindiName}) on {g.finger} in {g.metal}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Stamp */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(212, 175, 55, 0.3)', paddingTop: '16px', fontSize: '0.78rem', color: '#64748b' }}>
          Generated by <strong>JyotishVeda Kundali Analysis Studio</strong> • Planetary Ephemeris based on VSOP87 & Lahiri Ayanamsha
        </div>
      </div>
    </div>
  );
};
