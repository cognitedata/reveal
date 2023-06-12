import React from 'react';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import GlobalStyles from 'apps/cdf-document-search/src/styles/GlobalStyles';
import { setupMixpanel } from 'apps/cdf-document-search/src/utils/config';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { globalConfig } from 'apps/cdf-document-search/src/configs/global.config';
import { MainRouter } from 'apps/cdf-document-search/src/pages/router';

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
