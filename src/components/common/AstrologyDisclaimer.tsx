import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function AstrologyDisclaimer() {
  const { t } = useLanguage();

  const text = t('disclaimer.text');
  const badge = t('disclaimer.badge');
  const ariaLabel = t('disclaimer.ariaLabel');

  return (
    <aside
      className="disclaimer-banner"
      role="note"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className="disclaimer-track">
        {/* Primary Marquee Track Content */}
        <div className="disclaimer-content">
          <span className="disclaimer-item">
            <span className="disclaimer-badge">
              <span aria-hidden="true">ℹ️</span> {badge}
            </span>
            <span className="disclaimer-text">{text}</span>
            <span className="disclaimer-bullet" aria-hidden="true">•</span>
          </span>
          <span className="disclaimer-item disclaimer-item--secondary">
            <span className="disclaimer-badge">
              <span aria-hidden="true">ℹ️</span> {badge}
            </span>
            <span className="disclaimer-text">{text}</span>
            <span className="disclaimer-bullet" aria-hidden="true">•</span>
          </span>
        </div>

        {/* Duplicate Content for Seamless Infinite Loop (hidden from screen readers) */}
        <div className="disclaimer-content" aria-hidden="true">
          <span className="disclaimer-item">
            <span className="disclaimer-badge">
              <span aria-hidden="true">ℹ️</span> {badge}
            </span>
            <span className="disclaimer-text">{text}</span>
            <span className="disclaimer-bullet" aria-hidden="true">•</span>
          </span>
          <span className="disclaimer-item disclaimer-item--secondary">
            <span className="disclaimer-badge">
              <span aria-hidden="true">ℹ️</span> {badge}
            </span>
            <span className="disclaimer-text">{text}</span>
            <span className="disclaimer-bullet" aria-hidden="true">•</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
