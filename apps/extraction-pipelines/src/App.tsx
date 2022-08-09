import { useEffect } from 'react';
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
import { QueryClient, QueryClientProvider } from 'react-query';

import { Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { translations } from 'common/i18n';

import { ThemeProvider } from 'styled-components';
import AppScopeStyles from './styles';
import GlobalStyles from 'styles/GlobalStyles';
import theme from 'styles/theme';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import collapseStyle from 'rc-collapse/assets/index.css';
import rootStyles from 'styles/index.css';

import Home from 'pages/Home';
import { EXTRACTION_PIPELINES } from 'utils/constants';
import React from 'react';
import { AppEnvProvider } from 'hooks/useAppEnv';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

const App = () => {
  const appName = 'cdf-integrations-ui';
  const projectName = getProject();
  const env = getEnv();
  const history = createBrowserHistory();
  const { origin } = window.location;

  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    collapseStyle.use();
    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      collapseStyle.unuse();
    };
  }, []);

  return (
    <I18nWrapper
      flagProviderProps={{
        apiToken: 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE',
        appName,
        projectName,
      }}
      translations={translations}
      defaultNamespace="cdf-integrations-ui"
    >
      <QueryClientProvider client={queryClient}>
        <AppScopeStyles>
          <SubAppWrapper title={EXTRACTION_PIPELINES}>
            <AuthWrapper
              loadingScreen={<Loader />}
              login={() => loginAndAuthIfNeeded(projectName, env)}
            >
              <SDKProvider sdk={sdk}>
                <ThemeProvider theme={theme}>
                  {/* remove this  */}
                  <AppEnvProvider
                    cdfEnv={env}
                    project={projectName}
                    origin={origin}
                  >
                    <Router history={history}>
                      <Switch>
                        <Route path="/:tenant" component={Home} />
                      </Switch>
                    </Router>
                  </AppEnvProvider>
                </ThemeProvider>
                <GlobalStyles />
              </SDKProvider>
            </AuthWrapper>
          </SubAppWrapper>
        </AppScopeStyles>
      </QueryClientProvider>
    </I18nWrapper>
  );
};

export default App;
