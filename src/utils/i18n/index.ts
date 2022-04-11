import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useTypedTranslation } from '@cognite/cdf-utilities';

import en from 'utils/i18n/en.json';
import no from 'utils/i18n/no.json';

export const translations = {
  en: { translation: en },
  no: { translation: no },
};

export const languages = Object.keys(translations);

export const setupTranslations = () => {
  i18next.use(initReactI18next).init({
    resources: translations,
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

export type TranslationKeys = keyof typeof en & keyof typeof no;

export const useTranslation = () => useTypedTranslation<TranslationKeys>();
