import React from 'react';
import Modal from 'react-modal';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { RenderResult, RenderOptions } from '@testing-library/react';
import { renderHook, RenderHookOptions } from '@testing-library/react-hooks';
import { AnyAction, Store } from 'redux';

import { ToastContainer } from '@cognite/cogs.js';
import { ConditionalWrapper } from '@cognite/react-container';

import { render } from '__test-utils/custom-render';
import { getMockedStore } from '__test-utils/store.utils';

export const getWrapper =
  (store: Store<any, AnyAction> | undefined) =>
  ({ children }: { children: React.ReactNode }) =>
    testWrapper({ store, children });

export const testWrapper: React.FC<{ store?: Store }> = ({
  store,
  children,
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // ✅ turns retries off for tests
        retry: false,
      },
    },
  });
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store || getMockedStore()}>{children}</Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

interface Props {
  component: React.FC<any>;
  store?: Store;
  props?: any;
  queryClient?: QueryClient;
}
const WrappedWithProviders: React.FC<Props> = ({
  store,
  component,
  props = {},
  queryClient = new QueryClient(),
}) => {
  const storeWrapper = (children: React.ReactNode) => {
    return store ? (
      <Provider store={store}>{children}</Provider>
    ) : (
      <>{children}</>
    );
  };

  return (
    <BrowserRouter>
      <ConditionalWrapper condition={!!store} wrap={storeWrapper}>
        <QueryClientProvider client={queryClient}>
          {React.createElement(component, props)}
          <ToastContainer />
        </QueryClientProvider>
      </ConditionalWrapper>
    </BrowserRouter>
  );
};

export const testRendererModal = (
  component: React.FC<any>,
  store?: Store,
  props?: any,
  options?: RenderOptions
): any => {
  Modal.setAppElement(document.body);
  const {
    container: _unused,
    rerender,
    ...rest
  } = render(
    <WrappedWithProviders store={store} component={component} props={props} />,
    options
  );

  rerender(
    <WrappedWithProviders
      store={store}
      component={component}
      props={{ ...props, isOpen: true }}
    />
  );
  return rest;
};

export const testRenderer = (
  component: React.FC<any>,
  store?: Store,
  props?: any,
  options?: RenderOptions
): RenderResult => {
  return render(
    <WrappedWithProviders store={store} component={component} props={props} />,
    options
  );
};

// this is usefull when you want to share the react-query state across multiple component renders
// eg: for testing caching
export const testRendererForHooks = (
  component: React.FC<any>,
  queryClient?: QueryClient,
  options?: RenderOptions
): RenderResult => {
  return render(
    <WrappedWithProviders component={component} queryClient={queryClient} />,
    options
  );
};

export const renderHookWithStore = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  store?: Store,
  options?: RenderHookOptions<TProps>
) =>
  renderHook<TProps, TResult>(callback, {
    wrapper: ({ children }) => testWrapper({ store, children }),
    ...options,
  });
