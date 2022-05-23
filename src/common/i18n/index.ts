import { useTypedTranslation } from '@cognite/cdf-utilities';

import en from 'common/i18n/translations/en/data-sets.json';

export const translations = {
  en: { translation: en },
};
export const languages = Object.keys(translations);
export type TranslationKeys = keyof typeof en;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
