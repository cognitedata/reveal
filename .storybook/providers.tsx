import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { makeDecorator } from '@storybook/addons';
import { SDKProvider } from '@cognite/sdk-provider';
import sdk from '../src/sdk-singleton';
import store from '../src/store';
import { AntStyles, GlobalStyles } from '../src/styles';
import { AppStateProvider } from '../src/context';

export default makeDecorator({
  name: 'withAppProviders',
  parameterName: 'providersConfig',
  skipIfNoParametersOrOptions: false,
  wrapper: (story, context) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 10 * 60 * 1000, // Pretty long
        },
      },
    });

    return (
      <QueryClientProvider client={queryClient}>
        <GlobalStyles>
          <AntStyles>
            <SDKProvider sdk={sdk}>
              <AppStateProvider>
                <Provider store={store}>{story(context)}</Provider>
              </AppStateProvider>
            </SDKProvider>
          </AntStyles>
        </GlobalStyles>
      </QueryClientProvider>
    );
  },
});
