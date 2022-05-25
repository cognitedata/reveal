import GlobalStyles from 'styles/GlobalStyles';
import { lazy, Suspense } from 'react';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  setupTranslations,
  I18nWrapper,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import { DataSetsContextProvider } from 'context';
import AccessCheck from 'AccessCheck';
import { languages, translations } from 'common/i18n';
import i18next from 'i18next';
import styled from 'styled-components';

const DataSetsList = lazy(() => import('pages/DataSetsList/DataSetsList'));
const DataSetDetails = lazy(
  () => import('pages/DataSetDetails/DataSetDetails')
);

const project = getProject();
const env = getEnv();

setupTranslations(translations);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});

const App = () => {
  const handleLanguageChange = (language: string) => {
    if (languages.includes(language)) {
      return i18next.changeLanguage(language);
    }
    return Promise.resolve();
  };

  return (
    <FlagProvider
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      appName="cdf-data-sets"
      projectName={project}
    >
      <I18nWrapper onLanguageChange={handleLanguageChange}>
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <SubAppWrapper title="Data Sets">
              <AuthWrapper
                loadingScreen={<Loader />}
                login={() => loginAndAuthIfNeeded(project, env)}
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
    </FlagProvider>
  );
};

const PageWrapper = styled.div`
  padding: 20px;

  @media (min-width: 992px) {
    padding: 20px 50px;
  }
`;

export default App;
