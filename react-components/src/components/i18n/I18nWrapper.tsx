/*!
 * Copyright 2023 Cognite AS
 */

import React, { type ReactElement, useEffect, useState } from 'react';

import { checkUrl, type Envs } from '@cognite/cdf-utilities';
import i18next, { type InitOptions, type Resource } from 'i18next';
import I18NextLocizeBackend from 'i18next-locize-backend';
import { locizePlugin } from 'locize';
import { initReactI18next, useTranslation } from 'react-i18next';

import { type TFunction } from '../../common/i18n';
import { getLanguage } from './utils';
import { LOCIZE_PROJECT_ID } from './constants';

type I18nWrapperProps = {
  children: React.ReactNode;
  errorScreen?: (e: Error) => React.ReactElement | null;
  loadingScreen?: React.ReactElement | null;
  translations: Resource;
  defaultNamespace?: string;
  addNamespace?: string;
  useLocizeBackend?: boolean | string[];
  locizeProjectId?: string;
};

const initializeTranslations = async (
  currentLanguage: string,
  translations: Resource,
  useLocizeBackend: boolean | string[],
  defaultNamespace?: string,
  addNamespace?: string,
  locizeProjectId = LOCIZE_PROJECT_ID
): Promise<TFunction | undefined> => {
  let shouldUseLocizeBackend = false;
  if (typeof useLocizeBackend === 'boolean') {
    shouldUseLocizeBackend = useLocizeBackend;
  } else if (Array.isArray(useLocizeBackend) && useLocizeBackend.length > 0) {
    shouldUseLocizeBackend = useLocizeBackend.some((env) => checkUrl(env as Envs));
  }

  const commonI18nOptions: Pick<
    InitOptions,
    'lng' | 'fallbackLng' | 'keySeparator' | 'interpolation' | 'defaultNS'
  > = {
    lng: currentLanguage,
    fallbackLng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false
    },
    defaultNS: defaultNamespace
  };

  if (shouldUseLocizeBackend) {
    return await i18next
      .use(locizePlugin)
      .use(I18NextLocizeBackend)
      .use(initReactI18next)
      .init({
        ...commonI18nOptions,
        react: {
          bindI18n: 'languageChanged editorSaved',
          useSuspense: false
        },
        backend: {
          projectId: locizeProjectId,
          version: 'latest',
          referenceLng: 'en'
        }
      });
  }

  if (i18next.isInitialized) {
    Object.entries(translations).forEach(([language, resource]) => {
      i18next.addResourceBundle(
        language,
        defaultNamespace ?? addNamespace ?? '',
        resource[defaultNamespace ?? addNamespace ?? ''],
        true,
        true
      );
    });

    i18next.setDefaultNamespace(defaultNamespace ?? addNamespace ?? '');

    await Promise.resolve();
    return;
  }

  await i18next
    .use(initReactI18next)
    .init({
      ...commonI18nOptions,
      resources: i18next.options.resources
    })
    .then(() => {
      Object.entries(translations).forEach(([language, resource]) => {
        i18next.addResourceBundle(
          language,
          defaultNamespace ?? addNamespace ?? '',
          resource[defaultNamespace ?? addNamespace ?? ''],
          true,
          true
        );
      });
    });
};

const I18nWrapper = ({
  children,
  defaultNamespace = 'default',
  addNamespace,
  useLocizeBackend = ['next-release'],
  errorScreen,
  loadingScreen,
  translations = {},
  locizeProjectId
}: I18nWrapperProps): ReactElement => {
  const language = getLanguage();

  const [didInitializedTranslations, setDidInitializedTranslations] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    initializeTranslations(
      language as string,
      translations,
      useLocizeBackend,
      defaultNamespace,
      addNamespace,
      locizeProjectId
    )
      .then(() => {
        setDidInitializedTranslations(true);
      })
      .catch((e) => {
        setError(e);
      });
  }, [defaultNamespace, addNamespace, useLocizeBackend, language, translations, locizeProjectId]);

  if (error !== undefined && errorScreen !== undefined) {
    return errorScreen(error) as any;
  }

  if (!didInitializedTranslations) {
    return <>{loadingScreen}</>;
  }

  return <I18nContentWrapper loadingScreen={loadingScreen}>{children}</I18nContentWrapper>;
};

const I18nContentWrapper = ({
  children,
  loadingScreen
}: Pick<I18nWrapperProps, 'children' | 'loadingScreen'>): ReactElement => {
  const { ready } = useTranslation();

  if (!ready) {
    return <>{loadingScreen}</>;
  }

  return <>{children}</>;
};

export default I18nWrapper;
