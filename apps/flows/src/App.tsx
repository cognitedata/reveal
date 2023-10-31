import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';

import { CANVAS_PATH } from '@flows/common';
import ErrorFeedback from '@flows/common/ErrorFeedback';
import { translations } from '@flows/common/i18n';
import GlobalStyles from '@flows/styles/GlobalStyles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, getProject, SubAppWrapper } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});
const project = getProject();
const ROOT_PATH = `/:tenant/${CANVAS_PATH}`;

const Flow = React.lazy(() => import('@flows/pages/flow/Flow'));
const FlowList = React.lazy(() => import('@flows/pages/flow-list'));

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
              <SubAppWrapper title="Workflows">
                <AuthWrapper
                  loadingScreen={<Loader />}
                  login={() => loginAndAuthIfNeeded()}
                >
                  <SDKProvider sdk={sdk}>
                    <BrowserRouter>
                      <ErrorBoundary FallbackComponent={ErrorFeedback}>
                        <Routes>
                          <Route
                            path={ROOT_PATH}
                            element={
                              <Suspense fallback={<Loader />}>
                                <FlowList />
                              </Suspense>
                            }
                          />
                          <Route
                            path={`${ROOT_PATH}/:externalId`}
                            element={
                              <Suspense fallback={<Loader />}>
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
