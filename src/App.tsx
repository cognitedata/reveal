import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import GlobalStyles from 'styles/GlobalStyles';
import Home from 'pages/Home';
import { translations } from 'common/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

const App = () => {
  const appName = 'cdf-access-management';
  const projectName = getProject();
  const env = getEnv();

  return (
    <I18nWrapper
      flagProviderProps={{
        apiToken: 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE',
        appName,
        projectName,
      }}
      translations={translations}
      defaultNamespace="access-management"
    >
      <QueryClientProvider client={queryClient}>
        <GlobalStyles>
          <SubAppWrapper title="Access Management">
            <AuthWrapper
              loadingScreen={<Loader />}
              login={() => loginAndAuthIfNeeded(projectName, env)}
            >
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
            </AuthWrapper>
          </SubAppWrapper>
        </GlobalStyles>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </I18nWrapper>
  );
};

export default App;
