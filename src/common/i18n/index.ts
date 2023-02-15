import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from 'common/i18n/translations/en/entity-matching.json';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { 'entity-matching': en },
};
export const languages = Object.keys(translations);

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
