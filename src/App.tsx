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
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { translations } from 'common/i18n';
import GlobalStyles from 'styles/GlobalStyles';
import { FlagProvider } from '@cognite/react-feature-flags';
import Flow from 'pages/flow/Flow';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import FlowList from 'pages/flow-list';
import { CANVAS_PATH } from 'common';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFeedback from 'common/ErrorFeedback';
import { WorkflowBuilderContextProvider } from 'contexts/WorkflowContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});
const env = getEnv();
const project = getProject();
const ROOT_PATH = `/:tenant/${CANVAS_PATH}`;

const App = () => {
  return (
    <FlagProvider
      appName="cdf-flows"
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      projectName={project}
    >
      <I18nWrapper translations={translations} defaultNamespace="flows">
        <QueryClientProvider client={queryClient}>
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
                        <Route path={ROOT_PATH} element={<FlowList />} />
                        <Route
                          path={`${ROOT_PATH}/:id`}
                          element={
                            <WorkflowBuilderContextProvider>
                              <Flow />
                            </WorkflowBuilderContextProvider>
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
        </QueryClientProvider>
      </I18nWrapper>
    </FlagProvider>
  );
};

export default App;
