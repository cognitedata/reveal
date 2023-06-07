import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

type Props = { children: React.ReactNode };

export const TimeeriesChartProvider = ({ children }: Props) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
