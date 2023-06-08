import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { translations } from '@access-management/common/i18n';
import Home from '@access-management/pages/Home';
import GlobalStyles from '@access-management/styles/GlobalStyles';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000,
    },
  },
});

const App = () => {
  // const appName = 'cdf-access-management';
  const projectName = getProject();
  const env = getEnv();
  // const flagProviderApiToken = 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';

  return (
    <I18nWrapper
      // flagProviderProps={{
      //   apiToken: flagProviderApiToken,
      //   appName,
      //   projectName,
      // }}
      translations={translations}
      defaultNamespace="access-management"
    >
      <QueryClientProvider client={queryClient}>
        <GlobalStyles>
          <SubAppWrapper title="Access Management">
            <AuthWrapper
              loadingScreen={<Loader />}
              login={() => loginAndAuthIfNeeded(projectName, env)}
            >
              <SDKProvider sdk={sdk}>
                <Router>
                  <Routes>
                    <Route path="/:tenant/:path" element={<Home />} />
                    <Route path="/:tenant/:path/:page" element={<Home />} />
                  </Routes>
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
