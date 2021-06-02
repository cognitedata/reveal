import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from 'src/utils';
import { createMemoryHistory } from 'history';
import configureStore from 'src/store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

export function renderWithProviders(
  ui: any,
  options?: Omit<RenderOptions, 'queries'>
) {
  const history = createMemoryHistory();
  const store = configureStore(history);

  return render(
    <div className={styleScope}>
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    </div>,
    options
  );
}
