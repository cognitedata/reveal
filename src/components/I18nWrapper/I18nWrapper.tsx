import React, { useEffect, useState } from 'react';

import { checkUrl } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';
import i18next, { InitOptions, Resource } from 'i18next';
import I18NextLocizeBackend from 'i18next-locize-backend';
import { initReactI18next } from 'react-i18next';
import { locizePlugin } from 'locize';

import { LOCIZE_PROJECT_ID, useLanguage } from '../..';

type FlagProviderProps = {
  apiToken: string;
  appName: string;
  projectName: string;
};

type I18nWrapperProps = {
  children: React.ReactNode;
  errorScreen?: (e: Error) => React.ReactElement | null;
  loadingScreen?: React.ReactElement | null;
  flagProviderProps: FlagProviderProps;
  translations: Resource;
  defaultNamespace: string;
  /**
   * When present, it determines whether the locize backend will be used for
   * translations. You can either pass a boolean, or a list of environments
   * that locize backend will be used.
   *
   * Default value: `['next-release']`
   */
  useLocizeBackend?: boolean | string[];
  locizeProjectId?: string;
};

const setupTranslations = (
  currentLanguage: string,
  translations: Resource,
  defaultNamespace: string,
  useLocizeBackend: boolean | string[],
  locizeProjectId = LOCIZE_PROJECT_ID
) => {
  let shouldUseLocizeBackend = false;
  if (typeof useLocizeBackend === 'boolean') {
    shouldUseLocizeBackend = useLocizeBackend;
  } else if (Array.isArray(useLocizeBackend) && useLocizeBackend.length > 0) {
    shouldUseLocizeBackend = useLocizeBackend.some((env) => checkUrl(env));
  }

  const commonI18nOptions: Pick<
    InitOptions,
    'lng' | 'fallbackLng' | 'keySeparator' | 'interpolation' | 'defaultNS'
  > = {
    lng: currentLanguage,
    fallbackLng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    defaultNS: defaultNamespace,
  };

  if (shouldUseLocizeBackend) {
    return i18next
      .use(locizePlugin)
      .use(I18NextLocizeBackend)
      .use(initReactI18next)
      .init({
        ...commonI18nOptions,
        react: {
          bindI18n: 'languageChanged editorSaved',
          useSuspense: false,
        },
        backend: {
          projectId: locizeProjectId,
          version: 'latest',
          referenceLng: 'en',
        },
      });
  }

  return i18next.use(initReactI18next).init({
    ...commonI18nOptions,
    resources: translations,
  });
};

const I18nWrapper = ({
  flagProviderProps,
  ...otherProps
}: I18nWrapperProps) => {
  return (
    <FlagProvider {...flagProviderProps}>
      <I18nInnerWrapper {...otherProps} />
    </FlagProvider>
  );
};

const I18nInnerWrapper = ({
  children,
  defaultNamespace,
  useLocizeBackend = ['next-release'],
  errorScreen,
  loadingScreen,
  translations,
  locizeProjectId,
}: Omit<I18nWrapperProps, 'flagProviderProps'>): JSX.Element => {
  const [didLoadTranslations, setDidLoadTranslations] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const { data: language, isClientReady } = useLanguage();

  useEffect(() => {
    if (isClientReady && !didLoadTranslations) {
      setupTranslations(
        language,
        translations,
        defaultNamespace,
        useLocizeBackend,
        locizeProjectId
      )
        .then(() => {
          setDidLoadTranslations(true);
        })
        .catch((e) => {
          setError(e);
        });
    }
  }, [
    defaultNamespace,
    didLoadTranslations,
    useLocizeBackend,
    isClientReady,
    language,
    translations,
    locizeProjectId,
  ]);

  if (error && errorScreen) {
    return errorScreen(error);
  }

  if (!didLoadTranslations && !error) {
    return <>{loadingScreen}</>;
  }

  return <>{children}</>;
};

export default I18nWrapper;
