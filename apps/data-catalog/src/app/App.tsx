/* eslint-disable @cognite/no-number-z-index */
import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthContainer,
  createLink,
  getProject,
  isUsingUnifiedSignin,
} from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';

import AccessCheck from './AccessCheck';
import { translations } from './common/i18n';
import { DataSetsContextProvider } from './context';
import GlobalStyles from './styles/GlobalStyles';
import { trackUsage } from './utils';

const DataSetsList = lazy(() => import('./pages/DataSetsList/DataSetsList'));
const DataSetDetails = lazy(
  () => import('./pages/DataSetDetails/DataSetDetails')
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});

const App = () => {
  const appName = 'cdf-data-catalog';
  const projectName = getProject();
  const flagProviderApiToken = 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';
  const tenant = isUsingUnifiedSignin() ? `/cdf/${projectName}` : projectName;

  useEffect(() => {
    trackUsage({ e: 'data.sets.navigate' });
  }, []);

  return (
    <I18nWrapper translations={translations} defaultNamespace="data-catalog">
      <FlagProvider
        apiToken={flagProviderApiToken}
        appName={appName}
        projectName={projectName}
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <ToastContainer style={{ zIndex: 99999 }} />
            <AuthContainer
              title="Data catalog"
              sdk={sdk}
              login={loginAndAuthIfNeeded}
            >
              <DataSetsContextProvider>
                <BrowserRouter>
                  <Suspense fallback={<Loader />}>
                    <AccessCheck>
                      <Routes>
                        <Route
                          path={`${tenant}/:appPath`}
                          element={<DataSetsList />}
                        />
                        <Route
                          path={`${tenant}/:appPath/data-set/:dataSetId`}
                          element={<DataSetDetails />}
                        />
                        <Route
                          path={`${tenant}/data-sets`}
                          element={
                            <Navigate
                              replace
                              to={createLink('/data-catalog')}
                            />
                          }
                        />
                      </Routes>
                    </AccessCheck>
                  </Suspense>
                </BrowserRouter>
              </DataSetsContextProvider>
            </AuthContainer>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </FlagProvider>
    </I18nWrapper>
  );
};

export default App;
