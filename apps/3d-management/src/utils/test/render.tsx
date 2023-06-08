import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from '@3d-management/utils';
import { createMemoryHistory } from 'history';
import configureStore from '@3d-management/store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function renderWithProviders(
  ui: any,
  options?: Omit<RenderOptions, 'queries'>
) {
  const history = createMemoryHistory();
  const store = configureStore(history);
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000, // Pretty long
      },
    },
  });

  return render(
    <div className={styleScope}>
      <QueryClientProvider client={client}>
        <Provider store={store}>
          <MemoryRouter>{ui}</MemoryRouter>
        </Provider>
      </QueryClientProvider>
    </div>,
    options
  );
}
