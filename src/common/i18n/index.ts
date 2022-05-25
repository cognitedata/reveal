import { useTypedTranslation } from '@cognite/cdf-utilities';

import en from 'common/i18n/translations/en/raw-explorer.json';

export const translations = {
  en: { 'raw-explorer': en },
};

export type TranslationKeys = keyof typeof en;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
