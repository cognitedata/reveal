import { FC } from 'react';
import { SDKProvider } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';
import { TEST_PROJECT, TEST_BASE_URL, TEST_APP_ID } from './testConstants';

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off for tests
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
  },
});

const sdk = new CogniteClient({
  appId: TEST_APP_ID,
  baseUrl: TEST_BASE_URL,
  getToken: () => Promise.resolve('fake token'),
  project: TEST_PROJECT,
  noAuthMode: true,
});

export const testWrapper: FC = ({ children }) => {
  return (
    <SDKProvider sdk={sdk}>
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    </SDKProvider>
  );
};

export const renderHookWithWrapper = <TProps, TResult>(
  fn: (props: TProps) => TResult
) => {
  return renderHook<TProps, TResult>(fn, {
    wrapper: ({ children }) => testWrapper({ children }),
  });
};
