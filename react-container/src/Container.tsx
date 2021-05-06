import * as React from 'react';
import { Router } from 'react-router-dom';
import { Store } from 'redux';

import { withI18nSuspense } from '@cognite/react-i18n';
import { ErrorBoundary } from '@cognite/react-errors';
import { TenantSelector, SidecarConfig } from '@cognite/react-tenant-selector';
import { IntercomBootSettings } from '@cognite/intercom-helper';
import { Loader } from '@cognite/cogs.js';

import { IntercomContainer } from 'components/Intercom';
import {
  AuthContainer,
  AuthContainerForApiKeyMode,
  ConditionalSentry,
  ConditionalLoopDetector,
  TranslationWrapper,
} from './components';
import { configureCogniteSDKClient, createBrowserHistory } from './internal';
import { storage, getTenantInfo } from './utils';
import { ConditionalReduxProvider } from './providers';

interface ContainerSidecarConfig extends SidecarConfig {
  disableTranslations?: boolean;
  disableLoopDetector?: boolean;
  disableSentry?: boolean;
}

interface Props {
  store?: Store;
  children: React.ReactChild;
  intercomSettings?: IntercomBootSettings;
  sidecar: ContainerSidecarConfig;
}
const RawContainer: React.FC<Props> = ({
  children,
  store,
  sidecar,
  intercomSettings,
}) => {
  const [possibleTenant, initialTenant] = getTenantInfo(window.location);

  const {
    applicationId,
    cdfApiBaseUrl,
    disableTranslations,
    disableLoopDetector,
    disableSentry,
  } = sidecar;

  storage.init({ tenant: possibleTenant, appName: applicationId });

  const [history] = React.useState(() => createBrowserHistory(possibleTenant));

  const client = configureCogniteSDKClient(applicationId, {
    baseUrl: cdfApiBaseUrl,
  });

  const {
    REACT_APP_E2E_MODE: E2ETestingMode,
    REACT_APP_API_KEY: apiKey,
    REACT_APP_API_KEY_PROJECT: project,
    REACT_APP_ACCESS_TOKEN: testingAccessToken,
  } = process.env;

  const initialTenantOrApiKeyTenant = project || initialTenant;

  React.useEffect(() => {
    if (E2ETestingMode) {
      if (apiKey) {
        client.loginWithApiKey({
          apiKey,
          project: initialTenantOrApiKeyTenant,
        });
      }

      if (testingAccessToken) {
        client.loginWithOAuth({
          accessToken: testingAccessToken,
          project: initialTenantOrApiKeyTenant,
          onAuthenticate: async (login) => {
            login.skip();
          },
        });
      }
    }
  }, []); // no deps, this only runs once.

  // console.log('Gate info:', {
  //   initialTenantOrApiKeyTenant,
  //   initialTenant,
  //   possibleTenant,
  // });

  // this will only ever run locally
  // when deployed it will use the hosted 'Tenant Selector' application
  // which is served by FAS when browsing to '/'
  if (!possibleTenant) {
    if (!initialTenantOrApiKeyTenant) {
      return <TenantSelector sidecar={sidecar} />;
    }

    history.push(`/${initialTenantOrApiKeyTenant}/`);
    document.location.reload();

    return <Loader />;
  }

  let ChosenAuthContainer = AuthContainer;

  if (E2ETestingMode) {
    ChosenAuthContainer = AuthContainerForApiKeyMode;
  }

  const authError = () => {
    document.location.href = '/';
  };

  return (
    <ConditionalLoopDetector disabled={disableLoopDetector}>
      <ConditionalSentry disabled={disableSentry}>
        <TranslationWrapper disabled={disableTranslations}>
          <ChosenAuthContainer
            sidecar={sidecar}
            sdkClient={client}
            authError={authError}
            tenant={initialTenant}
          >
            <IntercomContainer
              sidecar={sidecar}
              intercomSettings={intercomSettings}
            >
              <ConditionalReduxProvider store={store}>
                <ErrorBoundary instanceId="container-root">
                  <Router history={history}>{children}</Router>
                </ErrorBoundary>
              </ConditionalReduxProvider>
            </IntercomContainer>
          </ChosenAuthContainer>
        </TranslationWrapper>
      </ConditionalSentry>
    </ConditionalLoopDetector>
  );
};

// @ts-expect-error what is up? - Type 'undefined' is not assignable to type 'ReactChild'
export const Container = withI18nSuspense(RawContainer);

export const ContainerWithoutI18N = (props: Props) => (
  <RawContainer
    {...props}
    sidecar={{ ...props.sidecar, disableTranslations: true }}
  />
);
