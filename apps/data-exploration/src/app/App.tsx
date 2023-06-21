import { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import collapseStyle from 'rc-collapse/assets/index.css';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';
import { RecoilRoot } from 'recoil';
import { RecoilDevTools } from 'recoil-gear';
import { RecoilURLSyncJSON } from 'recoil-sync';

import sdk from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { ErrorBoundary } from '@cognite/react-errors';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import RootApp from '@data-exploration-app/containers/App';
import GlobalStyle from '@data-exploration-app/styles/global-styles';
import AntStyles from '@data-exploration-app/styles/Styles';

import { AuthContainer } from './AuthContainer';
import rootStyles from './styles/index.css';
import theme from './styles/theme';

export default () => {
  const project = getProject();

  if (!project) {
    throw new Error('project missing');
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
    <AntStyles>
      <SDKProvider sdk={sdk}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthContainer>
              <ThemeProvider theme={theme}>
                <FlagProvider
                  apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                  appName="data-exploration"
                  projectName={project}
                  remoteAddress={window.location.hostname}
                  disableMetrics
                  refreshInterval={86400}
                >
                  <RecoilRoot>
                    <RecoilURLSyncJSON location={{ part: 'queryParams' }}>
                      <BrowserRouter>
                        <Routes>
                          <Route path="/:tenant/*" element={<RootApp />} />
                        </Routes>
                      </BrowserRouter>
                      <RecoilDevTools />
                    </RecoilURLSyncJSON>
                  </RecoilRoot>
                </FlagProvider>
              </ThemeProvider>
              <GlobalStyle theme={theme} />
            </AuthContainer>
            <ToastContainer />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ErrorBoundary>
      </SDKProvider>
    </AntStyles>
  );
};
