import React, { useEffect } from 'react';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from 'styled-components';
import { SDKProvider } from '@cognite/sdk-provider';
import GlobalStyle from 'styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getEnv,
  getProject,
} from '@cognite/cdf-utilities';
import RootApp from 'containers/App';
import AntStyles from 'components/AntStyles';
import { Loader } from 'components/Common';
import theme from './styles/theme';
import rootStyles from './styles/index.css';

export default () => {
  const env = getEnv();
  const project = getProject();
  const history = createBrowserHistory();

  const queryCache = new QueryCache({
    defaultConfig: {
      queries: {
        staleTime: 60 * 1000,
        cacheTime: 5 * 60 * 1000,
      },
    },
  });

  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
    };
  }, []);

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <AntStyles>
        <SubAppWrapper>
          <AuthWrapper
            loadingScreen={<Loader />}
            login={() => loginAndAuthIfNeeded(project, env)}
          >
            <SDKProvider sdk={sdk}>
              <ThemeProvider theme={theme}>
                <Router history={history}>
                  <Switch>
                    <Route path="/:tenant" component={RootApp} />
                  </Switch>
                </Router>
              </ThemeProvider>
              <GlobalStyle theme={theme} />
            </SDKProvider>
          </AuthWrapper>
        </SubAppWrapper>
      </AntStyles>
      <ReactQueryDevtools initialIsOpen={false} />
    </ReactQueryCacheProvider>
  );
};
