import i18n from 'i18next';
import { locizePlugin } from 'locize';
import LastUsed from 'locize-lastused';
import { initReactI18next, setI18n } from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocizeBackend from 'i18next-locize-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.REACT_APP_ENV === 'staging';
const isPR = process.env.REACT_APP_ENV === 'preview';
const isProduction = process.env.REACT_APP_ENV === 'production';

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
  apiKey: isDevelopment ? process.env.REACT_APP_LOCIZE_API_KEY : undefined,
  referenceLng: 'en',
  version: isProduction || isStaging ? 'production' : 'latest',
  allowedAddOrUpdateHosts: ['localhost'],
};

i18n.options.react = reactOptions;
setI18n(i18n);

i18n
  .use(ChainedBackend)
  .use(LastUsed)
  .use(locizePlugin)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: isDevelopment || isPR,
    updateMissing: isDevelopment,
    saveMissing: isDevelopment,
    react: reactOptions,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      backends: isProduction
        ? [LocalStorageBackend, LocizeBackend]
        : [LocizeBackend],
      backendOptions: isProduction
        ? [
            {
              prefix: 'charts_i18n_',
              expirationTime: 60 * 60 * 1000,
            },
            {
              ...locizeOptions,
              fallbackLng: fallbacks,
            },
          ]
        : [
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
