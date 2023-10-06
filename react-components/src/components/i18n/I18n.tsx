/*!
 * Copyright 2023 Cognite AS
 */
import {
  useEffect,
  createContext,
  useContext,
  useState,
  type ReactNode,
  type ReactElement
} from 'react';

import { type I18nContent, type Translations } from './types';
import { getLanguage } from './utils';

import en from '../../common/i18n/en/reveal-react-components.json';
import de from '../../common/i18n/de/reveal-react-components.json';

const translations: Translations = {
  en,
  de
};

const I18nContext = createContext<I18nContent | null>(null);

export const useI18n = (): I18nContent => {
  const element = useContext(I18nContext);
  if (element === null) {
    throw new Error('useI18n must be used within a I18nContextProvider');
  }
  return element;
};

export const I18nContextProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const intitialLangauge = getLanguage();
  const [currentLanguage, setCurrentLanguage] = useState(intitialLangauge ?? 'en');

  useEffect(() => {
    const handleLanguageChange = (): void => {
      const newLanguage = getLanguage();
      if (newLanguage !== undefined && newLanguage !== currentLanguage) {
        setCurrentLanguage(newLanguage);
      }
    };

    window.addEventListener('languagechange', handleLanguageChange);

    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  const translate = (key: string, fallback?: string): string => {
    if (translations[currentLanguage][key] !== undefined) {
      return translations[currentLanguage][key];
    }
    // Fallback to the key itself if translation is not found
    if (fallback !== undefined) {
      return fallback;
    }
    return key;
  };

  return (
    <I18nContext.Provider value={{ currentLanguage, t: translate }}>
      {children}
    </I18nContext.Provider>
  );
};
