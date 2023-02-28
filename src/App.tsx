import GlobalStyles from 'styles/GlobalStyles';
import { lazy, Suspense, useEffect } from 'react';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { createLink, getProject, SubAppWrapper } from '@cognite/cdf-utilities';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';
import { Loader } from '@cognite/cogs.js';
import { DataSetsContextProvider } from 'context';
import AccessCheck from 'AccessCheck';
import { translations } from 'common/i18n';
import { FlagProvider } from '@cognite/react-feature-flags';
import { trackUsage } from 'utils';
import { AuthContainer } from './AuthContainer';
import { AuthContainerMock } from './AuthContainerMock';

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

  useEffect(() => {
    trackUsage({ e: 'data.sets.navigate' });
  }, []);

  const AuthContainerWrapper = process.env.REACT_APP_IS_MOCK
    ? AuthContainerMock
    : AuthContainer;

  return (
    <I18nWrapper translations={translations} defaultNamespace="data-catalog">
      <FlagProvider
        apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
        appName={appName}
        projectName={projectName}
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <SubAppWrapper title="Data Catalog">
              <AuthContainerWrapper>
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
              </AuthContainerWrapper>
            </SubAppWrapper>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </FlagProvider>
    </I18nWrapper>
  );
};

export default App;
