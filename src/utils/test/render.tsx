import React from 'react';
import sdk from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { styleScope } from 'styles/styleScope';

export default (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000,
      },
    },
  });

  const component = (
    <div className={styleScope}>
      <QueryClientProvider client={queryClient}>
        <SDKProvider sdk={sdk}>{ui}</SDKProvider>
      </QueryClientProvider>
    </div>
  );

  return render(component, options);
};
