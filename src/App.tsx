import GlobalStyles from 'styles/GlobalStyles';
import React from 'react';
import sdk from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { createHistory } from 'utils/history';
import { FlagProvider } from '@cognite/react-feature-flags';
import { projectName } from 'utils/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Route, Router, Switch } from 'react-router-dom';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import { DataSetsContextProvider } from 'context';
import DataSetsList from './pages/DataSetsList/DataSetsList';
import DataSetDetails from './pages/DataSetDetails/DataSetDetails';

const App = () => {
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
          showLoader
          subAppName="data-sets"
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
                    <Switch>
                      <Route
                        path="/:tenant/new-data-sets"
                        component={DataSetsList}
                        exact
                      />
                      <Route
                        path="/:tenant/new-data-sets/data-set/:dataSetId"
                        component={DataSetDetails}
                      />
                    </Switch>
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
