import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { translations } from 'common/i18n';
import GlobalStyles from 'styles/GlobalStyles';
import { FlagProvider } from '@cognite/react-feature-flags';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { CANVAS_PATH } from 'common';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFeedback from 'common/ErrorFeedback';
import React, { Suspense } from 'react';
import { ReactFlowProvider } from 'reactflow';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});
const env = getEnv();
const project = getProject();
const ROOT_PATH = `/:tenant/${CANVAS_PATH}`;

const Flow = React.lazy(() => import('pages/flow/Flow'));
const FlowList = React.lazy(() => import('pages/flow-list'));

const App = () => {
  return (
    <FlagProvider
      appName="cdf-flows"
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      projectName={project}
    >
      <I18nWrapper translations={translations} defaultNamespace="flows">
        <QueryClientProvider client={queryClient}>
          <ReactFlowProvider>
            <GlobalStyles>
              <SubAppWrapper title="Flows">
                <AuthWrapper
                  loadingScreen={<Loader />}
                  login={() => loginAndAuthIfNeeded(project, env)}
                >
                  <SDKProvider sdk={sdk}>
                    <BrowserRouter>
                      <ErrorBoundary FallbackComponent={ErrorFeedback}>
                        <Routes>
                          <Route
                            path={ROOT_PATH}
                            element={
                              <Suspense fallback={<div>Loading...</div>}>
                                <FlowList />
                              </Suspense>
                            }
                          />
                          <Route
                            path={`${ROOT_PATH}/:id`}
                            element={
                              <Suspense fallback={<div>Loading...</div>}>
                                <Flow />
                              </Suspense>
                            }
                          />
                        </Routes>
                      </ErrorBoundary>
                    </BrowserRouter>
                  </SDKProvider>
                </AuthWrapper>
              </SubAppWrapper>
            </GlobalStyles>
            <ReactQueryDevtools initialIsOpen={false} />
          </ReactFlowProvider>
        </QueryClientProvider>
      </I18nWrapper>
    </FlagProvider>
  );
};

export default App;
