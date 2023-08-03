import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthContainer } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

import App from './app/App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 10 * 60 * 1000, // Pretty long
    },
  },
});

export const AppWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContainer
        title="Industry Canvas"
        sdk={sdk}
        login={loginAndAuthIfNeeded}
        loadingScreen={<Loader darkMode={false} />}
      >
        <App />
      </AuthContainer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
