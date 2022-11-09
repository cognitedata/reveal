import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
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
import { GlobalStyles } from 'styles/GlobalStyles';
import ExtractorDownloads from './Home/Extractors';
import { translations } from 'common/i18n';
import { ExtractorDetails } from 'components/ExtractorDetails';
import { NewExtractor } from 'components/NewExtractor';

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
      flagProviderProps={{
        apiToken: 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE',
        appName,
        projectName,
      }}
      translations={translations}
      defaultNamespace="extractor-downloads"
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
                  <Switch>
                    <Route
                      path={`/:project/:subAppPath/new`}
                      component={NewExtractor}
                    />
                    <Route
                      path={`/:project/:subAppPath/:extractorExternalId`}
                      component={ExtractorDetails}
                    />
                    <Route
                      path="/:project/:subAppPath"
                      component={ExtractorDownloads}
                    />
                  </Switch>
                </Router>
              </SDKProvider>
            </AuthWrapper>
          </SubAppWrapper>
        </GlobalStyles>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </I18nWrapper>
  );
};

export default App;
