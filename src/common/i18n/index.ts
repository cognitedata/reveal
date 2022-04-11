import { useTypedTranslation } from '@cognite/cdf-utilities';

import en from 'common/i18n/en.json';
import no from 'common/i18n/no.json';

export const translations = {
  en: { translation: en },
  no: { translation: no },
};

export const languages = Object.keys(translations);

export type TranslationKeys = keyof typeof en & keyof typeof no;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
