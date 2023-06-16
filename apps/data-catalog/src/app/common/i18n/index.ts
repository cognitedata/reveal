import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from './en/data-catalog.json';

export const translations = {
  en: { 'data-catalog': en },
};
export type TranslationKeys = keyof typeof en;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
