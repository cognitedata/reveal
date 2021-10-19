import React from 'react';
import Home from 'pages/Home';
import { AuthWrapper, getEnv, SubAppWrapper } from '@cognite/cdf-utilities';
import GlobalStyles from 'styles/GlobalStyles';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  const onLogin = () => {
    return loginAndAuthIfNeeded(sdk.project, getEnv());
  };
  return (
    // If styles are broken please check: .rescripts#PrefixWrap(
    <QueryClientProvider client={queryClient}>
      <GlobalStyles>
        <SubAppWrapper>
          <AuthWrapper showError login={onLogin}>
            <SDKProvider sdk={sdk}>
              <Home />
            </SDKProvider>
          </AuthWrapper>
        </SubAppWrapper>
      </GlobalStyles>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
