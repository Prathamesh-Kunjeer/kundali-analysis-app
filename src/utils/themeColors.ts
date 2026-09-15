/**
 * Unified Theme-Aware Planet Colors & Color Utilities
 * Maps to CSS custom properties defined in src/index.css for dual-theme (light/dark) compatibility.
 */

export const PLANET_THEME_COLORS: Record<string, string> = {
  Sun:       'var(--color-planet-sun)',
  Moon:      'var(--color-planet-moon)',
  Mars:      'var(--color-planet-mars)',
  Mercury:   'var(--color-planet-mercury)',
  Jupiter:   'var(--color-planet-jupiter)',
  Venus:     'var(--color-planet-venus)',
  Saturn:    'var(--color-planet-saturn)',
  Rahu:      'var(--color-planet-rahu)',
  Ketu:      'var(--color-planet-ketu)',
  Ascendant: 'var(--color-planet-ascendant)',
};

/**
 * Returns a CSS color-mix expression to safely apply opacity to CSS variables
 * without breaking syntax or relying on hardcoded hex opacity suffixes.
 */
export function withAlpha(colorVarOrHex: string, opacityPercent: number = 15): string {
  if (!colorVarOrHex) return 'transparent';
  return `color-mix(in srgb, ${colorVarOrHex} ${opacityPercent}%, transparent)`;
}
