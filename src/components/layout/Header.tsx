import React from 'react';
import { BirthDetails } from '../../types/astrology';
import { ProfileManager } from '../input/ProfileManager';
import { Sparkles, Printer, PlusCircle, Compass, Star } from 'lucide-react';

interface HeaderProps {
  currentDetails: BirthDetails;
  onSelectProfile: (details: BirthDetails) => void;
  onNewChartClick: () => void;
  onPrintClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDetails,
  onSelectProfile,
  onNewChartClick,
  onPrintClick
}) => {
  return (
    <header
      style={{
        background: 'rgba(7, 9, 19, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-gold)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '14px 24px'
      }}
      className="no-print"
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        {/* Brand Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onNewChartClick}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f5e7a9 0%, #d4af37 50%, #aa841e 100%)',
              color: '#070913',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(212, 175, 55, 0.5)',
              fontWeight: '900',
              fontSize: '1.2rem'
            }}
          >
            ॐ
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '1.35rem',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f5e7a9 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                JYOTISHVEDA
              </span>
              <span className="badge-gold" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>STUDIO</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Sidereal Lahiri Vedic Kundali Analysis & Precision Ephemeris
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ProfileManager
            currentDetails={currentDetails}
            onSelectProfile={onSelectProfile}
          />

          <button
            onClick={onNewChartClick}
            className="btn-outline-gold"
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <PlusCircle size={14} /> New Chart
          </button>

          <button
            onClick={onPrintClick}
            className="btn-gold"
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <Printer size={14} /> Export PDF
          </button>
        </div>
      </div>
    </header>
  );
};
