import i18n from 'i18next';
import { locizePlugin } from 'locize';
import LastUsed from 'locize-lastused';
import { initReactI18next, setI18n } from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocizeBackend from 'i18next-locize-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  isDevelopment,
  isPR,
  isProduction,
  isStaging,
} from 'utils/environment';
import config from 'config/config';

if (!config.locizeProjectId) throw new Error('Locize is not configured!');

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
  projectId: config.locizeProjectId,
  apiKey: isDevelopment || isPR ? config.locizeApiKey : undefined,
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
