import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';

import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider'; // eslint-disable-line
import { createBrowserHistory } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { RawExplorerProvider } from 'contexts';
import GlobalStyles from 'styles/GlobalStyles';
import { AntStyles } from 'styles/AntStyles';
import { setupMixpanel } from 'utils/config';
import sdk from 'utils/sdkSingleton';
import RawExplorer from 'containers/RawExplorer';

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
    <StyleSheetManager
      disableVendorPrefixes={process.env.NODE_ENV === 'development'}
    >
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
                    <RawExplorerProvider>
                      <Switch>
                        <Route
                          path={['/:project/:appPath']}
                          component={RawExplorer}
                        />
                      </Switch>
                    </RawExplorerProvider>
                  </Router>
                </AuthWrapper>
              </SubAppWrapper>
            </AntStyles>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SDKProvider>
    </StyleSheetManager>
  );
};

export default App;
