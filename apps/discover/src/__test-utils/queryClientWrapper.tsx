import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export const QueryClientWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
  );
};
