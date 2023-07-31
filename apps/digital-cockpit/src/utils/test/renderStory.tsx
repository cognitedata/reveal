import { render as renderImpl } from '@testing-library/react';
import React, { JSXElementConstructor } from 'react';
import AppProviders from 'AppRoot/AppProviders';
import { StoryConfiguration } from 'storybook/configureStory';
import merge from 'lodash/merge';

import { RenderOptions } from './types';
import configureRender from './configureRender';
import { createMockApiClient, createMockCdfClient } from './client';

type RenderableComponent<Props, T> = React.ReactElement<
  Props,
  JSXElementConstructor<Props> & { story?: T }
>;

function render<Props, T extends StoryConfiguration>(
  component: RenderableComponent<Props, T>,
  options: RenderOptions = {}
) {
  const { story } = component.type;
  const { redux: renderRedux, pathname: renderPathname, ...rest } = options;

  const redux = merge(renderRedux, story ? story.redux : undefined);
  const mockCDFClient = createMockCdfClient();
  const mockAPIClient = createMockApiClient();
  const pathname = renderPathname || (story ? story.pathname : undefined);
  const { store, history } = configureRender({ redux, pathname });

  const view = renderImpl(
    <AppProviders
      initialState={redux}
      tenant="fusion"
      history={history}
      isTesting
      mockCDFClient={mockCDFClient}
      mockApiClient={mockAPIClient}
    >
      {component}
    </AppProviders>,
    rest
  );

  return {
    ...view,
    store,
    history,
    expectByTestId: view.getByTestId,
    expectByText: view.getByText,
    expectByDisplayValue: view.getByDisplayValue,
    isNull: () => view.container.childElementCount === 0,
    rerender: (nextComponent: React.ReactElement) => {
      return view.rerender(
        <AppProviders
          initialState={redux}
          tenant="fusion"
          history={history}
          isTesting
          mockCDFClient={mockCDFClient}
          mockApiClient={mockAPIClient}
        >
          {nextComponent}
        </AppProviders>
      );
    },
  };
}

export default render;
