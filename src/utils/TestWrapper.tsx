import React from 'react';
import { QueryCache, ReactQueryCacheProvider, setConsole } from 'react-query';
import { MemoryRouter } from 'react-router';

export default function TestWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryCache = new QueryCache({
    defaultConfig: {
      queries: {
        retry: false,
        staleTime: 60000,
        cacheTime: 60000,
      },
    },
  });
  setConsole({
    log: () => {},
    warn: () => {},
    error: () => {},
  });

  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <MemoryRouter>{children}</MemoryRouter>
    </ReactQueryCacheProvider>
  );
}
