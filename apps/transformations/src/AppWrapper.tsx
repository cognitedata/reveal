import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MAX_NETWORK_RETRIES } from '@transformations/utils';

import { CogniteError } from '@cognite/sdk';

import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(tries, error: CogniteError | number | unknown | string) {
        if ((error as string) === 'Missing queryFn') {
          return false;
        }
        const status = Number.isFinite(error)
          ? (error as number)
          : (error as CogniteError | undefined)?.status;
        // Tries is null indexed
        if (tries >= MAX_NETWORK_RETRIES - 1) {
          return false;
        }
        if (
          !Number.isFinite(status) ||
          (Number.isFinite(status) && status && status >= 500)
        ) {
          return true;
        }

        return false;
      },
    },
  },
});

export const AppWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};
