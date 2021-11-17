import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import GlobalStyle from 'app/styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { CogniteClient } from '@cognite/sdk';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { SubAppWrapper, AuthWrapper } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';
import RootApp from 'app/containers/App';
import AntStyles from 'app/styles/AntStyles';
import { Loader } from '@cognite/cogs.js';
import collapseStyle from 'rc-collapse/assets/index.css';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';
import theme from './styles/theme';
import rootStyles from './styles/index.css';

export default () => {
  const tenant = window.location.pathname.split('/')[1];
  const history = createBrowserHistory();

  if (!tenant) {
    throw new Error('tenant missing');
  }

  const queryClient = new QueryClient({
    defaultOptions: {
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
    datePickerStyle.use();
    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      collapseStyle.unuse();
      datePickerStyle.unuse();
    };
  }, []);

  return (
    <SDKProvider sdk={(sdkv3 as unknown) as CogniteClient}>
      <QueryClientProvider client={queryClient}>
        <AntStyles>
          <SubAppWrapper padding={false}>
            <AuthWrapper
              showLoader
              includeGroups
              loadingScreen={<Loader darkMode={false} />}
              subAppName="data-exploration"
            >
              <ThemeProvider theme={theme}>
                <FlagProvider
                  apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                  appName="data-exploration"
                  projectName={tenant}
                  remoteAddress={window.location.hostname}
                  disableMetrics
                  refreshInterval={86400}
                >
                  <Router history={history}>
                    <Switch>
                      <Route path="/:tenant" component={RootApp} />
                    </Switch>
                  </Router>
                </FlagProvider>
              </ThemeProvider>
              <GlobalStyle theme={theme} />
            </AuthWrapper>
          </SubAppWrapper>
        </AntStyles>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SDKProvider>
  );
};
