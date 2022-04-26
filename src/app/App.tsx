import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import GlobalStyle from 'app/styles/global-styles';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getProject,
  getEnv,
} from '@cognite/cdf-utilities';
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
  const env = getEnv();
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
    <SDKProvider sdk={sdk}>
      <QueryClientProvider client={queryClient}>
        <AntStyles>
          <SubAppWrapper padding={false}>
            <AuthWrapper
              loadingScreen={<Loader darkMode={false} />}
              login={() => loginAndAuthIfNeeded(project, env)}
            >
              <ThemeProvider theme={theme}>
                <FlagProvider
                  apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                  appName="data-exploration"
                  projectName={project}
                  remoteAddress={window.location.hostname}
                  disableMetrics
                  refreshInterval={86400}
                >
                  <BrowserRouter>
                    <Routes>
                      <Route path="/:tenant/*" element={<RootApp />} />
                    </Routes>
                  </BrowserRouter>
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
