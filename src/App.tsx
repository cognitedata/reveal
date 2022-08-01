import GlobalStyles from 'styles/GlobalStyles';
import { lazy, Suspense } from 'react';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import { DataSetsContextProvider } from 'context';
import AccessCheck from 'AccessCheck';
import { translations } from 'common/i18n';
import styled from 'styled-components';

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
  const appName = 'cdf-data-sets';
  const projectName = getProject();
  const env = getEnv();

  return (
    <I18nWrapper
      flagProviderProps={{
        apiToken: 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE',
        appName,
        projectName,
      }}
      translations={translations}
      defaultNamespace="data-sets"
    >
      <QueryClientProvider client={queryClient}>
        <GlobalStyles>
          <SubAppWrapper title="Data Sets">
            <AuthWrapper
              loadingScreen={<Loader />}
              login={() => loginAndAuthIfNeeded(projectName, env)}
            >
              <SDKProvider sdk={sdk}>
                <DataSetsContextProvider>
                  <PageWrapper>
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
                          </Routes>
                        </AccessCheck>
                      </Suspense>
                    </BrowserRouter>
                  </PageWrapper>
                </DataSetsContextProvider>
              </SDKProvider>
            </AuthWrapper>
          </SubAppWrapper>
        </GlobalStyles>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </I18nWrapper>
  );
};

const PageWrapper = styled.div`
  padding: 20px;

  @media (min-width: 992px) {
    padding: 20px 50px;
  }
`;

export default App;
