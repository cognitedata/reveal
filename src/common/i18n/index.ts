import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from 'common/i18n/translations/en/cdf-ui-demo-app.json';
import ja from 'common/i18n/translations/ja/cdf-ui-demo-app.json';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { 'cdf-ui-demo-app': en },
  ja: { 'cdf-ui-demo-app': ja },
};
export const languages = Object.keys(translations);

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
