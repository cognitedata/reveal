import React, { useEffect } from 'react';
import Home from 'pages/Home';
import {
  AuthWrapper,
  SubAppWrapper,
  UserContext,
} from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { Loader } from '@cognite/cogs.js';
import { ThemeProvider } from 'styled-components';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import collapseStyle from 'rc-collapse/assets/index.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppEnvProvider } from 'hooks/useAppEnv';
import { Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { FlagProvider } from '@cognite/react-feature-flags';
// eslint-disable-next-line
import { SDKProvider } from '@cognite/sdk-provider';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { CogniteClient } from '@cognite/sdk';
import { getCdfEnvFromUrl, projectName } from 'utils/config';
import isObject from 'lodash/isObject';
import theme from './styles/theme';
import AppScopeStyles from './styles/AppScopeStyles';
import rootStyles from './styles/index.css';

const App = () => {
  const project = projectName();
  const { origin } = window.location;
  const cdfEnv = getCdfEnvFromUrl();
  const history = createBrowserHistory();

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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (isObject(error) && 'status' in error) {
            switch ((error as any).status) {
              case 400:
              case 401:
              case 403:
              case 404:
              case 409:
                return false;
            }
          }
          return failureCount < 3;
        },
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={(sdkv3 as unknown) as CogniteClient}>
        <AppScopeStyles>
          <SubAppWrapper padding={false}>
            <AuthWrapper
              showLoader
              includeGroups
              loadingScreen={<Loader />}
              subAppName="cdf-integrations-ui"
            >
              <UserContext.Consumer>
                {(user) => (
                  <FlagProvider
                    apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                    appName="cdf-console"
                    projectName={user.project}
                  >
                    <ThemeProvider theme={theme}>
                      <AppEnvProvider
                        cdfEnv={cdfEnv}
                        project={project}
                        origin={origin}
                      >
                        <Router history={history}>
                          <Switch>
                            <Route path="/:tenant" component={Home} />
                          </Switch>
                        </Router>
                      </AppEnvProvider>
                    </ThemeProvider>
                    <GlobalStyles theme={theme} />
                  </FlagProvider>
                )}
              </UserContext.Consumer>
            </AuthWrapper>
          </SubAppWrapper>
        </AppScopeStyles>
      </SDKProvider>
    </QueryClientProvider>
  );
};

export default App;
