import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

import { translations } from '../data/translations';

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Read the saved choice before the first paint (no English flash for Arabic visitors).
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language');
      return saved === 'ar' || saved === 'en' ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try { localStorage.setItem('language', language); } catch { /* private mode */ }

    
    const root = document.documentElement;
    const body = document.body;
    
    root.lang = language;
    if (language === 'ar') {
      root.dir = 'rtl';
      root.classList.add('rtl');
      body.classList.add('font-alexandria');
      body.classList.remove('font-inter');
    } else {
      root.dir = 'ltr';
      root.classList.remove('rtl');
      body.classList.remove('font-alexandria');
      body.classList.add('font-inter');
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      toggleLanguage, 
      setLanguage,
      t, 
      isRTL: language === 'ar' 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
