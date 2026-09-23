import React from 'react';

interface Props {
  isDark: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export default function ThemeToggle({ isDark, onToggle, compact = false }: Props) {
  const label = isDark ? 'Dark' : 'Light';
  const ariaLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      id={compact ? 'theme-toggle-compact' : 'theme-toggle'}
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onToggle}
      type="button"
      className={`theme-toggle ${compact ? 'theme-toggle--compact' : ''}`}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {isDark ? '🌙' : '☀️'}
        </span>
      </span>
      {!compact && <span className="theme-toggle__label">{label}</span>}
    </button>
  );
}

