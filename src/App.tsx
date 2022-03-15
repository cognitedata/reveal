import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';

import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
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
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';

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

  const project = getProject();
  const env = getEnv();

  return (
    <FlagProvider
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      appName="cdf-raw-explorer"
      projectName={getProject()}
    >
      <StyleSheetManager
        disableVendorPrefixes={process.env.NODE_ENV === 'development'}
      >
        <SDKProvider sdk={sdk}>
          <QueryClientProvider client={queryClient}>
            <GlobalStyles>
              <AntStyles>
                <SubAppWrapper title="Raw Explorer">
                  <AuthWrapper
                    loadingScreen={<Loader />}
                    login={() => loginAndAuthIfNeeded(project, env)}
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
    </FlagProvider>
  );
};

export default App;
