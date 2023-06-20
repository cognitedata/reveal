import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';

import { translations } from '@fusion/industry-canvas';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import collapseStyle from 'rc-collapse/assets/index.css';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  SubAppWrapper,
  AuthWrapper,
  getProject,
  getEnv,
} from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { ErrorBoundary } from '@cognite/react-errors';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import RootApp from './RootApp';

const PROJECT_NAME = 'industrial-canvas';

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
    collapseStyle.use();
    datePickerStyle.use();
    return () => {
      cogsStyles.unuse();
      collapseStyle.unuse();
      datePickerStyle.unuse();
    };
  }, []);

  return (
    <I18nWrapper translations={translations} defaultNamespace={PROJECT_NAME}>
      <SDKProvider sdk={sdk}>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <SubAppWrapper title="Industry Canvas">
              <AuthWrapper
                loadingScreen={<Loader darkMode={false} />}
                login={() => loginAndAuthIfNeeded(project, env)}
              >
                <FlagProvider
                  apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
                  appName="industry-canvas"
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
              </AuthWrapper>
            </SubAppWrapper>
            <ToastContainer />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </ErrorBoundary>
      </SDKProvider>
    </I18nWrapper>
  );
};
