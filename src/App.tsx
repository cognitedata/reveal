import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from 'styled-components';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { ClientSDKProvider } from '@cognite/gearbox/dist/components/ClientSDKProvider';
import GlobalStyle from 'styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import sdk from 'sdk-singleton';
import { SubAppWrapper, AuthWrapper } from '@cognite/cdf-utilities';
import { SDKProvider } from 'context/sdk';
import RootApp from 'containers/App';
import AntStyles from 'components/AntStyles';
import { Loader } from 'components/Common';
import { setSDK } from 'utils/SDK';
import { CogniteResourceProvider } from '@cognite/cdf-resources-store';
import collapseStyle from 'rc-collapse/assets/index.css';
import theme from './styles/theme';
import { setupSentry } from './utils/sentry';
import rootStyles from './styles/index.css';
import store from './store/index';

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
    setSDK(sdk);
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
            loadingScreen={<Loader />}
            subAppName="data-exploration"
          >
            <ClientSDKProvider client={sdk}>
              <SDKProvider sdk={sdk}>
                <ThemeProvider theme={theme}>
                  <CogniteResourceProvider sdk={sdk} store={store}>
                    <Router history={history}>
                      <Switch>
                        <Route path="/:tenant" component={RootApp} />
                      </Switch>
                    </Router>
                  </CogniteResourceProvider>
                </ThemeProvider>
                <GlobalStyle theme={theme} />
              </SDKProvider>
            </ClientSDKProvider>
          </AuthWrapper>
        </SubAppWrapper>
      </AntStyles>
      <ReactQueryDevtools initialIsOpen={false} />
    </ReactQueryCacheProvider>
  );
};
