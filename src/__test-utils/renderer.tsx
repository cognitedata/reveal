/* eslint-disable react/prop-types */
import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { RenderResult } from '@testing-library/react';
import { Store } from 'redux';

import { ToastContainer } from '@cognite/cogs.js';

import { render } from 'src/__test-utils/custom-render';
import { getMockedStore } from 'src/__test-utils/store.utils';

type Props<T> = {
  store?: Store;
  // eslint-disable-next-line react/no-unused-prop-types
  props?: T;
  children?: ReactNode;
};

export const WrappedWithProviders = <T extends unknown>({
  store,
  props,
  children,
}: Props<T>) => {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store || getMockedStore()}>
          {React.cloneElement(children as ReactElement, { ...(props as {}) })}
        </Provider>
        <ToastContainer />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export const testRenderer = <T extends unknown>(
  component: React.FC<any>,
  store?: Store,
  props?: T
): RenderResult => {
  const Component = component;
  return render(
    <WrappedWithProviders store={store} props={props}>
      <Component />
    </WrappedWithProviders>
  );
};
