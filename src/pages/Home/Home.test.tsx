import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import sdk from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Base } from './Home.stories';

describe('<Home />', () => {
  test('renders text', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 10 * 60 * 1000, // Pretty long
        },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <SDKProvider sdk={sdk}>
          <Base />
        </SDKProvider>
      </QueryClientProvider>
    );
    const linkElement = screen.getByText(/My first Cog.js button/i);
    expect(linkElement).toBeInTheDocument();
  });
});
