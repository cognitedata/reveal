import en from '@access-management/common/i18n/translations/en/access-management.json';

import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

export const translations = {
  en: { 'access-management': en },
};

export type TranslationKeys = keyof typeof en;

export const useTranslation = () =>
  useTypedTranslation<TranslationKeys>('access-management');
