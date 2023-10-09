/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, createContext, useContext, useState, type ReactElement } from 'react';

import { type I18nProps, type I18nContent, type Translations } from './types';
import { getLanguage } from './utils';

const I18nContext = createContext<I18nContent | null>(null);

export const useTranslation = (): I18nContent => {
  const element = useContext(I18nContext);
  if (element === null) {
    throw new Error('useTranslation must be used within a I18nContextProvider');
  }
  return element;
};

export const I18nContextProvider = ({ appLanguage, children }: I18nProps): ReactElement => {
  const initialLanguage = appLanguage ?? getLanguage() ?? 'en';
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [translations, setTranslations] = useState<Translations>({});

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

  useEffect(() => {
    const loadTranslations = async (): Promise<void> => {
      try {
        const translationModule = await import(
          `../../common/i18n/${currentLanguage}/reveal-react-components.json`
        );
        setTranslations(translationModule.default);
      } catch (error) {
        console.warn('Error loading translation file. Default language: English is loaded');
      }
    };

    loadTranslations().catch(() => {
      console.warn('Translation not found. Default language: English is loaded');
    });
  }, [currentLanguage]);

  const translate = (key: string, fallback?: string): string => {
    if (translations[key] !== undefined) {
      return translations[key];
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
