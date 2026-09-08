import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Language, type TranslationKey, getTranslation } from '../translations';
import type { Planet, Sign } from '../core/models';

const STORAGE_KEY = 'jyotish_lang';

interface LanguageContextType {
  language: Language;
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string, fallback?: string) => string;
  formatPlanet: (planet: Planet | string, showBoth?: boolean) => string;
  formatSign: (sign: Sign | string, showBoth?: boolean) => string;
  formatDignity: (dignity: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'mr' || saved === 'en') return saved;
    } catch {
      // ignore storage access errors
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (key: TranslationKey | string, fallback?: string) => {
      return getTranslation(language, key, fallback);
    },
    [language]
  );

  const formatPlanet = useCallback(
    (planet: Planet | string, showBoth: boolean = false): string => {
      const mrName = getTranslation('mr', `planet.${planet}`);
      const enName = getTranslation('en', `planet.${planet}`);
      if (language === 'mr') {
        return showBoth && enName ? `${mrName} (${enName})` : mrName || String(planet);
      }
      return enName || String(planet);
    },
    [language]
  );

  const formatSign = useCallback(
    (sign: Sign | string, showBoth: boolean = false): string => {
      const mrName = getTranslation('mr', `sign.${sign}`);
      const enName = getTranslation('en', `sign.${sign}`);
      if (language === 'mr') {
        return showBoth && enName ? `${mrName} (${enName})` : mrName || String(sign);
      }
      return enName || String(sign);
    },
    [language]
  );

  const formatDignity = useCallback(
    (dignity: string): string => {
      return getTranslation(language, `dignity.${dignity}`, dignity);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        lang: language,
        setLanguage,
        t,
        formatPlanet,
        formatSign,
        formatDignity,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback safe context if used outside provider
    return {
      language: 'en',
      lang: 'en',
      setLanguage: () => {},
      t: (k: string, fallback?: string) => getTranslation('en', k, fallback),
      formatPlanet: (p: string) => String(p),
      formatSign: (s: string) => String(s),
      formatDignity: (d: string) => String(d),
    };
  }
  return context;
}
