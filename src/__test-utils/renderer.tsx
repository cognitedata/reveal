/* eslint-disable react/prop-types */
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { RenderResult } from '@testing-library/react';
import { Store } from 'redux';

import { ToastContainer } from '@cognite/cogs.js';

import { render } from 'src/__test-utils/custom-render';
import { getMockedStore } from 'src/__test-utils/store.utils';

interface Props {
  component: React.FC<any>;
  store?: Store;
  props?: any;
}
const WrappedWithProviders: React.FC<Props> = ({
  store,
  component,
  props = {},
}) => {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store || getMockedStore()}>
          {React.createElement(component, props)}
        </Provider>
        <ToastContainer />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export const testRenderer = (
  component: React.FC<any>,
  store?: Store,
  props?: any
): RenderResult => {
  return render(
    <WrappedWithProviders store={store} component={component} props={props} />
  );
};
