import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from './translations/en/redirect-page.json';
import ja from './translations/ja/redirect-page.json';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { 'redirect-page': en },
  ja: { 'redirect-page': ja },
};

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
