import React, { JSXElementConstructor } from 'react';
import { BrowserRouter } from 'react-router-dom';
// Here is where our custom render is being defined, so we don't need this check
/* eslint-disable-next-line @cognite/rtl-use-custom-render-function */
import { render as renderImpl } from '@testing-library/react';
import { RenderOptions } from 'typings/tests';
import AppProviders from 'components/AppProviders';
import merge from 'lodash/merge';
import { StoryConfiguration } from 'storybook/configureStory';
import { MOCK_ENVIRONMENT } from 'mocks/environment';

type RenderableComponent<Props, T> = React.ReactElement<
  Props,
  JSXElementConstructor<Props> & { story?: T }
>;

const render = <Props, T extends StoryConfiguration>(
  component: RenderableComponent<Props, T>,
  options: RenderOptions = {}
) => {
  const { story } = component.type;
  const { redux: renderRedux, pathname: renderPathname, ...rest } = options;

  const environment = MOCK_ENVIRONMENT;
  const redux = merge(
    {
      environment: { ...environment, ui: { activePanel: 'workOrder' } },
    },
    renderRedux,
    story ? story.redux : undefined
  );

  console.log('redux', redux);

  const renderResult = renderImpl(
    <AppProviders tenant="" initialState={redux}>
      {component}
    </AppProviders>,
    rest
  );

  return {
    ...renderResult,
    isNull: () => renderResult.container.childElementCount === 0,
    rerender: (nextComponent: React.ReactElement) => {
      return renderResult.rerender(
        <AppProviders tenant="">{nextComponent}</AppProviders>
      );
    },
  };
};

export default render;
