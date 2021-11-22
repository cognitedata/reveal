/* eslint-disable */
import React, { ComponentClass } from 'react';
// Here is where our custom render is being defined, so we don't need this check
/* eslint-disable-next-line @cognite/rtl-use-custom-render-function */
import { render, RenderOptions } from '@testing-library/react';
import { DeepPartial } from 'redux';
import { RootState } from '@platypus-app/redux/store';
import rootReducer from '@platypus-app/redux/store';
import { configureStore } from '@reduxjs/toolkit';

import { INITIAL_TEST_STATE } from './store';
import AppProviders from './AppProviders';

type ExtendedRenderOptions = { redux?: DeepPartial<RootState> };

export type CogniteRenderOptions = Omit<RenderOptions, 'queries'> &
  ExtendedRenderOptions;

export const Wrapper =
  (
    state: DeepPartial<RootState>,
    NestedWrapper?: React.FunctionComponent<{}> | ComponentClass<{}>
  ) =>
  ({ children }: React.PropsWithChildren<{}>) => {
    const newStore = configureStore({
      reducer: rootReducer as any,
      preloadedState: state as any,
      middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware({ serializableCheck: false }),
      ],
    });

    const wrappedChildren = NestedWrapper ? (
      <NestedWrapper>{children}</NestedWrapper>
    ) : (
      children
    );

    return (
      <AppProviders store={newStore} tenant={''}>
        {wrappedChildren}
      </AppProviders>
    );
  };

export default (ui: React.ReactElement, options: CogniteRenderOptions = {}) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const { redux: renderRedux, ...rest } = options;

  const redux = {
    ...INITIAL_TEST_STATE,
    ...renderRedux,
  };

  return render(ui, { ...rest, wrapper: Wrapper(redux) });
};
