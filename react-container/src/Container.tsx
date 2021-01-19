import * as React from 'react';
import { Router } from 'react-router-dom';
import { Store } from 'redux';

import { withI18nSuspense, configureI18n } from '@cognite/react-i18n';
import { ErrorBoundary } from '@cognite/react-errors';
import { TenantSelector } from '@cognite/react-tenant-selector';
import { Loader } from '@cognite/cogs.js';

import { AuthContainer, AuthContainerForApiKeyMode } from './components';
import { createBrowserHistory } from './internal';
import { storage, getTenantInfo, configureCogniteSDKClient } from './utils';
import { ConditionalReduxProvider } from './providers';

configureI18n({
  useSuspense: true,
});

interface Props {
  appName: string;
  store?: Store;
  children: React.ReactChild;
}

const RawContainer: React.FC<Props> = ({ children, store, appName }: Props) => {
  const [possibleTenant, initialTenant] = getTenantInfo(window.location);

  storage.init({ tenant: possibleTenant, appName });

  const [history] = React.useState(() => createBrowserHistory(possibleTenant));

  const client = configureCogniteSDKClient();

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
      return <TenantSelector />;
    }

    history.push(`/${initialTenantOrApiKeyTenant}/`);
    document.location.reload();

    return <Loader />;
  }

  let AuthWrapper = AuthContainer;

  if (apiKey) {
    AuthWrapper = AuthContainerForApiKeyMode;
  }

  return (
    <AuthWrapper sdkClient={client} tenant={initialTenant}>
      <ConditionalReduxProvider store={store}>
        <ErrorBoundary instanceId="app-root">
          <Router history={history}>{children}</Router>
        </ErrorBoundary>
      </ConditionalReduxProvider>
    </AuthWrapper>
  );
};

export const Container = withI18nSuspense(RawContainer);
export const ContainerWithoutI18N = RawContainer;
