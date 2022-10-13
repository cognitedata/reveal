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
import { FlagProvider } from '@cognite/react-feature-flags';

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
    <I18nWrapper translations={translations} defaultNamespace="data-sets">
      <FlagProvider
        apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
        appName={appName}
        projectName={projectName}
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
                  </DataSetsContextProvider>
                </SDKProvider>
              </AuthWrapper>
            </SubAppWrapper>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </FlagProvider>
    </I18nWrapper>
  );
};

export default App;
