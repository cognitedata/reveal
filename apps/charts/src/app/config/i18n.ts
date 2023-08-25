import { initReactI18next, setI18n } from 'react-i18next';

import config from '@charts-app/config/config';
import {
  isDevelopment,
  isPR,
  isProduction,
} from '@charts-app/utils/environment';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ChainedBackend, { ChainedBackendOptions } from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import LocizeBackend, { LocizeBackendOptions } from 'i18next-locize-backend';
import { locizePlugin } from 'locize';
import LocizeLastusedPlugin, { LocizeLastusedOptions } from 'locize-lastused';

import { SELECTED_LANGUAGE_LS_KEY } from '@cognite/cdf-utilities';

if (!config.locizeProjectId) throw new Error('Locize is not configured!');

type CombinedInitOptions = LocizeBackendOptions &
  ChainedBackendOptions &
  LocizeLastusedOptions;

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
  apiKey: isDevelopment || isPR ? config.locizeApiKey : '',
  referenceLng: 'en',
  version: isProduction ? 'production' : 'latest',
};

i18n.options.react = reactOptions;
setI18n(i18n);

i18n
  .use(ChainedBackend)
  .use(LocizeLastusedPlugin)
  .use(locizePlugin)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<CombinedInitOptions>({
    debug: isDevelopment || isPR,
    updateMissing: isDevelopment,
    saveMissing: isDevelopment,
    react: reactOptions,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      ...locizeOptions,
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
      lookupLocalStorage: SELECTED_LANGUAGE_LS_KEY,
      caches: ['localStorage'],
      htmlTag: document.documentElement,
    },
  });

export default i18n;
