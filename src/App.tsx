import React, { useEffect } from 'react';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import {
  AuthWrapper,
  getEnv,
  getProject,
  SubAppWrapper,
} from '@cognite/cdf-utilities';
import GlobalStyles from 'src/styles/GlobalStyles';
import { setupMixpanel } from 'src/utils/config';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { SDKProvider } from '@cognite/sdk-provider';
import { Loader } from '@cognite/cogs.js';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { globalConfig } from 'src/configs/global.config';
import { MainRouter } from 'src/pages/router';

setupMixpanel();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: 'tracked',
    },
  },
});

const App = () => {
  const project = getProject();
  const env = getEnv();

  if (!project) {
    throw new Error('CDF Project is missing');
  }

  useEffect(() => {
    cogsStyles.use();

    return () => {
      cogsStyles.unuse();
    };
  }, []);

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
