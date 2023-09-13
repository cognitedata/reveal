/*!
 * Copyright 2023 Cognite AS
 */
import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from './en/reveal-react-components.json';

export const translations = {
  en: { 'reveal-react-components': en }
};

export type TranslationKeys = keyof typeof en;

export const useTranslation = (): ReturnType<typeof useTypedTranslation<TranslationKeys>> =>
  useTypedTranslation<TranslationKeys>('reveal-react-components');
