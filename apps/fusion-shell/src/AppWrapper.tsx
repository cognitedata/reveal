import { lazy } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { getProject } from '@cognite/cdf-utilities';
import { getOrganization } from '@cognite/login-utils';
import { FlagProvider } from '@cognite/react-feature-flags';

import App from './app/app';
import AntStyles from './app/styles/AntStyles';
import GlobalStyle from './app/styles/GlobalStyle';
import { AuthContainer } from './AuthContainer';
import { translations } from './i18n';

const RedirectApp = lazy(() => import('@cognite/redirect-page'));
const LoginApp = lazy(() => import('@cognite/login-page'));

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

  const org = getOrganization();
  if (!org) {
    return <RedirectApp />;
  }

  const { pathname } = window.location;
  if (pathname === '/') {
    return <LoginApp />;
  }

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
      <AntStyles>
        <I18nWrapper translations={translations} defaultNamespace="navigation">
          <QueryClientProvider client={queryClient}>
            <AuthContainer>
              <RecoilRoot>
                <App />
              </RecoilRoot>
            </AuthContainer>
          </QueryClientProvider>
        </I18nWrapper>
      </AntStyles>
    </FlagProvider>
  );
};
