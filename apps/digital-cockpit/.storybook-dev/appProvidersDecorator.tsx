import React from 'react';
import { makeDecorator, WrapperSettings } from '@storybook/addons';
import merge from 'lodash/merge';
import { createLocation } from 'history';
import AppProviders from '../src/AppRoot/AppProviders';
import {
  AppProvidersParameters,
  APP_PROVIDERS_PARAMETER_NAME,
} from '../src/storybook/configureStory';
import createBrowserHistory from '../src/utils/history';
import { configureI18n } from '@cognite/react-i18n';
import {
  createMockApiClient,
  createMockCdfClient,
} from '../src/utils/test/client';

type AppProvidersWrapperSettings = {
  parameters: AppProvidersParameters;
} & WrapperSettings;

configureI18n({
  locize: {
    projectId: '',
    apiKey: '',
  },
  lng: 'en',
});

const INITIAL_TEST_STATE = {};

export default makeDecorator({
  name: 'withAppProviders',
  parameterName: APP_PROVIDERS_PARAMETER_NAME,
  skipIfNoParametersOrOptions: false,
  wrapper: (story, context, { parameters }: AppProvidersWrapperSettings) => {
    const {
      redux: storyRedux,
      pathname: maybePathname,
      mockCdfClient,
    } = parameters || {};

    const initialState = merge({}, INITIAL_TEST_STATE, storyRedux);
    const mockCDFClient = mockCdfClient
      ? mockCdfClient(createMockCdfClient())
      : createMockCdfClient();

    const mockAPIClient = createMockApiClient();
    const history = createBrowserHistory();
    // @ts-ignore
    history.location = createLocation(maybePathname);

    return (
      <AppProviders
        initialState={initialState}
        history={history}
        tenant={'fusion'}
        isTesting
        mockApiClient={mockAPIClient}
        mockCDFClient={mockCDFClient}
      >
        {story(context)}
      </AppProviders>
    );
  },
});
