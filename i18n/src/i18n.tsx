import React from 'react';
import i18next, { InitOptions } from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import LocizeBackend from 'i18next-locize-backend';
import Pseudo from 'i18next-pseudo';
import {
  useTranslation as useOrigTranslations,
  Trans as OrigTrans,
  initReactI18next,
  TFuncKey,
  Resources,
  Namespace,
  TransProps,
  UseTranslationOptions,
  UseTranslationResponse,
} from 'react-i18next';

let enabled = true;

export const useTranslation = (
  ns?: string,
  options?: UseTranslationOptions
): UseTranslationResponse<string> => {
  if (enabled) {
    return useOrigTranslations(ns, options);
  }

  return ({
    t: (_id: string, { defaultValue } = { defaultValue: '' }) =>
      defaultValue || ns,
    i18n: {
      changeLanguage: () => Promise.resolve(),
    },
    ready: true,
  } as unknown) as UseTranslationResponse<string>;
};
export const Trans = <
  K extends TFuncKey<N, Resources> extends infer A ? A : never,
  N extends Namespace<string> = string,
  E extends Element = HTMLDivElement
>({
  children,
  ...rest
}: TransProps<K, N, E>): React.ReactElement =>
  enabled ? <OrigTrans {...rest}>{children}</OrigTrans> : <>{children}</>;

const {
  NODE_ENV,
  REACT_APP_ENV,
  REACT_APP_I18N_PSEUDO,
  REACT_APP_I18N_DEBUG,
  REACT_APP_LANGUAGE,
  REACT_APP_LOCIZE_PROJECT_ID,
  REACT_APP_LOCIZE_API_KEY,
} = process.env;

const CACHE_TIME_MILLIS = 1000 * 60 * 60 * 24; // 1 day

export type ConfigureI18nOptions = {
  debug?: boolean;
  pseudo?: boolean;
  keySeparator?: false | string;
  lng?: string;
  localStorageCacheTimeMillis?: number;
  env?: string;
  locize?: {
    projectId: string;
    apiKey: string;
    version?: string;
  };
  wait?: boolean;
  useSuspense?: boolean;
  localStorageLanguageKey?: string;
  disabled?: boolean;
  saveMissing?: boolean;
  updateMissing?: boolean;
};

const configureI18n = async ({
  debug = REACT_APP_I18N_DEBUG === 'true',
  pseudo = REACT_APP_I18N_PSEUDO === 'true',
  lng = REACT_APP_LANGUAGE,
  locize,
  env = REACT_APP_ENV || NODE_ENV,
  localStorageLanguageKey = 'currentLanguage',
  disabled = false,
  keySeparator,
  saveMissing,
  updateMissing,
  ...rest
}: ConfigureI18nOptions = {}) => {
  if (disabled) {
    enabled = false;
    return Promise.resolve();
  }
  const { wait = env !== 'test', useSuspense = env === 'test' } = rest;
  const {
    projectId: locizeProjectId,
    apiKey: locizeApiKey,
    version: locizeVersion = 'latest',
  } = locize || {
    projectId: REACT_APP_LOCIZE_PROJECT_ID,
    apiKey: REACT_APP_LOCIZE_API_KEY,
  };
  const isDevEnv = !(env === 'production' || env === 'test');
  const {
    // In case we want to trigger missings we should not use LocalStorageBackend
    localStorageCacheTimeMillis = isDevEnv ? 0 : CACHE_TIME_MILLIS,
  } = rest;

  if (!locizeApiKey) {
    if (isDevEnv) {
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

  // -@TODO - refactor this out to 'storage' when we make it into
  //  a generic frontend package
  const getItem = (key: string) => {
    const string = localStorage.getItem(key);
    try {
      return JSON.parse(string || '');
    } catch (err) {
      return string;
    }
  };

  const language = lng || getItem(localStorageLanguageKey) || 'en';

  const initOptions: InitOptions = {
    debug,
    interpolation: { escapeValue: false },
    lng: language,
    fallbackLng: 'en',
    load: 'currentOnly',
    keySeparator,
    fallbackNS: ['global'],
    postProcess: [],
    react: { wait, useSuspense },
    saveMissing: saveMissing ?? isDevEnv,
    updateMissing: updateMissing ?? isDevEnv,
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

  addBackend(LocizeBackend, {
    projectId: locizeProjectId,
    debug,
    version: locizeVersion,
    // in case locizeApiKey is undefined it will fetch the translations but will not generate missing network requests
    apiKey: locizeApiKey,
    referenceLng: 'en',
  });

  i18next.use(ChainedBackend);
  i18next.use(initReactI18next);
  await i18next.init({
    ...initOptions,
    backend: {
      backends,
      backendOptions,
    },
  });

  return i18next;
};

export default configureI18n;
