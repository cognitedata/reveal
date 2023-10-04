import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { translations } from '@transformations/common/i18n';
import TransformationDetails from '@transformations/pages/transformation-details/TransformationDetails';
import TransformationList from '@transformations/pages/transformation-list/TransformationList';
import GlobalStyles from '@transformations/styles/GlobalStyles';
import { MAX_NETWORK_RETRIES } from '@transformations/utils';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthContainer, getProject } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';
import { CogniteError } from '@cognite/sdk';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(tries, error: CogniteError | number | unknown | string) {
        if ((error as string) === 'Missing queryFn') {
          return false;
        }
        const status = Number.isFinite(error)
          ? (error as number)
          : (error as CogniteError | undefined)?.status;
        // Tries is null indexed
        if (tries >= MAX_NETWORK_RETRIES - 1) {
          return false;
        }
        if (
          !Number.isFinite(status) ||
          (Number.isFinite(status) && status && status >= 500)
        ) {
          return true;
        }

        return false;
      },
    },
  },
});

const App = () => {
  const project = getProject();
  const baseUrl = '/:projectName';

  return (
    <I18nWrapper translations={translations} defaultNamespace="transformations">
      <FlagProvider
        apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
        appName="transformations"
        projectName={project}
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <AuthContainer
              title="Transform Data"
              sdk={sdk}
              login={loginAndAuthIfNeeded}
            >
              <Router>
                <Routes>
                  <Route
                    path={`${baseUrl}/:subAppPath/:transformationId`}
                    element={<TransformationDetails />}
                  />

                  <Route
                    path={`${baseUrl}/:subAppPath`}
                    element={<TransformationList />}
                  />
                </Routes>
              </Router>
            </AuthContainer>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </FlagProvider>
    </I18nWrapper>
  );
};
export default App;
