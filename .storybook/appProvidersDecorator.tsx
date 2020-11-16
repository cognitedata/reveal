import React from 'react';
import { makeDecorator, WrapperSettings } from '@storybook/addons';
import merge from 'lodash/merge';
import AppProviders from 'components/AppProviders';
import {
  AppProvidersParameters,
  APP_PROVIDERS_PARAMETER_NAME,
} from 'storybook/configureStory';

type AppProvidersWrapperSettings = {
  parameters: AppProvidersParameters;
} & WrapperSettings;

const INITIAL_TEST_STATE = {
  environment: {
    tenant: 'test-tenant',
    user: { email: 'anon-user' },
  },
};

export default makeDecorator({
  name: 'withAppProviders',
  parameterName: APP_PROVIDERS_PARAMETER_NAME,
  skipIfNoParametersOrOptions: false,
  wrapper: (story, context, { parameters }: AppProvidersWrapperSettings) => {
    const { redux: storyRedux } = parameters || {};

    const initialState = merge({}, INITIAL_TEST_STATE, storyRedux);

    return (
      <AppProviders initialState={initialState}>{story(context)}</AppProviders>
    );
  },
});
