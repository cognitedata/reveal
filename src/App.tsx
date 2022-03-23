import GlobalStyles from 'styles/GlobalStyles';
import React, { Suspense, useMemo } from 'react';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  I18nWrapper,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { createHistory } from 'utils/history';
import { FlagProvider } from '@cognite/react-feature-flags';
import { projectName } from 'utils/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Route, Router, Switch } from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import { DataSetsContextProvider } from 'context';
import AccessCheck from 'AccessCheck';
import { languages } from 'common/i18n';
import i18next from 'i18next';

const App = () => {
  const project = getProject();
  const env = getEnv();
  const history = createHistory();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  const handleLanguageChange = (language: string) => {
    if (languages.includes(language)) {
      return i18next.changeLanguage(language);
    }
    return Promise.resolve();
  };

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <FlagProvider
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      appName="cdf-data-sets"
      projectName={projectName()}
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
                    <Router history={history}>
                      <Suspense fallback={<Loader />}>
                        <Switch>
                          <AccessCheck>
                            <Route
                              path="/:tenant/:appPath"
                              component={useMemo(
                                () =>
                                  React.lazy(
                                    () =>
                                      import('pages/DataSetsList/DataSetsList')
                                  ),
                                []
                              )}
                              exact
                            />
                            <Route
                              path="/:tenant/:appPath/data-set/:dataSetId"
                              component={useMemo(
                                () =>
                                  React.lazy(
                                    () =>
                                      import(
                                        'pages/DataSetDetails/DataSetDetails'
                                      )
                                  ),
                                []
                              )}
                            />
                          </AccessCheck>
                        </Switch>
                      </Suspense>
                    </Router>
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

export default App;
