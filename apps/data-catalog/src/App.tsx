import GlobalStyles from 'styles/GlobalStyles';
import { lazy, Suspense, useEffect } from 'react';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { createLink, getProject } from '@cognite/cdf-utilities';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { DataSetsContextProvider } from 'context';
import AccessCheck from 'AccessCheck';
import { translations } from 'common/i18n';
import { FlagProvider } from '@cognite/react-feature-flags';
import { trackUsage } from 'utils';
import { AuthContainer } from './AuthContainer';

const DataSetsList = lazy(() => import('pages/DataSetsList/DataSetsList'));
const DataSetDetails = lazy(
  () => import('pages/DataSetDetails/DataSetDetails')
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});

const App = () => {
  const appName = 'cdf-data-catalog';
  const projectName = getProject();
  const flagProviderApiToken = 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';

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
            <AuthContainer>
              <DataSetsContextProvider>
                <BrowserRouter>
                  <Suspense fallback={<Loader />}>
                    <AccessCheck>
                      <Routes>
                        <Route
                          path="/:tenant/:appPath"
                          element={<DataSetsList />}
                        />
                        <Route
                          path="/:tenant/:appPath/data-set/:dataSetId"
                          element={<DataSetDetails />}
                        />
                        {/* We used to use the /data-sets route, now we're redirecting */}
                        {/* to /data-catalog instead, this basically sets up a redirect. */}
                        <Route
                          path="/:tenant/data-sets"
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
