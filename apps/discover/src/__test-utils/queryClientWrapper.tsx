import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export const QueryClientWrapper: React.FC = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}> {children} </QueryClientProvider>
  );
};
