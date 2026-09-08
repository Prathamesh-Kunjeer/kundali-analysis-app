import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="lang-toggle"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--surface-overlay)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        padding: '2px',
        gap: '2px',
        flexShrink: 0,
      }}
      role="group"
      aria-label="Language switcher"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        style={{
          border: 'none',
          background: language === 'en' ? 'var(--brand-400)' : 'transparent',
          color: language === 'en' ? '#000000' : 'var(--text-secondary)',
          fontWeight: language === 'en' ? 700 : 500,
          fontSize: '0.74rem',
          padding: '0.24rem 0.5rem',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
        }}
        aria-pressed={language === 'en'}
        title="Switch to English"
      >
        English
      </button>

      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', userSelect: 'none' }}>|</span>

      <button
        type="button"
        onClick={() => setLanguage('mr')}
        className={`lang-btn ${language === 'mr' ? 'active' : ''}`}
        style={{
          border: 'none',
          background: language === 'mr' ? 'var(--brand-400)' : 'transparent',
          color: language === 'mr' ? '#000000' : 'var(--text-secondary)',
          fontWeight: language === 'mr' ? 700 : 500,
          fontSize: '0.74rem',
          padding: '0.24rem 0.5rem',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          lineHeight: 1.2,
          fontFamily: 'var(--font-devanagari), sans-serif',
          whiteSpace: 'nowrap',
        }}
        aria-pressed={language === 'mr'}
        title="मराठीमध्ये बदला"
      >
        मराठी
      </button>
    </div>
  );
}
