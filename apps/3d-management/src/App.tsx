import React from 'react';
import { ThemeProvider } from 'styled-components';
import { AuthWrapper, PageTitle, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'src/styles/GlobalStyles';
import { Provider } from 'react-redux';
import configureStore from 'src/store';
import { ConnectedRouter } from 'connected-react-router';
import theme from 'src/styles/theme';
import { Routes } from 'src/Routes';
import { setupUserTracking } from 'src/utils/userTracking';
import { Loader } from '@cognite/cogs.js';
import { createBrowserHistory } from 'history';
import { APP_TITLE, projectName } from 'src/utils';
import { FlagProvider } from '@cognite/react-feature-flags';
import { ReactQueryDevtools } from 'react-query-devtools';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import ErrorBoundary from './components/ErrorBoundary';

setupUserTracking();
export const App = () => {
  const history = createBrowserHistory();
  const store = configureStore(history, {});
  const subAppName = 'cdf-3d-management';
  const queryCache = new QueryCache();

  return (
    <ErrorBoundary>
      <GlobalStyles>
        <AuthWrapper
          subAppName={subAppName}
          showLoader
          includeGroups
          loadingScreen={<Loader />}
        >
          <Provider store={store}>
            <ThemeProvider theme={theme}>
              <ConnectedRouter history={history}>
                <FlagProvider
                  appName={subAppName}
                  apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                  projectName={projectName}
                >
                  <SubAppWrapper>
                    <PageTitle title={APP_TITLE} />
                    <ReactQueryCacheProvider queryCache={queryCache}>
                      <ReactQueryDevtools initialIsOpen={false} />
                      <Routes />
                    </ReactQueryCacheProvider>
                  </SubAppWrapper>
                </FlagProvider>
              </ConnectedRouter>
            </ThemeProvider>
          </Provider>
        </AuthWrapper>
      </GlobalStyles>
    </ErrorBoundary>
  );
};

export default App;
