import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { translations } from '@entity-matching-app/common/i18n';
import Details from '@entity-matching-app/pages/Details';
import RootList from '@entity-matching-app/pages/Home';
import Pipeline from '@entity-matching-app/pages/pipeline';
import QuickMatch from '@entity-matching-app/pages/quick-match';
import GlobalStyles from '@entity-matching-app/styles/GlobalStyles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { CogniteError } from '@cognite/sdk/dist/src';
import { SDKProvider } from '@cognite/sdk-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchIntervalInBackground: true,
      retry(count, error) {
        if ((error as CogniteError).status === 403) {
          return false;
        }
        return count <= 3;
      },
    },
  },
});
const env = getEnv();
const project = getProject();

const App = () => {
  return (
    <FlagProvider
      appName="cdf-ui-entity-matching"
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      projectName={project}
    >
      <I18nWrapper
        translations={translations}
        defaultNamespace="entity-matching"
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <ToastContainer />
            <SubAppWrapper title="Entity matching">
              <AuthWrapper
                loadingScreen={<Loader />}
                login={() => loginAndAuthIfNeeded(project, env)}
              >
                <SDKProvider sdk={sdk}>
                  <BrowserRouter>
                    <Routes>
                      <Route
                        path="/:projectName/:subAppPath"
                        element={<RootList />}
                      />
                      <Route
                        path="/:projectName/:subAppPath/quick-match*"
                        element={<QuickMatch />}
                      />
                      <Route
                        path="/:projectName/:subAppPath/pipeline/:pipelineId*"
                        element={<Pipeline />}
                      />
                      <Route
                        path="/:projectName/:subAppPath/:id"
                        element={<Details />}
                      />
                    </Routes>
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
