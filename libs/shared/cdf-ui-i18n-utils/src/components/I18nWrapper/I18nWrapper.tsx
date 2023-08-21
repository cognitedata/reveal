import React, { useEffect, useState } from 'react';

import { checkUrl, Envs } from '@cognite/cdf-utilities';
import i18next, { InitOptions, Resource } from 'i18next';
import I18NextLocizeBackend from 'i18next-locize-backend';
// eslint-disable-next-line
// @ts-ignore
import { locizePlugin } from 'locize';
import { initReactI18next, useTranslation } from 'react-i18next';

import { LOCIZE_PROJECT_ID } from '../../common/constants';
import {
  getLanguage,
  lowercasePostProcessor,
  uppercasePostProcessor,
} from '../../utils';
import { overrideFontFamily } from '../../utils/overrideFontFamily';

overrideFontFamily();

type I18nWrapperProps = {
  children: React.ReactNode;
  errorScreen?: (e: Error) => React.ReactElement | null;
  loadingScreen?: React.ReactElement | null;
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

const initializeTranslations = (
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
    shouldUseLocizeBackend = useLocizeBackend.some((env) =>
      /**`
       * NOTE
       * In an update to checkUrl (incorrectly released on a minor version),
       * the type of the argument has changed to Envs.
       * We should update the types here as well.
       * However, since it's going to be a breaking change,
       * I've skipped it for now, and am just overwriting the type here.
       */
      checkUrl(env as Envs)
    );
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
      .use(lowercasePostProcessor)
      .use(uppercasePostProcessor)
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

  return i18next
    .use(initReactI18next)
    .use(lowercasePostProcessor)
    .use(uppercasePostProcessor)
    .init({
      ...commonI18nOptions,
      resources: translations,
    });
};

const I18nWrapper = ({
  children,
  defaultNamespace,
  useLocizeBackend = ['next-release'],
  errorScreen,
  loadingScreen,
  translations,
  locizeProjectId,
}: I18nWrapperProps): JSX.Element => {
  const language = getLanguage();

  const [didInitializedTranslations, setDidInitializedTranslations] =
    useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!didInitializedTranslations) {
      initializeTranslations(
        language as string,
        translations,
        defaultNamespace,
        useLocizeBackend,
        locizeProjectId
      )
        .then(() => {
          setDidInitializedTranslations(true);
        })
        .catch((e) => {
          setError(e);
        });
    }
  }, [
    defaultNamespace,
    didInitializedTranslations,
    useLocizeBackend,
    language,
    translations,
    locizeProjectId,
  ]);

  if (error && errorScreen) {
    return errorScreen(error) as any;
  }

  if (!didInitializedTranslations || !i18next) {
    return <>{loadingScreen}</>;
  }

  return (
    <I18nContentWrapper loadingScreen={loadingScreen}>
      {children}
    </I18nContentWrapper>
  );
};

const I18nContentWrapper = ({
  children,
  loadingScreen,
}: Pick<I18nWrapperProps, 'children' | 'loadingScreen'>) => {
  const { ready } = useTranslation();

  if (!ready) {
    return <>{loadingScreen}</>;
  }

  return <>{children}</>;
};

export default I18nWrapper;
