import * as React from 'react';
import Modal from 'react-modal';
import { QueryClient } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { RenderResult, RenderOptions } from '@testing-library/react';
import { renderHook, RenderHookOptions } from '@testing-library/react-hooks';
import { AnyAction, Store } from 'redux';

import { ToastContainer } from '@cognite/cogs.js';
import { ConditionalWrapper } from '@cognite/react-container';

import { render } from '__test-utils/custom-render';
import { getMockedStore } from '__test-utils/store.utils';
import { PartialStoreState } from 'core/types';

import { QueryClientWrapper } from './queryClientWrapper';

export const getWrapper =
  (store: Store<any, AnyAction> | undefined) =>
  ({ children }: { children: React.ReactNode }) =>
    testWrapper({ store, children });

export const testWrapper: React.FC<
  React.PropsWithChildren<{ store?: Store }>
> = ({ store, children }) => {
  return (
    <BrowserRouter>
      <QueryClientWrapper>
        <Provider store={store || getMockedStore()}>{children}</Provider>
      </QueryClientWrapper>
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
  queryClient,
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
        <QueryClientWrapper queryClient={queryClient}>
          {React.createElement(component, props)}
          <ToastContainer />
        </QueryClientWrapper>
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

export const testReRender = (
  rerender: RenderResult['rerender'],
  component: React.FC<any>,
  store?: Store,
  props?: any
) => {
  return rerender(
    <WrappedWithProviders component={component} store={store} props={props} />
  );
};

// this is usefull when you want to share the react-query state across multiple component renders
// eg: for testing caching
export const testRendererForHooks = (
  component: React.FC<any>,
  options?: RenderOptions,
  queryClient?: QueryClient
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
  renderHook<React.PropsWithChildren<TProps>, TResult>(callback, {
    wrapper: ({ children }) => testWrapper({ store, children }),
    ...options,
  });

// use a custom store
// this is the more useful helper
export const renderHookWithStoreChanges = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  extraState: PartialStoreState,
  options?: RenderHookOptions<TProps>
) =>
  renderHook<React.PropsWithChildren<TProps>, TResult>(callback, {
    wrapper: ({ children }) =>
      testWrapper({ store: getMockedStore(extraState), children }),
    ...options,
  });
