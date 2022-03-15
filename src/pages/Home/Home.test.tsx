import React from 'react';

import sdk from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';
import { screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { render, setupTranslations } from 'common';

import Home from '.';

describe('<Home />', () => {
  test('renders text', async () => {
    setupTranslations();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 10 * 60 * 1000,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SDKProvider sdk={sdk}>
          <Home />
        </SDKProvider>
      </QueryClientProvider>
    );
    const linkElement = screen.getByTestId('current-language');
    expect(linkElement).toBeInTheDocument();
  });
});
