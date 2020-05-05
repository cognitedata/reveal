import i18next, { InitOptions } from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import LocizeBackend from 'i18next-locize-backend';
import HttpBackend from 'i18next-http-backend';
import Pseudo from 'i18next-pseudo';
import { initReactI18next } from 'react-i18next';
import config from './config';

const {
  REACT_APP_I18N_PSEUDO,
  REACT_APP_I18N_DEBUG,
  REACT_APP_LANGUAGE,
  REACT_APP_LOCIZE_PROJECT_ID,
  REACT_APP_LOCIZE_API_KEY,
} = process.env;

const pseudo = REACT_APP_I18N_PSEUDO === 'true';
const debug = REACT_APP_I18N_DEBUG === 'true';

if (!REACT_APP_LOCIZE_PROJECT_ID) {
  if (config.env === 'development') {
    // eslint-disable-next-line no-console
    console.warn('This project is not configured for translations!');
    // eslint-disable-next-line no-console
    console.warn('Please see https://cog.link/i18n for more information.');
  }
}

let initOptions: InitOptions = {
  debug: true,
  interpolation: { escapeValue: false },
  lng: REACT_APP_LANGUAGE || 'en',
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

const backends: any[] = [];
const backendOptions: any[] = [];

const addBackend = (backend: any, options: any) => {
  backends.push(backend);
  backendOptions.push(options);
};

// Cache the fetched translations in localstorage
addBackend(LocalStorageBackend, {
  prefix: `i18n_res_`,
  expirationTime: 1000 * 60 * 60 * 24,
});

if (REACT_APP_LOCIZE_API_KEY) {
  addBackend(LocizeBackend, {
    projectId: REACT_APP_LOCIZE_PROJECT_ID,
    debug,
    apiKey: REACT_APP_LOCIZE_API_KEY,
    referenceLng: 'en',
  });
  initOptions.saveMissing = true;
  initOptions.updateMissing = true;
}

addBackend(HttpBackend, {
  loadPath: `https://api.locize.app/${REACT_APP_LOCIZE_PROJECT_ID}/latest/{{lng}}/{{ns}}`,
  addPath: '',
});

initOptions = {
  ...initOptions,
  backend: {
    backends,
    backendOptions,
  },
};

i18next.use(ChainedBackend);
i18next.use(initReactI18next);
i18next.init(initOptions);

export default i18next;
