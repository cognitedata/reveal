import React from 'react';
import Modal from 'react-modal';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { RenderResult, RenderOptions } from '@testing-library/react';
import { Store } from 'redux';

import { ToastContainer } from '@cognite/cogs.js';
import { ConditionalWrapper } from '@cognite/react-container';

import { render } from '__test-utils/custom-render';
import { getMockedStore } from '__test-utils/store.utils';
import defaultTheme from 'styles/defaultTheme';
import ThemeProvider from 'styles/ThemeProvider';

export const testWrapper: React.FC<{ store?: Store }> = ({
  store,
  children,
}) => {
  const queryClient = new QueryClient();
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store || getMockedStore()}>
          <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

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
  const StoreWrapper: React.FC = (children) => {
    return store ? (
      <Provider store={store}>{children}</Provider>
    ) : (
      <>{children}</>
    );
  };

  return (
    <BrowserRouter>
      <ConditionalWrapper condition={!!store} wrap={StoreWrapper}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={defaultTheme}>
            {React.createElement(component, props)}
            <ToastContainer />
          </ThemeProvider>
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
  const { container, rerender, ...rest } = render(
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
