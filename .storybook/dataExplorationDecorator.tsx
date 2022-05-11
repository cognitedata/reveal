import React from 'react';
import { CogniteClient } from '@cognite/sdk';
import { makeDecorator, WrapperSettings } from '@storybook/addons';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Container, sdkMock } from '../src/docs/stub';
import { DataExplorationProvider } from '../src/context';

type DataExplorationProviderParameters = {
  mockCdfClient?: Partial<CogniteClient>;
};

type ExplorerWrapperSettings = {
  parameters: DataExplorationProviderParameters;
} & WrapperSettings;

const queryClient = new QueryClient();

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
          <QueryClientProvider client={queryClient}>
            {storyFn(context)}
          </QueryClientProvider>
        </DataExplorationProvider>
      </Container>
    );
  },
});
