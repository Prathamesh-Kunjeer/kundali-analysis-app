import React from 'react';
import { Sparkles, Shield, Compass, Star } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="no-print"
      style={{
        marginTop: '60px',
        padding: '32px 24px',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        background: 'rgba(5, 7, 15, 0.95)',
        fontSize: '0.84rem',
        color: '#64748b'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#d4af37', fontWeight: 'bold' }}>JYOTISHVEDA STUDIO</span>
          <span>• Precise Sidereal Ephemeris & Kundali Analysis</span>
        </div>

        <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
          <span>Lahiri (Chitra Paksha) Ayanamsha</span>
          <span>•</span>
          <span>VSOP87 Astronomical Precision</span>
          <span>•</span>
          <span>Brihat Parashara Principles</span>
        </div>
      </div>
    </footer>
  );
};
