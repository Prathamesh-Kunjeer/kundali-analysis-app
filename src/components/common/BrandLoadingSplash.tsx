import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  message?: string;
  fullScreen?: boolean;
}

export const BrandLoadingSplash: React.FC<Props> = ({ message, fullScreen = false }) => {
  const { t } = useLanguage();

  return (
    <div
      className={`brand-splash-container ${fullScreen ? 'full-screen' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="brand-splash-card">
        {/* Central Logo Symbol with celestial pulse */}
        <div className="brand-splash-emblem-wrap">
          <img
            src="/brand/logo-icon.png"
            alt="Kundali Analysis Logo"
            className="brand-splash-emblem"
            width={96}
            height={96}
          />
          <div className="brand-splash-ring" aria-hidden="true" />
        </div>

        {/* Wordmark */}
        <div className="brand-splash-wordmark">
          <h2 className="brand-splash-title">KUNDALI ANALYSIS</h2>
          <div className="brand-splash-tagline">
            <span>INSIGHT</span>
            <span className="brand-dot">•</span>
            <span>DESTINY</span>
            <span className="brand-dot">•</span>
            <span>GUIDANCE</span>
          </div>
        </div>

        {/* Loading Indicator & Status */}
        <div className="brand-splash-status">
          <div className="brand-splash-bar">
            <div className="brand-splash-progress" />
          </div>
          <p className="brand-splash-text">
            {message || t('common.loading')}
          </p>
        </div>

        {/* Product Attribution */}
        <div className="brand-splash-product">
          JyotishVeda Vedic Astrology Studio
        </div>
      </div>
    </div>
  );
};

export default BrandLoadingSplash;
