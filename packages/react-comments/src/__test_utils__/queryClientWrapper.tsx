import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export const QueryClientWrapper: React.FC<
  React.PropsWithChildren<Record<string, unknown>>
> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
  );
};
