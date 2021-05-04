import GlobalStyles from 'styles/GlobalStyles';

import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import sdk from '@cognite/cdf-sdk-singleton';

import Home from 'pages/Home';

const App = () => {
  const client = new QueryClient();
  return (
    <GlobalStyles>
      <SubAppWrapper>
        <AuthWrapper
          subAppName="access-management"
          showLoader
          loadingScreen={<Loader />}
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
