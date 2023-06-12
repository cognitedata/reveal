import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';
import { globalConfig } from './configs/global.config';
import { MainRouter } from './pages/router';
import GlobalStyles from './styles';
import { setupMixpanel } from './utils/config';

setupMixpanel();

const queryClient = new QueryClient();

const App = () => {
  const project = getProject();
  const env = getEnv();

  if (!project) {
    throw new Error('CDF Project is missing');
  }

  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <QueryClientProvider client={queryClient}>
      <GlobalStyles>
        <SubAppWrapper title={globalConfig.APP_NAME}>
          <AuthWrapper
            login={() => loginAndAuthIfNeeded(project, env)}
            loadingScreen={<Loader darkMode={false} />}
          >
            <SDKProvider sdk={sdk}>
              <MainRouter />
            </SDKProvider>
          </AuthWrapper>
        </SubAppWrapper>
      </GlobalStyles>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
