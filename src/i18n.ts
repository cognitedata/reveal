import i18n from 'i18next';
import { locizePlugin } from 'locize';
import LastUsed from 'locize-lastused';
import { initReactI18next, setI18n } from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocizeBackend from 'i18next-locize-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

if (!process.env.REACT_APP_LOCIZE_PROJECT_ID)
  throw new Error('Locize is not configured!');

const reactOptions = {
  bindI18n: 'languageChanged editorSaved',
  useSuspense: false,
};

const fallbacks = {
  nb: ['en'],
  nn: ['en'],
  'en-GB': ['en'],
  'en-US': ['en'],
  'ja-JP': ['ja'],
  default: ['en'],
};

const locizeOptions = {
  projectId: process.env.REACT_APP_LOCIZE_PROJECT_ID ?? '',
  apiKey: process.env.REACT_APP_LOCIZE_API_KEY,
  referenceLng: 'en',
  version: process.env.NODE_ENV,
  allowedAddOrUpdateHosts: ['localhost'],
};

const isDevelopment = process.env.NODE_ENV === 'development';

i18n.options.react = reactOptions;
setI18n(i18n);

i18n
  .use(ChainedBackend)
  .use(LastUsed)
  .use(locizePlugin)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: isDevelopment,
    updateMissing: isDevelopment,
    saveMissing: isDevelopment,
    react: reactOptions,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      backends: [LocalStorageBackend, LocizeBackend],
      backendOptions: [
        {
          prefix: 'charts_i18n_',
          expirationTime: isDevelopment ? 1 : 60 * 60 * 1000,
        },
        {
          ...locizeOptions,
          fallbackLng: fallbacks,
        },
      ],
    },
    locizeLastUsed: locizeOptions,
    fallbackLng: fallbacks,
    defaultNS: 'global',
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'chartsLanguage',
      caches: ['localStorage'],
      htmlTag: document.documentElement,
    },
  });

export default i18n;
