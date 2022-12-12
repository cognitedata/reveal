import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { makeDecorator, WrapperSettings } from '@storybook/addons';
import { ToastContainer } from '@cognite/cogs.js';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Container, sdkMock } from '../src/docs/stub';
import { DataExplorationProvider } from '../src';

type DataExplorationProviderParameters = {
  mockCdfClient?: Partial<CogniteClient>;
};

type ExplorerWrapperSettings = {
  parameters: DataExplorationProviderParameters;
} & WrapperSettings;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default makeDecorator({
  name: 'withExplorerConfig',
  parameterName: 'explorerConfig',
  skipIfNoParametersOrOptions: false,
  wrapper: (storyFn, context, { parameters }: ExplorerWrapperSettings) => {
    const { sdkMockOverride = {} } = parameters || {};
    const mockCDFClient = { ...sdkMock, ...sdkMockOverride };

    return (
      <Container>
        <DataExplorationProvider
          sdk={mockCDFClient}
          flow="UNKNOWN"
          userInfo={{}}
        >
          {/* Added toast container to show toast in storybook */}
          <ToastContainer />
          <QueryClientProvider client={queryClient}>
            {storyFn(context)}
          </QueryClientProvider>
        </DataExplorationProvider>
      </Container>
    );
  },
});
