/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, createContext, useContext, useState, type ReactElement } from 'react';

import { type I18nProps, type I18nContent } from './types';
import { getLanguage } from './utils';
import { type TranslationInput } from '../../architecture';
import {
  isTranslatedString,
  type Translations
} from '../../architecture/base/utilities/TranslateInput';

import english from '../../common/i18n/en/reveal-react-components.json';
import { setCurrentLanguage } from '../../architecture/base/utilities/translateUtils';

const I18nContext = createContext<I18nContent | null>(null);

const useTranslationContent = (
  overrideLanguage?: string | undefined,
  enabled: boolean = true
): I18nContent => {
  const initialLanguage = overrideLanguage ?? getLanguage() ?? 'en';
  const [currentLanguage, setCurrentLanguage] = useState(initialLanguage);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    if (!enabled) {
      return;
    }

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
    if (!enabled) {
      return;
    }

    const loadTranslations = async (): Promise<void> => {
      try {
        const translationModule = (await import(
          `../../common/i18n/${currentLanguage}/reveal-react-components.json`
        )) as { default: Translations };
        setTranslations(translationModule.default);
      } catch (error) {
        console.warn('Error loading translation file. Default language: English is loaded');
      }
    };

    loadTranslations().catch(() => {
      console.warn('Translation not found. Default language: English is loaded');
    });
  }, [currentLanguage]);

  const translate = (input: TranslationInput): string => {
    if (isTranslatedString(input)) {
      if (translations[input.key] !== undefined) {
        return translations[input.key];
      }
      return english[input.key];
    }

    return input.untranslated;
  };

  return { currentLanguage, t: translate };
};

/**
 * Use translation
 * @param fallbackLanguage Will be selected as language in cases where I18nContext is not available.
 * Should only be used in components for which we want to support usage outside RevealContainer.
 */
export const useTranslation = (fallbackLanguage?: string | undefined): I18nContent => {
  const i18nContent = useContext(I18nContext);
  const defaultLanguage = getLanguage() ?? 'en';
  const fallbackI18nContent = useTranslationContent(
    fallbackLanguage ?? defaultLanguage,
    i18nContent === null
  );

  if (i18nContent !== null) {
    return i18nContent;
  }

  return fallbackI18nContent;
};

export const I18nContextProvider = ({ appLanguage, children }: I18nProps): ReactElement => {
  useEffect(() => {
    void setCurrentLanguage(appLanguage);
  }, [appLanguage]);
  const i18nContent = useTranslationContent(appLanguage);
  return <I18nContext.Provider value={i18nContent}>{children}</I18nContext.Provider>;
};
