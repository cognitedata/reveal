import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SidecarConfig } from '@cognite/sidecar';

import { ConditionalWrapperWithProps } from './ConditionalWrapper';

export const CogniteQueryClientProvider: React.FC<
  React.PropsWithChildren<{
    reactQueryDevtools?: SidecarConfig['reactQueryDevtools'];
  }>
> = ({ reactQueryDevtools, children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity, // when to re-fetch if stale
        cacheTime: Infinity,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {!reactQueryDevtools?.disabled && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position={reactQueryDevtools?.position || 'bottom-right'}
        />
      )}
      {children}
    </QueryClientProvider>
  );
};

export const ConditionalQueryClientProvider: React.FC<{
  children: React.ReactElement;
  disabled?: boolean;
  reactQueryDevtools?: SidecarConfig['reactQueryDevtools'];
}> = ({ disabled, reactQueryDevtools, children }) => (
  <ConditionalWrapperWithProps
    condition={!disabled}
    wrap={CogniteQueryClientProvider}
    reactQueryDevtools={reactQueryDevtools}
  >
    {children}
  </ConditionalWrapperWithProps>
);
