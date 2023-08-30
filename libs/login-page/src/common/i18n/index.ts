import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from './translations/en/login-page.json';
import ja from './translations/ja/login-page.json';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { 'login-page': en },
  ja: { 'login-page': ja },
};

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
