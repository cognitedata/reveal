import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { SDKProvider } from '@cognite/sdk-provider';

import sdk from '@cognite/cdf-sdk-singleton';

type Props = { children: React.ReactNode };

export const TimeeriesChartProvider = ({ children }: Props) => {
  const queryClient = new QueryClient();

  return (
    <SDKProvider sdk={sdk as any}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SDKProvider>
  );
};
