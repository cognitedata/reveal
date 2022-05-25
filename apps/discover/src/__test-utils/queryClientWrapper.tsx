import { QueryClient, QueryClientProvider } from 'react-query';

export const QueryClientWrapper: React.FC<
  React.PropsWithChildren<{ queryClient?: QueryClient }>
> = ({ children, queryClient }) => {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // ✅ turns retries off for tests
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient || testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};
