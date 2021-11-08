import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';

import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider'; // eslint-disable-line
import { createBrowserHistory } from 'history';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';

import RawExplorer from 'containers/RawExplorer';
import { setupMixpanel } from 'utils/config';
import GlobalStyles from 'styles/GlobalStyles';
import { AntStyles } from 'styles/AntStyles';

import sdk from 'utils/sdkSingleton';

setupMixpanel();

const App = () => {
  const history = createBrowserHistory();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000,
      },
    },
  });

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
                    <Route
                      path={[
                        '/:project/:appPath/:database/:table',
                        '/:project/:appPath/:database',
                        '/:project/:appPath',
                      ]}
                      component={RawExplorer}
                    />
                  </Switch>
                </Router>
              </AuthWrapper>
            </SubAppWrapper>
          </AntStyles>
        </GlobalStyles>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SDKProvider>
  );
};

export default App;
