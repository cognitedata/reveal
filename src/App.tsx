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
import Home from 'pages/Home';
import GlobalStyles from 'styles/GlobalStyles';
import { FlagProvider } from '@cognite/react-feature-flags';

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

const App = () => {
  return (
    <FlagProvider
      appName="cdf-ui-flows"
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      projectName={project}
    >
      <I18nWrapper
        translations={translations}
        defaultNamespace="cdf-ui-demo-app"
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <SubAppWrapper title="Fusion Demo App">
              <AuthWrapper
                loadingScreen={<Loader />}
                login={() => loginAndAuthIfNeeded(project, env)}
              >
                <SDKProvider sdk={sdk}>
                  <Home />
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
