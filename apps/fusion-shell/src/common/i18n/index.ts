import { useTypedTranslation } from '@cognite/cdf-i18n-utils';

import en from './translations/en/navigation.json';
import ja from './translations/ja/navigation.json';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { navigation: en },
  ja: { navigation: ja },
};

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
