import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import { makeDecorator } from '@storybook/addons';
import configureRender from '../src/app/tests/configureRender';
import AppProviders from '../src/app/tests/AppProviders';

export default makeDecorator({
  name: 'withAppProviders',
  parameterName: 'providersConfig',
  skipIfNoParametersOrOptions: false,
  wrapper: (story, context, { parameters }) => {
    console.log(parameters);
    const { redux } = parameters || {
      redux: undefined,
    };
    const { store } = configureRender({ redux });

    return (
      <AppProviders store={store as any} tenant="">
        {story(context)}
      </AppProviders>
    );
  },
});
