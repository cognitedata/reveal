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

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthContainer,
  getProject,
  isUsingUnifiedSignin,
} from '@cognite/cdf-utilities';
import { ToastContainer } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { ErrorBoundary } from '@cognite/react-errors';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import { translations } from '../i18n';

import AntStyles from './/styles/Styles';
import RootApp from './containers/App';
import GlobalStyle from './styles/global-styles';
import rootStyles from './styles/index.css';
import theme from './styles/theme';

export default () => {
  const project = getProject();
  const baseUrl = isUsingUnifiedSignin() ? `/cdf/${project}` : `/${project}`;

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
            <AuthContainer
              title="Data Exploration"
              sdk={sdk}
              login={loginAndAuthIfNeeded}
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
                  <RecoilRoot>
                    <RecoilURLSyncJSON location={{ part: 'queryParams' }}>
                      <I18nWrapper
                        translations={translations}
                        defaultNamespace="data-exploration"
                      >
                        <BrowserRouter>
                          <Routes>
                            <Route
                              path={`${baseUrl}/*`}
                              element={<RootApp />}
                            />
                          </Routes>
                        </BrowserRouter>
                        <RecoilDevTools />
                      </I18nWrapper>
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
