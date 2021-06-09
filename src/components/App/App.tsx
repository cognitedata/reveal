import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from 'components/Routes';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { CogniteClient } from '@cognite/sdk';
import { ToastContainer } from '@cognite/cogs.js';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      cacheTime: 60000,
      staleTime: 60000,
    },
  },
});

const sdk = new CogniteClient({
  appId: 'Cognite Charts',
});

export default function RootApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={sdk}>
        <BrowserRouter>
          <ToastContainer />
          <Routes />
        </BrowserRouter>
        <ReactQueryDevtools />
      </SDKProvider>
    </QueryClientProvider>
  );
}
