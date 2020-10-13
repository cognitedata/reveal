import React from 'react';
import { ThemeProvider } from 'styled-components';
import { AuthWrapper, PageTitle, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { Provider } from 'react-redux';
import configureStore from 'store';
import { ConnectedRouter } from 'connected-react-router';
import theme from 'styles/theme';
import { Routes } from 'Routes';
import { setupUserTracking } from 'utils/userTracking';
import { Loader } from '@cognite/cogs.js';
import { createBrowserHistory } from 'history';
import { APP_TITLE } from 'utils';
import ErrorBoundary from './components/ErrorBoundary';

setupUserTracking();

export const App = () => {
  const history = createBrowserHistory();
  const store = configureStore(history, {});

  return (
    <ErrorBoundary>
      <GlobalStyles>
        <AuthWrapper
          subAppName="cdf-3d-management"
          showLoader
          includeGroups
          loadingScreen={<Loader />}
        >
          <Provider store={store}>
            <ThemeProvider theme={theme}>
              <ConnectedRouter history={history}>
                <SubAppWrapper>
                  <PageTitle title={APP_TITLE} />
                  <Routes />
                </SubAppWrapper>
              </ConnectedRouter>
            </ThemeProvider>
          </Provider>
        </AuthWrapper>
      </GlobalStyles>
    </ErrorBoundary>
  );
};

export default App;
