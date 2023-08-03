import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { AuthContainer, getProject } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';

import App from './app/app';
import { translations } from './i18n';
import GlobalStyle from './app/styles/GlobalStyle';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});

export const AppWrapper = () => {
  const project = getProject();

  return (
    <FlagProvider
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      appName="navigation"
      projectName={project}
      remoteAddress={window.location.hostname}
      disableMetrics
      refreshInterval={86400}
    >
      <GlobalStyle />
      <I18nWrapper translations={translations} defaultNamespace="navigation">
        <QueryClientProvider client={queryClient}>
          <AuthContainer sdk={sdk} login={loginAndAuthIfNeeded}>
            <RecoilRoot>
              <App />
            </RecoilRoot>
          </AuthContainer>
        </QueryClientProvider>
      </I18nWrapper>
    </FlagProvider>
  );
};
