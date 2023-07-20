import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from './app/App';
import { AuthContainer } from './AuthContainer';

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
      <AuthContainer>
        <App />
      </AuthContainer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
