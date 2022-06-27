import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import { makeDecorator } from '@storybook/addons';
import configureRender from '../src/app/tests/configureRender';
import AppProviders from '../src/app/tests/AppProviders';
import { ContainerProvider } from 'brandi-react';
import { rootInjector } from '../src/app/di';
import { CogniteClient } from '@cognite/sdk';
import config from '@platypus-app/config/config';
import { setCogniteSDKClient } from '../src/environments/cogniteSdk';
import { QueryClientProvider } from 'react-query';
import { queryClient } from '../src/app/queryClient';

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
    });
    cogniteClient.setBaseUrl(window.location.origin);
    cogniteClient.setProject('mock');

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
