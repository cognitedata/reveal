import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createBrowserHistory } from 'history';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthContainer, PageTitle } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

import ErrorBoundary from './components/ErrorBoundary';
import { ModelRoutes } from './ModelRoutes';
import configureStore from './store';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';
import { APP_TITLE, projectName } from './utils';

export const App = () => {
  const history = createBrowserHistory();
  const store = configureStore(history);
  const subAppName = 'cdf-3d-management';
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <GlobalStyles>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <FlagProvider
              appName={subAppName}
              apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
              projectName={projectName}
            >
              <AuthContainer
                title={APP_TITLE}
                sdk={sdk}
                login={loginAndAuthIfNeeded}
              >
                <Provider store={store}>
                  <BrowserRouter>
                    <>
                      <PageTitle title={APP_TITLE} />
                      <ReactQueryDevtools initialIsOpen={false} />
                      <ModelRoutes />
                    </>
                  </BrowserRouter>
                </Provider>
              </AuthContainer>
            </FlagProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GlobalStyles>
  );
};

export default App;
