import React from 'react';

import '@cognite/cogs.js/dist/cogs.css';
import { makeDecorator } from '@storybook/addons';
import { QueryClientProvider } from '@tanstack/react-query';
import { ContainerProvider } from 'brandi-react';

import { CogniteClient } from '@cognite/sdk';

import config from '../src/app/config/config';
import { rootInjector } from '../src/app/di';
import { queryClient } from '../src/app/queryClient';
import AppProviders from '../src/app/tests/AppProviders';
import configureRender from '../src/app/tests/configureRender';
import { setCogniteSDKClient } from '../src/environments/cogniteSdk';

export default makeDecorator({
  name: 'withAppProviders',
  parameterName: 'providersConfig',
  skipIfNoParametersOrOptions: false,
  wrapper: (story, context, { parameters }) => {
    const { redux } = parameters || {
      redux: undefined,
    };
    const { store } = configureRender({ redux });

    const cogniteClient: CogniteClient = new CogniteClient({
      appId: config.APP_APP_ID,
      project: 'mock',
      noAuthMode: true,
      baseUrl: window.location.origin,
      getToken: async () => 'mock',
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cogniteClient.initAPIs();

    setCogniteSDKClient(cogniteClient!);

    return (
      <QueryClientProvider client={queryClient}>
        <ContainerProvider container={rootInjector}>
          <AppProviders store={store as any} tenant="">
            {story(context)}
          </AppProviders>
        </ContainerProvider>
      </QueryClientProvider>
    );
  },
});
