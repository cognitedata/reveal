import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { localStorageKeys } from '@fdx/shared/constants/localStorageKeys';
import { FDMProvider } from '@fdx/shared/providers/FDMProvider';
import { makeDecorator } from '@storybook/addons';
import { QueryClientProvider } from '@tanstack/react-query';

import { SDKProvider } from '@cognite/sdk-provider';

import { queryClient } from '../src/app/queryClient';

import { NO_PARAMETER, PROJECT } from './constants';
import { mockCogniteClient, mockDataModel } from './mocks';

export const withProviders = makeDecorator({
  name: 'Providers',
  parameterName: NO_PARAMETER,
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context) => {
    return (
      <SDKProvider sdk={mockCogniteClient}>
        <QueryClientProvider client={queryClient}>
          <Router window={window}>
            <Routes>
              <Route
                path="/*"
                element={
                  <FDMProvider>
                    {storyFn(context) as React.ReactNode}
                  </FDMProvider>
                }
              />
            </Routes>
          </Router>
        </QueryClientProvider>
      </SDKProvider>
    );
  },
});

export const withDataModels = makeDecorator({
  name: 'DataModels',
  parameterName: 'dataModels',
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context, { parameters }) => {
    const dataModels = parameters?.dataModels || [mockDataModel];

    global.localStorage.setItem(
      localStorageKeys.dataModels(PROJECT),
      JSON.stringify(dataModels)
    );

    return storyFn(context);
  },
});

export const withResetDataModels = makeDecorator({
  name: 'ResetDataModels',
  parameterName: NO_PARAMETER,
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context) => {
    global.localStorage.removeItem(localStorageKeys.dataModels(PROJECT));
    return storyFn(context);
  },
});
