import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './app/App';
import './set-public-path';

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
  return (
    <QueryClientProvider client={queryClient}>
      <App />;
    </QueryClientProvider>
  );
};
