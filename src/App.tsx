import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { GlobalStyles } from 'styles/GlobalStyles';
import { translations } from 'common/i18n';
import { ExtractorDetails } from 'components/ExtractorDetails';
import { NewExtractor } from 'components/NewExtractor';

import ExtractorDownloads from './Home/Extractors';
import SourceSystemDetails from 'components/source-system-details/SourceSystemDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

const App = () => {
  const appName = 'cdf-extractor-downloads';
  const projectName = getProject();
  const env = getEnv();

  return (
    <I18nWrapper
      translations={translations}
      defaultNamespace="extractor-downloads"
    >
      <FlagProvider
        apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
        appName={appName}
        projectName={projectName}
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <SubAppWrapper title="Extractor Downloads">
              <AuthWrapper
                loadingScreen={<Loader />}
                login={() => loginAndAuthIfNeeded(projectName, env)}
              >
                <SDKProvider sdk={sdk}>
                  <Router>
                    <Routes>
                      <Route
                        path={`/:project/:subAppPath/new`}
                        element={<NewExtractor />}
                      />
                      <Route
                        path={`/:project/:subAppPath/extractor/:extractorExternalId`}
                        element={<ExtractorDetails />}
                      />
                      <Route
                        path={`/:project/:subAppPath/source-system/:sourceSystemExternalId`}
                        element={<SourceSystemDetails />}
                      />
                      <Route
                        path="/:project/:subAppPath"
                        element={<ExtractorDownloads />}
                      />
                    </Routes>
                  </Router>
                </SDKProvider>
              </AuthWrapper>
            </SubAppWrapper>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </FlagProvider>
    </I18nWrapper>
  );
};

export default App;
