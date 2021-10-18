import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';

import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider'; // eslint-disable-line
import { createBrowserHistory } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';

import RootApp from 'containers/App';
import { setupMixpanel } from 'utils/config';
import GlobalStyles from 'styles/GlobalStyles';
import { AntStyles } from 'styles/AntStyles';

import sdk from 'utils/sdkSingleton';

setupMixpanel();

const history = createBrowserHistory();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

const App = () => {
  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <SDKProvider sdk={sdk}>
      <QueryClientProvider client={queryClient}>
        <GlobalStyles>
          <AntStyles>
            <SubAppWrapper padding={false}>
              <AuthWrapper
                loadingScreen={<Loader />}
                showLoader
                subAppName="raw-explorer"
              >
                <Router history={history}>
                  <Switch>
                    <Route path="/:project/raw-explorer" component={RootApp} />
                    <Route
                      path="/:project/raw-explorer/:dbName"
                      component={RootApp}
                    />
                    <Route
                      path="/:project/raw-explorer/:dbName/:tablaName"
                      component={RootApp}
                    />
                  </Switch>
                </Router>
              </AuthWrapper>
            </SubAppWrapper>
          </AntStyles>
        </GlobalStyles>
      </QueryClientProvider>
    </SDKProvider>
  );
};

export default App;
