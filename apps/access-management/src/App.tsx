import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { translations } from '@access-management/common/i18n';
import Home from '@access-management/pages/Home';
import GlobalStyles from '@access-management/styles/GlobalStyles';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { getProject, isUsingUnifiedSignin } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

import { AuthContainer } from './AuthContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

const App = () => {
  const appName = 'cdf-access-management';
  const projectName = getProject();
  const flagProviderApiToken = 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';
  const baseUrl = isUsingUnifiedSignin() ? `/cdf/:tenant` : `/:tenant`;

  return (
    <I18nWrapper
      translations={translations}
      defaultNamespace="access-management"
    >
      <FlagProvider
        apiToken={flagProviderApiToken}
        appName={appName}
        projectName={projectName}
      >
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <AuthContainer>
              <Router>
                <Routes>
                  <Route path={`${baseUrl}/:path*`} element={<Home />} />
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
