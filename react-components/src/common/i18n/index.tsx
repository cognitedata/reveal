/*!
 * Copyright 2023 Cognite AS
 */

import { useTypedTranslation } from '../../components/i18n/useTypedTranslation';
import en from './en/reveal-react-components.json';
import { useCallback } from 'react';

export const translations = {
  en: { 'reveal-react-components': en }
};

export type TranslationKeys = keyof typeof en;

export type TFunction = (key: string, referenceValue: string, options?: any) => string;

export const useTranslation = (): { t: TFunction } => {
  const { t: i18nTranslate } = useTypedTranslation();
  const translate: TFunction = useCallback((key: string, referenceValue: string, options?: any) => {
    const processedTranslation = i18nTranslate(key, {
      defaultValue: referenceValue,
      ...options
    });

    if (processedTranslation === key) {
      return referenceValue;
    }
    return processedTranslation;
  }, []);

  return {
    t: translate
  };
};
