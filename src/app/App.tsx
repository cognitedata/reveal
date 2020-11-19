import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from 'styled-components';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import GlobalStyle from 'app/styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import sdk from 'sdk-singleton';
import { SubAppWrapper, AuthWrapper } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';
import RootApp from 'app/containers/App';
import AntStyles from 'app/styles/AntStyles';
import { Loader } from '@cognite/cogs.js';
import collapseStyle from 'rc-collapse/assets/index.css';
import theme from './styles/theme';
import { setupSentry } from './utils/SetupSentry';
import rootStyles from './styles/index.css';

export default () => {
  const tenant = window.location.pathname.split('/')[1];
  const history = createBrowserHistory();

  if (!tenant) {
    throw new Error('tenant missing');
  }

  const queryCache = new QueryCache({
    defaultConfig: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    collapseStyle.use();
    setupSentry();
    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      collapseStyle.unuse();
    };
  }, []);

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <AntStyles>
        <SubAppWrapper padding={false}>
          <AuthWrapper
            showLoader
            includeGroups
            loadingScreen={<Loader darkMode={false} />}
            subAppName="data-exploration"
          >
            <SDKProvider sdk={sdk}>
              <ThemeProvider theme={theme}>
                <FlagProvider
                  apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                  appName="data-exploration"
                  projectName={tenant}
                  remoteAddress={window.location.hostname}
                >
                  <Router history={history}>
                    <Switch>
                      <Route path="/:tenant" component={RootApp} />
                    </Switch>
                  </Router>
                </FlagProvider>
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
