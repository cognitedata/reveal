import React, { Suspense, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import isObject from 'lodash/isObject';
import collapseStyle from 'rc-collapse/assets/index.css';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import { translations } from './common/i18n';
import { AppEnvProvider } from './hooks/useAppEnv';
import CreateExtpipe from './pages/create/CreateExtpipe';
import ExtpipePage from './pages/Extpipe/ExtpipePage';
import Extpipes from './pages/Extpipes/Extpipes';
import { HostedExtractionPipelineDetails } from './pages/hosted-extraction-pipeline/HostedExtractionPipelineDetails';
import AppScopeStyles from './styles';
import antdTheme from './styles/antd-theme.less';
import GlobalStyles from './styles/GlobalStyles';
import rootStyles from './styles/index.css';
import theme from './styles/theme';
import { EXTRACTION_PIPELINES } from './utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isObject(error) && 'status' in error) {
          switch ((error as any).status) {
            case 400:
            case 401:
            case 403:
            case 404:
            case 409:
              return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const appName = 'cdf-integrations-ui';
  const projectName = getProject();
  const env = getEnv();
  const { origin } = window.location;

  useEffect(() => {
    cogsStyles.use();
    rootStyles.use();
    collapseStyle.use();
    antdTheme.use();
    return () => {
      cogsStyles.unuse();
      rootStyles.unuse();
      collapseStyle.unuse();
      antdTheme.unuse();
    };
  }, []);

  return (
    <I18nWrapper
      translations={translations}
      defaultNamespace="cdf-integrations-ui"
    >
      <FlagProvider
        apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
        appName={appName}
        projectName={projectName}
      >
        <QueryClientProvider client={queryClient}>
          <AppScopeStyles>
            <SubAppWrapper title={EXTRACTION_PIPELINES}>
              <AuthWrapper
                loadingScreen={<Loader />}
                login={() => loginAndAuthIfNeeded(projectName, env)}
              >
                <SDKProvider sdk={sdk}>
                  <ThemeProvider theme={theme}>
                    <AppEnvProvider
                      cdfEnv={env}
                      project={projectName}
                      origin={origin}
                    >
                      <Suspense fallback={<Loader />}>
                        <ToastContainer />
                        <Router>
                          <Routes>
                            <Route
                              path="/:projectName/:subAppPath/create"
                              element={<CreateExtpipe />}
                            />
                            <Route
                              path="/:projectName/:subAppPath/extpipe/:id*"
                              element={<ExtpipePage />}
                            />
                            <Route
                              path="/:projectName/:subAppPath/hosted-extraction-pipeline/:externalId"
                              element={<HostedExtractionPipelineDetails />}
                            />
                            <Route
                              path="/:projectName/:subAppPath"
                              element={<Extpipes />}
                            />
                          </Routes>
                        </Router>
                      </Suspense>
                    </AppEnvProvider>
                  </ThemeProvider>
                  <GlobalStyles theme={theme} />
                </SDKProvider>
              </AuthWrapper>
            </SubAppWrapper>
          </AppScopeStyles>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </FlagProvider>
    </I18nWrapper>
  );
};

export default App;
