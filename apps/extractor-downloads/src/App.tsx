import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthContainer,
  getProject,
  isUsingUnifiedSignin,
} from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';
import { SDKProvider } from '@cognite/sdk-provider';

import { translations } from './common';
import { CreateConnection } from './components/create-connection';
import { ExtractorDetails } from './components/ExtractorDetails';
import { NewExtractor } from './components/NewExtractor';
import SourceSystemDetails from './components/source-system-details/SourceSystemDetails';
import ExtractorDownloads from './Home/Extractors';
import { GlobalStyles } from './styles/GlobalStyles';

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

  const baseUrl = isUsingUnifiedSignin()
    ? `/cdf/${projectName}`
    : `/${projectName}`;

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
            <SDKProvider sdk={sdk}>
              <AuthContainer
                title="Extractor Downloads"
                sdk={sdk}
                login={loginAndAuthIfNeeded}
              >
                <Router>
                  <Routes>
                    <Route
                      path={`${baseUrl}/:subAppPath/new`}
                      element={<NewExtractor />}
                    />
                    <Route
                      path={`${baseUrl}/:subAppPath/extractor/:extractorExternalId`}
                      element={<ExtractorDetails />}
                    />
                    <Route
                      path={`${baseUrl}/:subAppPath/extractor/:extractorExternalId/create_new_connection`}
                      element={<CreateConnection />}
                    />
                    <Route
                      path={`${baseUrl}/:subAppPath/source-system/:sourceSystemExternalId`}
                      element={<SourceSystemDetails />}
                    />
                    <Route
                      path={`${baseUrl}/:subAppPath`}
                      element={<ExtractorDownloads />}
                    />
                  </Routes>
                </Router>
              </AuthContainer>
            </SDKProvider>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </FlagProvider>
    </I18nWrapper>
  );
};

export default App;
