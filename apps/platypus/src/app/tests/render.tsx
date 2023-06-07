/* eslint-disable */
import React, { ComponentClass, JSXElementConstructor } from 'react';
// Here is where our custom render is being defined, so we don't need this check
/* eslint-disable-next-line @cognite/rtl-use-custom-render-function */
import { render, RenderOptions } from '@testing-library/react';
import { DeepPartial } from 'redux';
import { RootState } from '@platypus-app/redux/store';
import { rootReducer } from '@platypus-app/redux/store';
import { configureStore } from '@reduxjs/toolkit';

import { INITIAL_TEST_STATE } from './store';
import AppProviders from './AppProviders';
import { StoryConfiguration } from './configureStorybook';
import merge from 'lodash/merge';

type ExtendedRenderOptions = { redux?: DeepPartial<RootState> };

export type CogniteRenderOptions = Omit<RenderOptions, 'queries'> &
  ExtendedRenderOptions;

export const Wrapper =
  (
    state: DeepPartial<RootState>,
    NestedWrapper?: React.ElementType
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

type RenderableComponent<Props, T> = React.ReactElement<
  Props,
  JSXElementConstructor<Props> & { story?: T }
>;

export default <Props, T extends StoryConfiguration>(
  ui: RenderableComponent<Props, T>,
  options: CogniteRenderOptions = {}
) => {
  const { story } = ui.type;

  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const { redux: renderRedux, ...rest } = options;

  const redux = merge(
    INITIAL_TEST_STATE,
    renderRedux,
    story ? story.redux : undefined
  );

  return render(ui, { ...rest, wrapper: Wrapper(redux) });
};
