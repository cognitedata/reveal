import en from '@flows/common/i18n/translations/en/flows.json';
import ja from '@flows/common/i18n/translations/ja/flows.json';

import { TypedTrans, useTypedTranslation } from '@cognite/cdf-i18n-utils';

export type TranslationKeys = keyof typeof en;

export const translations = {
  en: { flows: en },
  ja: { flows: ja },
};
export const languages = Object.keys(translations);

export const useTranslation = () => useTypedTranslation<TranslationKeys>();

export const Trans = TypedTrans<TranslationKeys>;
