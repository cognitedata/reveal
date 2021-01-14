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
import theme from './styles/theme';
import AppScopeStyles from './styles/AppScopeStyles';
import rootStyles from './styles/index.css';
import { getCdfEnvFromUrl, projectName } from './utils/config';

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
      <AppScopeStyles>
        <SubAppWrapper padding={false}>
          <AuthWrapper
            showLoader
            includeGroups
            loadingScreen={<Loader />}
            subAppName="cdf-integrations-ui"
          >
            <ThemeProvider theme={theme}>
              <AppEnvProvider cdfEnv={cdfEnv} project={project} origin={origin}>
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
    </QueryClientProvider>
  );
};

export default App;
