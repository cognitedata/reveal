import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ConditionalWrapperWithProps } from './ConditionalWrapper';

export const CogniteQueryClientProvider: React.FC = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity, // when to re-fetch if stale
        cacheTime: Infinity,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export const ConditionalQueryClientProvider: React.FC<{
  children: React.ReactElement;
  disabled?: boolean;
}> = ({ disabled, children }) => (
  <ConditionalWrapperWithProps
    condition={!disabled}
    wrap={CogniteQueryClientProvider}
  >
    {children}
  </ConditionalWrapperWithProps>
);
