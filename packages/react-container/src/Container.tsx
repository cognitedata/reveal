import { Configuration, PublicClientApplication } from '@azure/msal-browser';
import { AuthenticationResult } from '@azure/msal-common';
import {
  getFromLocalStorage,
  saveToLocalStorage,
  removeItem,
} from '@cognite/storage';
import { useState } from 'react';
import * as React from 'react';
import { Router } from 'react-router-dom';
import merge from 'lodash/merge';
import { Store } from 'redux';
import { Loader } from '@cognite/cogs.js';
import { IntercomBootSettings } from '@cognite/intercom-helper';
import { ErrorBoundary } from '@cognite/react-errors';
import { withI18nSuspense } from '@cognite/react-i18n';
import { SentryProps } from '@cognite/react-sentry';
import { SidecarConfig } from '@cognite/sidecar';
import '@cognite/cogs.js/dist/cogs.css';

import {
  ConditionalLoopDetector,
  ConditionalQueryClientProvider,
  ConditionalSentry,
  TranslationWrapper,
  TenantSelectorWrapper,
  AuthContainer,
  IntercomContainer,
} from './components';
import { PROJECT_TO_LOGIN } from './components/AuthProvider/TokenFactory';
import { getProjectSpecificFlow } from './components/AuthProvider/utils';
import { createBrowserHistory } from './internal';
import { ConditionalReduxProvider } from './providers';
import { storage, getTenantInfo } from './utils';

const { REACT_APP_API_KEY_PROJECT: project } = process.env;

interface ContainerSidecarConfig extends SidecarConfig {
  disableTranslations?: boolean;
  disableLoopDetector?: boolean;
  disableSentry?: boolean;
  disableIntercom?: boolean;
  disableReactQuery?: boolean;
}

type Props = {
  store?: Store;
  children: React.ReactChild;
  intercomSettings?: IntercomBootSettings;
  sentrySettings?: SentryProps;
  sidecar: ContainerSidecarConfig;
};
const RawContainer: React.FC<Props> = ({
  children,
  store,
  sidecar,
  intercomSettings,
  sentrySettings,
}) => {
  const [_possibleTenant, initialTenant] = getTenantInfo(window.location);

  const {
    applicationId,
    disableLoopDetector,
    disableSentry,
    disableIntercom,
    disableReactQuery,
    reactQueryDevtools,
  } = sidecar;

  const [history] = React.useState(() => createBrowserHistory(initialTenant));
  const [redirectAuthResult, setRedirectAuthResult] =
    useState<AuthenticationResult | null>();

  const initialTenantOrApiKeyTenant = project || initialTenant;

  React.useEffect(() => {
    storage.init({ tenant: initialTenant, appName: applicationId });
  }, [initialTenant, applicationId]);

  const projectFlow = getProjectSpecificFlow(initialTenantOrApiKeyTenant);
  const configuration: Configuration = {
    auth: {
      clientId: sidecar.aadApplicationId || '',
      authority: `https://login.microsoftonline.com/${
        projectFlow?.options?.directory || sidecar.AADTenantID || 'common'
      }`,
      redirectUri: `${window.location.origin}`,
      navigateToLoginRequestUrl: true,
    },
  };

  // This handles the login redirect from azure
  const publicClientApplication = new PublicClientApplication(configuration);
  publicClientApplication
    .handleRedirectPromise()
    .then((res) => {
      const projectToLogin = getFromLocalStorage<string>(PROJECT_TO_LOGIN);
      if (projectToLogin && res?.account?.localAccountId) {
        saveToLocalStorage(
          `${projectToLogin}_localAccountId`,
          res.account.localAccountId
        );

        removeItem(PROJECT_TO_LOGIN);
      }
      setRedirectAuthResult(res);
      return res;
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      refreshPage();
    });

  // Wait for the handleRedirectPromise to resolve.
  // we use it for the redirection on azure ad auth
  if (redirectAuthResult === undefined) {
    return null;
  }

  if (!initialTenant) {
    if (!initialTenantOrApiKeyTenant) {
      return <TenantSelectorWrapper sidecar={sidecar} />;
    }

    history.push(`/${initialTenantOrApiKeyTenant}/`);

    // Don't know why we need to reload here, need to ask @Fran
    // document.location.reload();
    return <Loader />;
  }

  const refreshPage = () => {
    window.location.assign('/');
  };

  return (
    <ConditionalLoopDetector disabled={disableLoopDetector}>
      <ConditionalQueryClientProvider
        disabled={disableReactQuery}
        reactQueryDevtools={reactQueryDevtools}
      >
        <ConditionalSentry
          disabled={disableSentry}
          history={history}
          {...sentrySettings}
        >
          <AuthContainer
            sidecar={sidecar}
            authError={refreshPage}
            project={initialTenant}
          >
            <IntercomContainer
              intercomSettings={merge(
                {},
                intercomSettings,
                sidecar.intercomSettings
              )}
              project={initialTenantOrApiKeyTenant}
              sidecar={sidecar}
              disabled={disableIntercom}
            >
              <ConditionalReduxProvider store={store}>
                <ErrorBoundary instanceId="container-root">
                  <Router history={history}>{children}</Router>
                </ErrorBoundary>
              </ConditionalReduxProvider>
            </IntercomContainer>
          </AuthContainer>
        </ConditionalSentry>
      </ConditionalQueryClientProvider>
    </ConditionalLoopDetector>
  );
};

export const Container = (props: Props) => {
  const sidecar = {
    ...props.sidecar,
  };

  const WrappedConatiner = withI18nSuspense<Props>(RawContainer);

  // Wrappers here are for both TSA and the authed flow
  return (
    <TranslationWrapper {...sidecar}>
      <WrappedConatiner {...props} sidecar={sidecar} />
    </TranslationWrapper>
  );
};

export const ContainerWithoutI18N = (props: Props) => (
  <RawContainer
    {...props}
    sidecar={{ ...props.sidecar, disableTranslations: true }}
  />
);
