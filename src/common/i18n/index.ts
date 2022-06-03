import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from 'common/i18n/translations/en/data-sets.json';

export const translations = {
  en: { 'data-sets': en },
};
export type TranslationKeys = keyof typeof en;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
