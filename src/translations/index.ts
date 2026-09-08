import { en, type TranslationKey } from './en';
import { mr } from './mr';

export type Language = 'en' | 'mr';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  mr,
};

export function getTranslation(lang: Language, key: TranslationKey | string, fallback?: string): string {
  const dict = translations[lang] || translations.en;
  const val = dict[key as TranslationKey];
  if (val) return val;
  // Try fallback in English
  const enVal = translations.en[key as TranslationKey];
  if (enVal) return enVal;
  return fallback ?? key;
}

export * from './en';
export * from './mr';
