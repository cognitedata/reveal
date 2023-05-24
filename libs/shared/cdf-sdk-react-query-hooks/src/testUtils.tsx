import React, { ReactNode } from 'react';

import {
  DefaultOptions,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

export const renderWithReactQueryCacheProvider = (
  defaultOptions: DefaultOptions = {}
) => {
  const { queries, ...otherOptions } = defaultOptions;
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        ...queries,
      },
      ...otherOptions,
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };

  return wrapper;
};
