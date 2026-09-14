import { en, type TranslationKey } from './en';
import { mr } from './mr';

export type Language = 'en' | 'mr';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  mr,
};

/**
 * Converts a raw translation key or identifier to a safe human-readable string.
 * Strips namespace prefixes (e.g. 'common.', 'overview.') and formats camelCase / snake_case into Title Case.
 */
export function formatKeyToHumanReadable(key: string): string {
  if (!key) return '';
  // Strip namespace prefix if present (e.g. 'common.mindComfort' -> 'mindComfort')
  const baseKey = key.includes('.') ? key.split('.').slice(1).join(' ') : key;
  return baseKey
    // Split camelCase words
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Split underscores and hyphens
    .replace(/[_-]+/g, ' ')
    // Title Case each word
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

/**
 * 3-Tier Robust Translation Fallback:
 * 1. Requested language translation (dict[key])
 * 2. English translation (translations.en[key])
 * 3. Safe human-readable fallback (fallback param if provided, otherwise formatted readable string).
 * NEVER displays a raw translation key like 'common.xyz' to users.
 */
export function getTranslation(lang: Language, key: TranslationKey | string, fallback?: string): string {
  const dict = translations[lang] || translations.en;
  const val = dict[key as TranslationKey];
  if (val) return val;

  // Try fallback in English if target language was not English
  const enVal = translations.en[key as TranslationKey];
  if (enVal) return enVal;

  // User-supplied fallback if provided
  if (fallback !== undefined) return fallback;

  // Human-readable safe fallback (never leak dot-prefixed keys like 'common.mindComfort')
  return formatKeyToHumanReadable(String(key));
}

export * from './en';
export * from './mr';
