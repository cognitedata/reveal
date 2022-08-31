import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from 'common/i18n/translations/en/cdf-integrations-ui.json';

export const translations = {
  en: { 'cdf-integrations-ui': en },
};

export type TranslationKeys = keyof typeof en;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
