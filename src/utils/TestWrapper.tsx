import React from 'react';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { MemoryRouter } from 'react-router';

import sdk from 'sdk-singleton';

export default function TestWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryCache = new QueryCache({
    defaultConfig: {
      queries: {
        staleTime: 60000,
        cacheTime: 60000,
        queryFn: sdk.get,
      },
    },
  });

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <MemoryRouter>{children}</MemoryRouter>
    </ReactQueryCacheProvider>
  );
}
