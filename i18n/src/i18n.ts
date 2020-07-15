import i18next, { InitOptions } from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import LocizeBackend from 'i18next-locize-backend';
import HttpBackend from 'i18next-http-backend';
import Pseudo from 'i18next-pseudo';
import { initReactI18next } from 'react-i18next';

const {
  NODE_ENV,
  REACT_APP_ENV,
  REACT_APP_I18N_PSEUDO,
  REACT_APP_I18N_DEBUG,
  REACT_APP_LANGUAGE,
  REACT_APP_LOCIZE_PROJECT_ID,
  REACT_APP_LOCIZE_API_KEY,
} = process.env;

type ConfigureI18nOptions = {
  debug?: boolean;
  pseudo?: boolean;
  lng?: string;
  localStorageCacheTimeMillis?: number;
  env?: string;
  locize?: {
    projectId: string;
    apiKey: string;
    version?: string;
  };
};

const configureI18n = ({
  debug = REACT_APP_I18N_DEBUG === 'true',
  pseudo = REACT_APP_I18N_PSEUDO === 'true',
  lng = REACT_APP_LANGUAGE,
  localStorageCacheTimeMillis = 1000 * 60 * 60 * 24, // 1 day
  locize,
  env = REACT_APP_ENV || NODE_ENV,
}: ConfigureI18nOptions = {}) => {
  const {
    projectId: locizeProjectId,
    apiKey: locizeApiKey,
    version: locizeVersion = 'latest',
  } = locize || {
    projectId: REACT_APP_LOCIZE_PROJECT_ID,
    apiKey: REACT_APP_LOCIZE_API_KEY,
  };

  if (!locizeApiKey) {
    if (!(env === 'production' || env === 'test')) {
      // eslint-disable-next-line no-console
      console.warn(
        [
          '==== NOTICE ====',
          'This project is not configured for translations!',
          'Please see https://cog.link/i18n for more information.',
        ].join('\n')
      );
    }
  }

  const initOptions: InitOptions = {
    debug,
    interpolation: { escapeValue: false },
    lng: lng || 'en',
    fallbackLng: 'en',
    load: 'currentOnly',
    fallbackNS: ['global'],
    postProcess: [],
    react: { wait: false, useSuspense: true },
  };

  if (pseudo) {
    i18next.use(new Pseudo({ enabled: true }));
    if (Array.isArray(initOptions.postProcess)) {
      initOptions.postProcess.push('pseudo');
    }
  }

  const backends: unknown[] = [];
  const backendOptions: unknown[] = [];

  const addBackend = (backend: unknown, options: unknown) => {
    backends.push(backend);
    backendOptions.push(options);
  };

  if (localStorageCacheTimeMillis) {
    // Cache the fetched translations in localstorage
    addBackend(LocalStorageBackend, {
      prefix: `i18n_res_`,
      expirationTime: localStorageCacheTimeMillis,
    });
  }

  if (locizeApiKey) {
    addBackend(LocizeBackend, {
      projectId: locizeProjectId,
      debug,
      apiKey: locizeApiKey,
      referenceLng: 'en',
    });
    initOptions.saveMissing = true;
    initOptions.updateMissing = true;
  }

  if (locizeProjectId && locizeVersion) {
    addBackend(HttpBackend, {
      loadPath: `https://api.locize.app/${locizeProjectId}/${locizeVersion}/{{lng}}/{{ns}}`,
      addPath: '',
    });
  }

  i18next.use(ChainedBackend);
  i18next.use(initReactI18next);
  return i18next.init({
    ...initOptions,
    backend: {
      backends,
      backendOptions,
    },
  });
};

export default configureI18n;
