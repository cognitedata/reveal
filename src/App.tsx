import GlobalStyles from 'styles/GlobalStyles';

import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';

import Home from 'pages/Home';
import { projectName, getCdfEnvFromUrl } from 'utils/utils';

const App = () => {
  const project = projectName();
  const env = getCdfEnvFromUrl() || undefined;
  const client = new QueryClient();
  return (
    <GlobalStyles>
      <SubAppWrapper>
        <AuthWrapper
          loadingScreen={<Loader />}
          login={() => loginAndAuthIfNeeded(project, env)}
        >
          <QueryClientProvider client={client}>
            <SDKProvider sdk={sdk}>
              <Router>
                <Switch>
                  <Route
                    path={['/:tenant/:path/:page', '/:tenant/:path']}
                    component={Home}
                  />
                </Switch>
              </Router>
            </SDKProvider>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </AuthWrapper>
      </SubAppWrapper>
    </GlobalStyles>
  );
};

export default App;
