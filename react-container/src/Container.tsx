import * as React from 'react';
import { Router } from 'react-router-dom';
import { Store } from 'redux';

import { withI18nSuspense } from '@cognite/react-i18n';
import { ErrorBoundary } from '@cognite/react-errors';
import { TenantSelector, SidecarConfig } from '@cognite/react-tenant-selector';
import { Loader } from '@cognite/cogs.js';

import {
  AuthContainer,
  AuthContainerForApiKeyMode,
  TranslationWrapper,
} from './components';
import { configureCogniteSDKClient, createBrowserHistory } from './internal';
import { storage, getTenantInfo } from './utils';
import { ConditionalReduxProvider } from './providers';

interface Props {
  store?: Store;
  children: React.ReactChild;
  sidecar: SidecarConfig;
}
const RawContainer: React.FC<Props> = ({ children, store, sidecar }) => {
  const [possibleTenant, initialTenant] = getTenantInfo(window.location);

  const { applicationId, cdfApiBaseUrl, disableTranslations } = sidecar;

  storage.init({ tenant: possibleTenant, appName: applicationId });

  const [history] = React.useState(() => createBrowserHistory(possibleTenant));

  const client = configureCogniteSDKClient(applicationId, {
    baseUrl: cdfApiBaseUrl,
  });

  const {
    REACT_APP_API_KEY: apiKey,
    REACT_APP_API_KEY_PROJECT: project,
  } = process.env;

  const initialTenantOrApiKeyTenant = project || initialTenant;

  React.useEffect(() => {
    if (apiKey) {
      client.loginWithApiKey({
        apiKey,
        project: project || '',
      });
    }
  }, []);

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

  if (apiKey) {
    ChosenAuthContainer = AuthContainerForApiKeyMode;
  }

  const authError = () => {
    document.location.href = '/';
  };

  return (
    <TranslationWrapper disabled={disableTranslations}>
      <ChosenAuthContainer
        sidecar={sidecar}
        sdkClient={client}
        authError={authError}
        tenant={initialTenant}
      >
        <ConditionalReduxProvider store={store}>
          <ErrorBoundary instanceId="container-root">
            <Router history={history}>{children}</Router>
          </ErrorBoundary>
        </ConditionalReduxProvider>
      </ChosenAuthContainer>
    </TranslationWrapper>
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
