// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// FIX ME: Line 50, causing "error: Type instantiation is excessively deep and possibly infinite." errors
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
import { storage } from '@cognite/storage';

let enabled = true;

export const useTranslation = (
  ns?: string,
  options?: UseTranslationOptions
): UseTranslationResponse<string> => {
  if (enabled) {
    return useOrigTranslations(ns, options);
  }

  return {
    t: (_id: string, { defaultValue } = { defaultValue: '' }) =>
      defaultValue || ns,
    i18n: {
      changeLanguage: () => Promise.resolve(),
    },
    ready: true,
  } as unknown as UseTranslationResponse<string>;
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
  REACT_APP_LOCIZE_API_KEY,
  REACT_APP_LOCIZE_PROJECT_ID,
  REACT_APP_LOCIZE_VERSION,
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
    apiKey?: string;
    version?: string;
  };
  localStorageLanguageKey?: string;
  disabled?: boolean;
  saveMissing?: boolean;
  updateMissing?: boolean;
  extraConfigs?: InitOptions;
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
  extraConfigs,
  ...rest
}: ConfigureI18nOptions = {}) => {
  if (disabled) {
    enabled = false;
    return Promise.resolve();
  }
  const {
    apiKey: locizeApiKey,
    projectId: locizeProjectId,
    version: locizeVersion = 'latest',
  } = locize || {
    apiKey: REACT_APP_LOCIZE_API_KEY,
    projectId: REACT_APP_LOCIZE_PROJECT_ID,
    version: REACT_APP_LOCIZE_VERSION,
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

  // useful for debugging:
  // console.log('Locize options:', initOptions);
  // console.log('Other values:', {
  //   locizeVersion,
  //   locizeApiKey,
  //   locizeProjectId,
  // });

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

  const locizeBackendOptions = {
    // in case locizeApiKey is undefined it will fetch the translations but will not generate missing network requests
    apiKey: locizeApiKey,
    debug,
    projectId: locizeProjectId,
    referenceLng: 'en',
    version: locizeVersion,
  };
  addBackend(LocizeBackend, locizeBackendOptions);

  i18next.use(ChainedBackend);
  i18next.use(initReactI18next);

  const initOptions: InitOptions = {
    debug,
    interpolation: { escapeValue: false },
    lng:
      lng || storage.getFromLocalStorage<string>(localStorageLanguageKey, 'en'),
    load: 'currentOnly',
    keySeparator,
    fallbackNS: ['global'],
    postProcess: [],
    saveMissing: saveMissing ?? isDevEnv,
    saveMissingTo: 'current',
    updateMissing: updateMissing ?? isDevEnv,
    backend: {
      backends,
      backendOptions,
    },
    ...extraConfigs,
  };

  if (pseudo) {
    i18next.use(new Pseudo({ enabled: true }));
    if (Array.isArray(initOptions.postProcess)) {
      initOptions.postProcess.push('pseudo');
    }
  }

  await i18next.init(initOptions);

  return i18next;
};

export default configureI18n;
