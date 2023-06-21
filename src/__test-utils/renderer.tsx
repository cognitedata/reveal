import React, { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { RenderResult } from '@testing-library/react';
import { Store } from 'redux';

import { ToastContainer } from '@cognite/cogs.js';

import { render } from 'src/__test-utils/custom-render';
import { getMockedStore } from 'src/__test-utils/store.utils';
import { ids } from 'src/cogs-variables';

type Props<T> = {
  store?: Store;
  // eslint-disable-next-line react/no-unused-prop-types
  props?: T;
  children?: ReactNode;
};

export const WrappedWithProviders = <T,>({
  store,
  props,
  children,
}: Props<T>) => {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store || getMockedStore()}>
          {React.cloneElement(children as ReactElement, props)}
        </Provider>
        <ToastContainer />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const StyleWrapper = ({ props, children }: never) => (
  <div className={ids.styleScope}>
    {React.cloneElement(children as ReactElement, props)}
  </div>
);

export const testRenderer = <T,>(
  component: React.FC<never>,
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

// Use this function to render components with cogs.js Modals
// as they need additional style wrapping
export const testRendererModals = <T,>(
  component: React.FC<never>,
  store?: Store,
  props?: T
): RenderResult => {
  const Component = component;
  return render(
    <WrappedWithProviders store={store}>
      <StyleWrapper props={props}>
        <Component />
      </StyleWrapper>
    </WrappedWithProviders>
  );
};
