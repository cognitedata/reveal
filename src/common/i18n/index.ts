import { useTypedTranslation } from '@cognite/cdf-utilities';

import en from 'common/i18n/translations/en/data-sets.json';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { 'data-sets': en },
};

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
