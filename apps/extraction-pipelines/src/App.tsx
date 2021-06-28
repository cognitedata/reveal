import React, { useEffect } from 'react';
import Home from 'pages/Home';
import { AuthWrapper, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { Loader } from '@cognite/cogs.js';
import { ThemeProvider } from 'styled-components';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import collapseStyle from 'rc-collapse/assets/index.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppEnvProvider } from 'hooks/useAppEnv';
import { Route, Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
// eslint-disable-next-line
import { SDKProvider } from '@cognite/sdk-provider';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { CogniteClient } from '@cognite/sdk';
import { getCdfEnvFromUrl, projectName } from 'utils/config';
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
            </AuthWrapper>
          </SubAppWrapper>
        </AppScopeStyles>
      </SDKProvider>
    </QueryClientProvider>
  );
};

export default App;
