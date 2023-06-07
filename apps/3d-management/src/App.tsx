import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import {
  AuthWrapper,
  getEnv,
  getProject,
  PageTitle,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { Provider } from 'react-redux';
import configureStore from 'store';
import theme from 'styles/theme';
import { ModelRoutes } from 'ModelRoutes';
import { Loader } from '@cognite/cogs.js';
import { createBrowserHistory } from 'history';
import { APP_TITLE, projectName } from 'utils';
import { FlagProvider } from '@cognite/react-feature-flags';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

export const App = () => {
  const history = createBrowserHistory();
  const store = configureStore(history);
  const subAppName = 'cdf-3d-management';
  const project = getProject();
  const env = getEnv();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  return (
    <GlobalStyles>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper
          loadingScreen={<Loader />}
          login={() => loginAndAuthIfNeeded(project, env)}
        >
          <SDKProvider sdk={sdk}>
            <Provider store={store}>
              <ThemeProvider theme={theme}>
                <BrowserRouter>
                  <FlagProvider
                    appName={subAppName}
                    apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                    projectName={projectName}
                  >
                    <SubAppWrapper title={APP_TITLE}>
                      <ThreeDAppWrapper>
                        <ErrorBoundary>
                          <PageTitle title={APP_TITLE} />
                          <ReactQueryDevtools initialIsOpen={false} />
                          <ModelRoutes />
                        </ErrorBoundary>
                      </ThreeDAppWrapper>
                    </SubAppWrapper>
                  </FlagProvider>
                </BrowserRouter>
              </ThemeProvider>
            </Provider>
          </SDKProvider>
        </AuthWrapper>
      </QueryClientProvider>
    </GlobalStyles>
  );
};

export default App;

const ThreeDAppWrapper = styled.div`
  padding: 24px 40px;
`;
