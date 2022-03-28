import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import no from './no.json';

const translations = {
  en: {
    translation: en,
  },
  no: {
    translation: no,
  },
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
