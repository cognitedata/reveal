import GlobalStyles from 'styles/GlobalStyles';
import React, { Suspense, useMemo } from 'react';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
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

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <QueryClientProvider client={queryClient}>
      <GlobalStyles>
        <AuthWrapper
          loadingScreen={<Loader />}
          login={() => loginAndAuthIfNeeded(project, env)}
        >
          <SDKProvider sdk={sdk}>
            <FlagProvider
              apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
              appName="cdf-data-sets"
              projectName={projectName()}
            >
              <SubAppWrapper>
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
              </SubAppWrapper>
            </FlagProvider>
          </SDKProvider>
        </AuthWrapper>
      </GlobalStyles>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
