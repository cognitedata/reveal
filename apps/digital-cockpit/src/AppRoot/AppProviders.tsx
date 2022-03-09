import React, { Suspense, useContext } from 'react';
import { Router } from 'react-router-dom';
import { ApiClient, CdfClient, createApiClient, createClient } from 'utils';
import { TenantProvider } from 'providers/TenantProvider';
import { CdfClientProvider } from 'providers/CdfClientProvider';
import { ApiClientProvider } from 'providers/ApiClientProvider';
import { CDFExplorerProvider } from 'providers/CDFExplorerProvider';
import GlobalStyles from 'global-styles';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from 'store';
import { History } from 'history';
import { AuthProvider } from '@cognite/react-container';
import { HelpCenterContextProvider } from 'context/HelpCenterContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Sentry from '@sentry/browser';
import { useMetrics } from 'utils/metrics';

import { mockAuthState } from '../__mocks/auth';
import { PartialRootState } from '../store/types';

type Props = {
  children?: React.ReactNode;
  tenant: string;
  history: History;
  // Used for storybook and tests:
  initialState?: PartialRootState;
  isTesting?: boolean;
  mockCDFClient?: CdfClient;
  mockApiClient?: ApiClient;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const AppProviders: React.FC<Props> = ({
  children,
  tenant,
  history,
  initialState = {},
  isTesting = false,
  mockCDFClient,
  mockApiClient,
}: Props): JSX.Element => {
  const { client } = useContext(AuthProvider);
  const cdfClient = createClient(
    {
      appId: 'digital-cockpit',
      dataSetName: 'digital-cockpit',
    },
    client
  );
  const apiClient = createApiClient(
    { appId: 'digital-cockpit', project: tenant },
    client
  );
  const store = configureStore(initialState);
  const cdfExplorerMetrics = useMetrics('CDFExplorer');

  if (isTesting) {
    return (
      <AuthProvider.Provider value={mockAuthState}>
        <QueryClientProvider client={queryClient}>
          <ReduxProvider store={store}>
            <CdfClientProvider client={mockCDFClient || cdfClient}>
              <CDFExplorerProvider
                client={mockCDFClient?.cogniteClient || cdfClient.cogniteClient}
              >
                <ApiClientProvider apiClient={mockApiClient || apiClient}>
                  <TenantProvider tenant={tenant}>
                    <HelpCenterContextProvider>
                      <Suspense fallback={<div> loading </div>}>
                        <GlobalStyles />
                        <Router history={history}>{children}</Router>
                      </Suspense>
                    </HelpCenterContextProvider>
                  </TenantProvider>
                </ApiClientProvider>
              </CDFExplorerProvider>
            </CdfClientProvider>
          </ReduxProvider>
        </QueryClientProvider>
      </AuthProvider.Provider>
    );
  }

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <CdfClientProvider client={cdfClient}>
          <CDFExplorerProvider
            client={cdfClient.cogniteClient}
            handleError={(e) => Sentry.captureException(e)}
            trackMetrics={cdfExplorerMetrics.track}
          >
            <ApiClientProvider apiClient={apiClient}>
              <TenantProvider tenant={tenant}>
                <HelpCenterContextProvider>
                  <GlobalStyles />
                  <Router history={history}>{children}</Router>
                </HelpCenterContextProvider>
              </TenantProvider>
            </ApiClientProvider>
          </CDFExplorerProvider>
        </CdfClientProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
};

export default AppProviders;
