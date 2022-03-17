import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { StyleSheetManager } from 'styled-components';
import {
  AuthWrapper,
  SubAppWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';
import { createBrowserHistory } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';

import GlobalStyles from 'styles/GlobalStyles';
import { AntStyles } from 'styles/AntStyles';
import sdk from 'utils/sdkSingleton';
import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';

// import ExtractorDownloads from './Home';
import ExtractorDownloads from './Home/Extractors';

const App = () => {
  const history = createBrowserHistory();
  const env = getEnv();
  const project = getProject();
  const queryClient = new QueryClient();

  return (
    <FlagProvider
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      appName="cdf-raw-explorer"
      projectName={project}
    >
      <StyleSheetManager
        disableVendorPrefixes={process.env.NODE_ENV === 'development'}
      >
        <GlobalStyles>
          <AntStyles>
            <SubAppWrapper>
              <AuthWrapper
                loadingScreen={<Loader />}
                login={() => loginAndAuthIfNeeded(project, env)}
              >
                <QueryClientProvider client={queryClient}>
                  <SDKProvider sdk={sdk}>
                    <Router history={history}>
                      <Switch>
                        <Route
                          path={['/:project/:appPath']}
                          component={ExtractorDownloads}
                        />
                      </Switch>
                    </Router>
                  </SDKProvider>
                </QueryClientProvider>
              </AuthWrapper>
            </SubAppWrapper>
          </AntStyles>
        </GlobalStyles>
      </StyleSheetManager>
    </FlagProvider>
  );
};

export default App;
